import { NextResponse } from "next/server";
import prisma from "@/app/db/prisma";
import { authenticateUser } from "@/app/lib/auth-utils";
import { addDays, isSameDay, parseISO } from "date-fns";

// Get journal entries
export async function GET(req: Request) {
  try {
    // Get query parameters
    const url = new URL(req.url);
    const limit = Number.parseInt(url.searchParams.get("limit") || "10");
    const offset = Number.parseInt(url.searchParams.get("offset") || "0");
    const search = url.searchParams.get("search") || undefined;

    // Extract userId from query parameters
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Authenticate the user
    const auth = await authenticateUser({ userId });
    if (!auth.authenticated) {
      return auth.response;
    }

    // Build the where clause
    const where: any = { userId };
    if (search) {
      where.content = {
        contains: search,
        mode: "insensitive", // Case-insensitive search
      };
    }

    // Get journal entries
    const entries = await prisma.journalEntry.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: offset,
    });

    // Count total entries for pagination
    const totalEntries = await prisma.journalEntry.count({
      where,
    });

    return NextResponse.json({
      entries,
      totalEntries,
      hasMore: offset + limit < totalEntries,
    });
  } catch (error) {
    console.error("[Journal Entries API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Create a new journal entry
export async function POST(req: Request) {
  try {
    const requestBody = await req.json();
    const { content, mood } = requestBody;

    // Authenticate the user
    const auth = await authenticateUser(requestBody);
    if (!auth.authenticated) {
      return auth.response;
    }

    const userId = auth.userId;

    // Validate content
    if (
      !content ||
      typeof content !== "string" ||
      content.trim().length === 0
    ) {
      return NextResponse.json(
        { error: "Journal content is required" },
        { status: 400 }
      );
    }

    // Get user's journal stats
    let journalStats = await prisma.journalStats.findUnique({
      where: { userId },
    });

    // Initialize stats if they don't exist
    if (!journalStats) {
      journalStats = await prisma.journalStats.create({
        data: {
          userId,
          currentStreak: 0,
          longestStreak: 0,
          totalEntries: 0,
          totalPoints: 0,
        },
      });
    }

    // Calculate points based on content length and if it's the first entry of the day
    let pointsEarned = 5; // Base points
    if (content.length > 500) pointsEarned += 3;
    if (content.length > 1000) pointsEarned += 2;

    // Check if this is the first entry of the day
    const isFirstEntryToday =
      !journalStats.lastEntryDate ||
      !isSameDay(
        new Date(),
        parseISO(journalStats.lastEntryDate.toISOString())
      );

    // Calculate streak
    let currentStreak = journalStats.currentStreak;
    let streakIncreased = false;

    if (isFirstEntryToday) {
      // If this is the first entry today, check if the last entry was yesterday
      if (journalStats.lastEntryDate) {
        const yesterday = addDays(new Date(), -1);
        const wasYesterday = isSameDay(
          yesterday,
          parseISO(journalStats.lastEntryDate.toISOString())
        );

        if (wasYesterday) {
          // Maintain streak if last entry was yesterday
          currentStreak += 1;
          streakIncreased = true;
          // Bonus points for continuing the streak
          pointsEarned += 3;
        } else {
          // Reset streak if last entry was not yesterday
          currentStreak = 1;
          streakIncreased = true;
        }
      } else {
        // First entry ever
        currentStreak = 1;
        streakIncreased = true;
      }
    }

    // Create the journal entry
    const journalEntry = await prisma.journalEntry.create({
      data: {
        content,
        mood,
        userId,
        pointsEarned,
      },
    });

    // Update user's journal stats
    await prisma.journalStats.update({
      where: { userId },
      data: {
        currentStreak,
        longestStreak: Math.max(journalStats.longestStreak, currentStreak),
        totalEntries: { increment: 1 },
        totalPoints: { increment: pointsEarned },
        lastEntryDate: new Date(),
      },
    });

    return NextResponse.json({
      ...journalEntry,
      streakIncreased,
    });
  } catch (error) {
    console.error("[Journal Entries API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
