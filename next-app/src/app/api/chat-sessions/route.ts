import { NextResponse } from "next/server";
import prisma from "@/app/db/prisma";
import { authenticateUser } from "@/app/lib/auth-utils";

// Get all chat sessions for the current user
export async function GET(req: Request) {
  try {
    // Get query parameters
    const url = new URL(req.url);
    const limit = Number.parseInt(url.searchParams.get("limit") || "10");
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

    // Get chat sessions with the latest message
    const chatSessions = await prisma.chatSession.findMany({
      where: {
        userId: userId,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: limit,
      skip: offset,
    });

    // Count total sessions for pagination
    const totalSessions = await prisma.chatSession.count({
      where: {
        userId: userId,
      },
    });

    return NextResponse.json({
      chatSessions,
      totalSessions,
      hasMore: offset + limit < totalSessions,
    });
  } catch (error) {
    console.error("[Chat Sessions API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Create a new chat session
export async function POST(req: Request) {
  try {
    const requestBody = await req.json();
    const { name } = requestBody;

    // Authenticate the user
    const auth = await authenticateUser(requestBody);
    if (!auth.authenticated) {
      return auth.response;
    }

    const userId = auth.userId;

    const chatSession = await prisma.chatSession.create({
      data: {
        name: name || "New Chat",
        userId,
      },
    });

    return NextResponse.json(chatSession);
  } catch (error) {
    console.error("[Chat Sessions API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
