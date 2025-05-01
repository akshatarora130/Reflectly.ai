import { NextResponse } from "next/server";
import prisma from "@/app/db/prisma";
import { authenticateUser } from "@/app/lib/auth-utils";

// Get a specific journal entry
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const entryId = params.id;

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

    // Get the journal entry
    const entry = await prisma.journalEntry.findFirst({
      where: {
        id: entryId,
        userId,
      },
    });

    if (!entry) {
      return NextResponse.json(
        { error: "Journal entry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(entry);
  } catch (error) {
    console.error("[Journal Entry API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Update a journal entry
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const entryId = params.id;
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

    // Check if the entry exists and belongs to the user
    const existingEntry = await prisma.journalEntry.findFirst({
      where: {
        id: entryId,
        userId,
      },
    });

    if (!existingEntry) {
      return NextResponse.json(
        { error: "Journal entry not found" },
        { status: 404 }
      );
    }

    // Update the journal entry
    const updatedEntry = await prisma.journalEntry.update({
      where: {
        id: entryId,
      },
      data: {
        content,
        mood,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedEntry);
  } catch (error) {
    console.error("[Journal Entry API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Delete a journal entry
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const entryId = params.id;

    // Extract userId from query parameters
    const url = new URL(req.url);
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

    // Check if the entry exists and belongs to the user
    const existingEntry = await prisma.journalEntry.findFirst({
      where: {
        id: entryId,
        userId,
      },
    });

    if (!existingEntry) {
      return NextResponse.json(
        { error: "Journal entry not found" },
        { status: 404 }
      );
    }

    // First delete any associated analysis
    await prisma.journalAnalysis.deleteMany({
      where: {
        journalEntryId: entryId,
      },
    });

    // Then delete the journal entry
    await prisma.journalEntry.delete({
      where: {
        id: entryId,
      },
    });

    // Update user's journal stats
    await prisma.journalStats.update({
      where: { userId },
      data: {
        totalEntries: { decrement: 1 },
        totalPoints: { decrement: existingEntry.pointsEarned },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Journal Entry API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
