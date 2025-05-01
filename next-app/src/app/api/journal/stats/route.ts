import { NextResponse } from "next/server";
import prisma from "@/app/db/prisma";
import { authenticateUser } from "@/app/lib/auth-utils";

// Get journal stats for a user
export async function GET(req: Request) {
  try {
    // Get query parameters
    const url = new URL(req.url);

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

    // Get the user's journal stats
    let stats = await prisma.journalStats.findUnique({
      where: {
        userId,
      },
    });

    // If stats don't exist yet, create them
    if (!stats) {
      stats = await prisma.journalStats.create({
        data: {
          userId,
          currentStreak: 0,
          longestStreak: 0,
          totalEntries: 0,
          totalPoints: 0,
        },
      });
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error("[Journal Stats API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
