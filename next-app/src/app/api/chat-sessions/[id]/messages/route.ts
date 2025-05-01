import { NextResponse } from "next/server";
import prisma from "@/app/db/prisma";
import type { MessageRole } from "@prisma/client";
import { authenticateUser } from "@/app/lib/auth-utils";

// Add a message to a chat session
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const chatSessionId = params.id;
    const requestBody = await req.json();
    const { content, role } = requestBody;

    // Authenticate the user
    const auth = await authenticateUser(requestBody);
    if (!auth.authenticated) {
      return auth.response;
    }

    const userId = auth.userId;

    // Validate the chat session exists and belongs to the user
    const chatSession = await prisma.chatSession.findFirst({
      where: {
        id: chatSessionId,
        userId: userId,
      },
    });

    if (!chatSession) {
      return NextResponse.json(
        { error: "Chat session not found" },
        { status: 404 }
      );
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        content,
        role: role as MessageRole,
        chatSessionId,
      },
    });

    // Update the chat session's updatedAt timestamp
    await prisma.chatSession.update({
      where: {
        id: chatSessionId,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("[Messages API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
