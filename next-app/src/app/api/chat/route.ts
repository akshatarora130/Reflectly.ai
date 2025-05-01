import { NextResponse } from "next/server";
import prisma from "@/app/db/prisma";
import { authenticateUser } from "@/app/lib/auth-utils";
import { MessageRole } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const requestBody = await req.json();
    const { message, sessionId, chatHistory } = requestBody;

    // Authenticate the user
    const auth = await authenticateUser(requestBody);
    if (!auth.authenticated) {
      return auth.response;
    }

    const userId = auth.userId;

    console.log(`[AI Agent] Received message: ${message}`);
    console.log(`[AI Agent] Session ID: ${sessionId}`);
    console.log(`[AI Agent] User ID: ${userId}`);

    // Ensure we have a valid session ID
    let chatSessionId = sessionId;

    // If no session ID or it's "new-chat", create a new chat session
    if (!chatSessionId || chatSessionId === "new-chat") {
      const newChatSession = await prisma.chatSession.create({
        data: {
          name: message.substring(0, 30) + (message.length > 30 ? "..." : ""),
          userId,
        },
      });
      chatSessionId = newChatSession.id;
      console.log(`[AI Agent] Created new chat session: ${chatSessionId}`);
    } else {
      // Verify the chat session belongs to the user
      const chatSession = await prisma.chatSession.findFirst({
        where: {
          id: chatSessionId,
          userId,
        },
      });

      if (!chatSession) {
        return NextResponse.json(
          { error: "Chat session not found or not owned by user" },
          { status: 404 }
        );
      }
    }

    // Save the user message to the database
    const userMessage = await prisma.message.create({
      data: {
        content: message,
        role: MessageRole.USER,
        chatSessionId,
      },
    });

    console.log(`[AI Agent] Saved user message: ${userMessage.id}`);

    // Call the Python Flask backend
    const response = await fetch("http://localhost:4000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        sessionId: chatSessionId,
        userId,
        chatHistory,
      }),
    });

    if (!response.ok) {
      throw new Error(`Flask API returned ${response.status}`);
    }

    const data = await response.json();
    console.log(`[AI Agent] Response: ${JSON.stringify(data)}`);

    // Save the assistant's response to the database
    if (data.messages && data.messages.length > 0) {
      const assistantMessage = await prisma.message.create({
        data: {
          content: data.messages[0],
          role: MessageRole.ASSISTANT,
          chatSessionId,
        },
      });

      console.log(`[AI Agent] Saved assistant message: ${assistantMessage.id}`);

      // Update the chat session's updatedAt timestamp
      await prisma.chatSession.update({
        where: {
          id: chatSessionId,
        },
        data: {
          updatedAt: new Date(),
        },
      });
    }

    // Return the response with the session ID
    return NextResponse.json({
      ...data,
      sessionId: chatSessionId,
    });
  } catch (error) {
    console.error("[AI Agent] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
