import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import prisma from "@/app/db/prisma";
import { NextResponse } from "next/server";

/**
 * Authenticates a user and checks if they exist in the database
 * Also verifies that the userId in the request body matches the authenticated user
 * @param requestBody The request body containing userId
 * @returns An object containing the user ID if authenticated, or a NextResponse with a 401 error
 */
export async function authenticateUser(requestBody: any) {
  // Get the session from NextAuth
  // @ts-ignore
  const session = await getServerSession(authOptions);

  // Check if session exists and has a user
  // @ts-ignore
  if (!session?.user?.id) {
    return {
      authenticated: false,
      response: NextResponse.json(
        { error: "Unauthorized - No valid session" },
        { status: 401 }
      ),
      userId: null,
    };
  }

  // @ts-ignore
  const sessionUserId = session.user.id;

  // Check if userId is provided in the request body
  if (!requestBody?.userId) {
    return {
      authenticated: false,
      response: NextResponse.json(
        { error: "Unauthorized - User ID required in request" },
        { status: 401 }
      ),
      userId: null,
    };
  }

  // Check if the userId in the request body matches the session user
  if (requestBody.userId !== sessionUserId) {
    return {
      authenticated: false,
      response: NextResponse.json(
        { error: "Unauthorized - User ID mismatch" },
        { status: 401 }
      ),
      userId: null,
    };
  }

  // Check if the user exists in the database
  const user = await prisma.user.findUnique({
    where: {
      id: sessionUserId,
    },
  });

  // If user doesn't exist, return 401
  if (!user) {
    return {
      authenticated: false,
      response: NextResponse.json(
        { error: "Unauthorized - User not found" },
        { status: 401 }
      ),
      userId: null,
    };
  }

  // User is authenticated and exists
  return {
    authenticated: true,
    response: null,
    userId: sessionUserId,
  };
}
