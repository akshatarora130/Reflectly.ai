import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiUrl = process.env.PYTHON_API_URL || "http://localhost:4000";
    if (!apiUrl) {
      throw new Error("PYTHON_API_URL environment variable is not set");
    }

    const response = await fetch(`${apiUrl}/games/memory-match/pairs`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching memory pairs:", error);
    return NextResponse.json(
      { error: "Failed to fetch memory pairs" },
      { status: 500 }
    );
  }
}
  