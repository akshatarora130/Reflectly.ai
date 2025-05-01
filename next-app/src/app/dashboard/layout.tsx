"use client";

import type React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusCircle, MessageCircle, Loader2 } from "lucide-react";

interface ChatSession {
  id: string;
  name: string;
  messages: {
    content: string;
    role: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [hasMoreChats, setHasMoreChats] = useState(false);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const limit = 10;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Fetch chat sessions when component mounts
  useEffect(() => {
    // @ts-ignore
    if (status === "authenticated" && session?.user?.id) {
      fetchChatSessions();
    }
    // @ts-ignore
  }, [status, session?.user?.id]);

  const fetchChatSessions = async (loadMore = false) => {
    // @ts-ignore
    if (!session?.user?.id) return;

    setError(null);
    try {
      setIsLoadingChats(true);
      const newOffset = loadMore ? offset + limit : 0;

      const response = await fetch(
        // @ts-ignore
        `/api/chat-sessions?limit=${limit}&offset=${newOffset}&userId=${session.user.id}`
      );

      if (response.status === 401) {
        setError("Unauthorized. Please log in again.");
        router.push("/login");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API returned ${response.status}`);
      }

      const data = await response.json();

      if (loadMore) {
        setChatSessions((prev) => [...prev, ...data.chatSessions]);
      } else {
        setChatSessions(data.chatSessions);
      }

      setHasMoreChats(data.hasMore);
      setOffset(newOffset);
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load chat sessions"
      );
    } finally {
      setIsLoadingChats(false);
    }
  };

  const createNewChat = async () => {
    // @ts-ignore
    if (!session?.user?.id) return;

    setError(null);
    try {
      const response = await fetch("/api/chat-sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "New Chat",
          // @ts-ignore
          userId: session.user.id,
        }),
      });

      if (response.status === 401) {
        setError("Unauthorized. Please log in again.");
        router.push("/login");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API returned ${response.status}`);
      }

      const newSession = await response.json();
      router.push(`/dashboard/ai-companion?sessionId=${newSession.id}`);

      // Refresh the chat sessions list
      fetchChatSessions();
    } catch (error) {
      console.error("Error creating new chat session:", error);
      setError(
        error instanceof Error ? error.message : "Failed to create new chat"
      );
    }
  };

  const loadMoreChats = () => {
    if (!isLoadingChats && hasMoreChats) {
      fetchChatSessions(true);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <div className="w-64 bg-[#FFE4C4] text-[#014D4E] p-4 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Dashboard</h2>
          <button
            onClick={createNewChat}
            className="p-1 rounded-full hover:bg-[#f5d4b0] text-[#014D4E]"
            title="New Chat"
          >
            <PlusCircle size={20} />
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <nav className="space-y-2 mb-4">
          <Link
            href="/dashboard"
            className="block p-2 rounded hover:bg-[#f5d4b0]"
          >
            Home
          </Link>
          <Link
            href="/dashboard/ai-companion"
            className="block p-2 rounded hover:bg-[#f5d4b0]"
          >
            AI Companion
          </Link>
        </nav>

        <div className="border-t border-[#014D4E]/20 pt-4 mb-2">
          <h3 className="text-sm font-semibold mb-2">Recent Chats</h3>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1">
          {chatSessions.map((chat) => (
            <Link
              key={chat.id}
              href={`/dashboard/ai-companion?sessionId=${chat.id}`}
              className="block p-2 rounded hover:bg-[#f5d4b0] text-sm truncate"
            >
              <div className="flex items-center">
                <MessageCircle size={16} className="mr-2 flex-shrink-0" />
                <span className="truncate">{chat.name}</span>
              </div>
              {chat.messages.length > 0 && (
                <p className="text-xs text-gray-600 truncate ml-6 mt-1">
                  {chat.messages[0].content.substring(0, 30)}
                  {chat.messages[0].content.length > 30 ? "..." : ""}
                </p>
              )}
            </Link>
          ))}

          {isLoadingChats && (
            <div className="flex justify-center p-2">
              <Loader2 size={16} className="animate-spin" />
            </div>
          )}

          {hasMoreChats && !isLoadingChats && (
            <button
              onClick={loadMoreChats}
              className="w-full p-2 text-sm text-center text-[#014D4E] hover:bg-[#f5d4b0] rounded"
            >
              Load more
            </button>
          )}

          {chatSessions.length === 0 && !isLoadingChats && (
            <div className="text-sm text-gray-500 p-2 text-center">
              No chat history yet
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6 overflow-auto">{children}</div>
    </div>
  );
}
