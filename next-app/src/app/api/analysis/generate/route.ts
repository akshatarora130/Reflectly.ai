import { NextResponse } from "next/server";
import prisma from "@/app/db/prisma";
import { authenticateUser } from "@/app/lib/auth-utils";

export async function GET(req: Request) {
  try {
    // Get query parameters
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

    // Fetch all chat sessions for the user
    const chatSessions = await prisma.chatSession.findMany({
      where: {
        userId: userId,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Fetch all journal entries for the user
    const journalEntries = await prisma.journalEntry.findMany({
      where: {
        userId: userId,
      },
      include: {
        analysis: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Prepare data for the Python backend
    const chatHistory = chatSessions.flatMap((session) =>
      session.messages.map((message) => ({
        role: message.role,
        content: message.content,
        timestamp: message.createdAt.toISOString(),
        sessionId: session.id,
      }))
    );

    const journalData = journalEntries.map((entry) => ({
      id: entry.id,
      content: entry.content,
      mood: entry.mood,
      timestamp: entry.createdAt.toISOString(),
      analysis: entry.analysis ? entry.analysis.result : null,
    }));

    // Call the Python backend to generate the combined report
    const response = await fetch(
      `${
        process.env.PYTHON_API_URL || "http://localhost:4000"
      }/api/combined-analysis`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          chatHistory,
          journalData,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("[Analysis API] Python backend error:", errorData);
      return NextResponse.json(
        { error: "Failed to generate analysis from Python backend" },
        { status: response.status }
      );
    }

    const analysisReport = await response.json();
    return NextResponse.json(analysisReport);
  } catch (error) {
    console.error("[Analysis API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
