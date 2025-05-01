import { NextResponse } from "next/server";
import prisma from "@/app/db/prisma";
import { authenticateUser } from "@/app/lib/auth-utils";

// Get a specific chat session with messages
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const chatSessionId = params.id;

    // Get query parameters for pagination
    const url = new URL(req.url);
    const limit = Number.parseInt(url.searchParams.get("limit") || "20");
    const offset = Number.parseInt(url.searchParams.get("offset") || "0");

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

    // Get the chat session
    const chatSession = await prisma.chatSession.findFirst({
      where: {
        id: chatSessionId,
        userId: userId,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
          take: limit,
          skip: offset,
        },
      },
    });

    if (!chatSession) {
      return NextResponse.json(
        { error: "Chat session not found" },
        { status: 404 }
      );
    }

    // Count total messages for pagination
    const totalMessages = await prisma.message.count({
      where: {
        chatSessionId,
      },
    });

    return NextResponse.json({
      chatSession,
      totalMessages,
      hasMore: offset + limit < totalMessages,
    });
  } catch (error) {
    console.error("[Chat Session API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Update a chat session
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const chatSessionId = params.id;
    const requestBody = await req.json();
    const { name } = requestBody;

    // Authenticate the user
    const auth = await authenticateUser(requestBody);
    if (!auth.authenticated) {
      return auth.response;
    }

    const userId = auth.userId;

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

    const updatedChatSession = await prisma.chatSession.update({
      where: {
        id: chatSessionId,
      },
      data: {
        name,
      },
    });

    return NextResponse.json(updatedChatSession);
  } catch (error) {
    console.error("[Chat Session API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Delete a chat session
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const chatSessionId = params.id;

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

    await prisma.chatSession.delete({
      where: {
        id: chatSessionId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Chat Session API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
