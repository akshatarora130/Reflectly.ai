import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Ensure consistent secret usage
const NEXTAUTH_SECRET =
  process.env.NEXTAUTH_SECRET || "MQPR02Jmm33WRvqjEBj2EMLfq5zNCVtt6z9aFbSDifw=";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: NEXTAUTH_SECRET,
  });

  const isAuthenticated = !!token;

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith("/dashboard") && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect authenticated users away from login page
  if (request.nextUrl.pathname.startsWith("/login") && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
