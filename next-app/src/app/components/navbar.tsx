"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const isLoggedIn = status === "authenticated";

  // Don't show navbar on login page
  if (pathname === "/login") return null;

  return (
    <nav className="bg-[#014D4E] text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          reflectly.ai
        </Link>

        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <>
              <Link href="/dashboard" className="hover:text-[#FFE4C4]">
                Dashboard
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="bg-[#FFE4C4] text-[#014D4E] px-4 py-2 rounded-md hover:bg-[#f5d4b0]"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="bg-[#FFE4C4] text-[#014D4E] px-4 py-2 rounded-md hover:bg-[#f5d4b0]"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
