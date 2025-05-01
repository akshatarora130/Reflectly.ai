import { NextResponse } from "next/server";
import { authenticateUser } from "@/app/lib/auth-utils";

export async function POST(req: Request) {
  try {
    const requestBody = await req.json();
    const { audio } = requestBody;

    // Authenticate the user
    const auth = await authenticateUser(requestBody);
    if (!auth.authenticated) {
      return auth.response;
    }

    const userId = auth.userId;

    if (!audio) {
      return NextResponse.json(
        { error: "Audio data is required" },
        { status: 400 }
      );
    }

    console.log(`[Transcription] Received audio data from user: ${userId}`);

    // Call the Python Flask backend for transcription
    const response = await fetch("http://localhost:4000/api/transcribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ audio, userId }),
    });

    if (!response.ok) {
      throw new Error(`Flask API returned ${response.status}`);
    }

    const data = await response.json();
    console.log(`[Transcription] Transcription result: ${data.transcription}`);

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Transcription] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
