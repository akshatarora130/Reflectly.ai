import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { audio } = await req.json();

    if (!audio) {
      return NextResponse.json(
        { error: "Audio data is required" },
        { status: 400 }
      );
    }

    console.log(
      `[Transcription] Received audio data from user: ${session.user.email}`
    );

    // Call the Python Flask backend for transcription
    const response = await fetch("http://localhost:4000/api/transcribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ audio }),
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
