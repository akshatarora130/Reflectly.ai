import { NextResponse } from "next/server";
import prisma from "@/app/db/prisma";
import { authenticateUser } from "@/app/lib/auth-utils";

// Generate or retrieve analysis for a journal entry
export async function POST(req: Request) {
  try {
    const requestBody = await req.json();
    const { journalEntryId, content } = requestBody;

    // Authenticate the user
    const auth = await authenticateUser(requestBody);
    if (!auth.authenticated) {
      return auth.response;
    }

    const userId = auth.userId;

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

    // Check if analysis already exists
    const existingAnalysis = await prisma.journalAnalysis.findUnique({
      where: {
        journalEntryId,
      },
    });

    if (existingAnalysis) {
      return NextResponse.json(existingAnalysis);
    }

    // Call the Python backend to generate analysis
    console.log(
      `[Journal Analysis] Requesting analysis for entry: ${journalEntryId}`
    );

    const response = await fetch("http://localhost:4000/api/journal/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        journalEntryId,
        content: journalEntry.content,
        userId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Analysis API returned ${response.status}`);
    }

    const analysisResult = await response.json();
    console.log(`[Journal Analysis] Analysis result received`);

    // Save the analysis to the database
    const analysis = await prisma.journalAnalysis.create({
      data: {
        journalEntryId,
        result: analysisResult,
      },
    });

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("[Journal Analysis API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
