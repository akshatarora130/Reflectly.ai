import { NextResponse } from "next/server";
import prisma from "@/app/db/prisma";
import { authenticateUser } from "@/app/lib/auth-utils";

// Get analysis for a specific journal entry
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const journalEntryId = params.id;

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

    // Check if the journal entry exists and belongs to the user
    const journalEntry = await prisma.journalEntry.findFirst({
      where: {
        id: journalEntryId,
        userId,
      },
    });

    if (!journalEntry) {
      return NextResponse.json(
        { error: "Journal entry not found" },
        { status: 404 }
      );
    }

    // Get the analysis
    const analysis = await prisma.journalAnalysis.findUnique({
      where: {
        journalEntryId,
      },
    });

    if (!analysis) {
      return NextResponse.json(
        { error: "Analysis not found for this journal entry" },
        { status: 404 }
      );
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("[Journal Analysis API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
