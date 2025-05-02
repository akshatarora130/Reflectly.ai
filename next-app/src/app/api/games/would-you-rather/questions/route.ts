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
    const count = searchParams.get("count") || "10";
    const category = searchParams.get("category") || "general";

    // Call the Python backend
    const response = await fetch(
      `${
        process.env.PYTHON_API_URL || "http://localhost:4000"
      }/api/games/would-you-rather/questions?count=${count}&category=${category}`,
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
    console.error("Error fetching would you rather questions:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch questions",
      },
      { status: 500 }
    );
  }
}
