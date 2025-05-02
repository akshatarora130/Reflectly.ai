import { NextResponse } from "next/server";
import prisma from "@/app/db/prisma";
import { authenticateUser } from "@/app/lib/auth-utils";

export async function POST(req: Request) {
  try {
    const requestBody = await req.json();
    const { sessionId } = requestBody;

    // Authenticate the user
    const auth = await authenticateUser(requestBody);
    if (!auth.authenticated) {
      return auth.response;
    }

    const userId = auth.userId;

    // Verify the chat session belongs to the user
    const chatSession = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!chatSession) {
      return NextResponse.json(
        { error: "Chat session not found or not owned by user" },
        { status: 404 }
      );
    }

    // Check if there are enough messages
    if (chatSession.messages.length < 10) {
      return NextResponse.json(
        {
          error:
            "Not enough messages to generate a report. Minimum 10 required.",
        },
        { status: 400 }
      );
    }

    // Format the chat history for the Python backend
    const chatHistory = chatSession.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Call the Python backend to generate the report
    console.log(`[Chat Report] Requesting report for session: ${sessionId}`);
    const response = await fetch("http://localhost:4000/api/chat/report", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sessionId,
        userId,
        chatHistory,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API returned ${response.status}`);
    }

    const reportData = await response.json();
    console.log(`[Chat Report] Report generated successfully`);

    return NextResponse.json(reportData);
  } catch (error) {
    console.error("[Chat Report API] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate chat report" },
      { status: 500 }
    );
  }
}
