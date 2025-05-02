import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    // @ts-ignore
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const difficulty = searchParams.get("difficulty") || "medium";
    const theme = searchParams.get("theme") || "general";

    // Call the Python backend
    const response = await fetch(
      `${
        process.env.PYTHON_API_URL || "http://localhost:4000"
      }/api/games/word-drop/content?difficulty=${difficulty}&theme=${theme}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API returned ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching word drop game content:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch game content",
      },
      { status: 500 }
    );
  }
}
