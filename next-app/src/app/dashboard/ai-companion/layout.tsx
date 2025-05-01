"use client";

import type React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  PlusCircle,
  MessageCircle,
  Loader2,
  LogOut,
  Home,
  Bot,
  Search,
  ChevronDown,
  MenuIcon,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  const filteredSessions = chatSessions.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          >
            <Loader2 className="h-8 w-8 text-[#014D4E]" />
          </motion.div>
          <p className="mt-2 text-[#014D4E]">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 py-3 px-6 shadow-sm z-20">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="md:hidden"
            >
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
              >
                {isMobileMenuOpen ? <X size={20} /> : <MenuIcon size={20} />}
              </button>
            </motion.div>
            <motion.div
              className="flex items-center space-x-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                whileHover={{ rotate: [0, -10, 10, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
              >
                <Bot className="h-8 w-8 text-[#014D4E]" />
              </motion.div>
              <h1 className="text-xl font-bold text-[#014D4E]">
                Talk to AURA
              </h1>
            </motion.div>
          </div>
          <div className="flex items-center space-x-4">
            {/* @ts-ignore */}
            <motion.span
              className="text-sm text-gray-600 hidden md:block"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              Hello, {session?.user?.name || "User"}
            </motion.span>
            <motion.button
              onClick={() => router.push("/api/auth/signout")}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
              title="Sign Out"
              whileHover={{ scale: 1.1, backgroundColor: "#f9f9f9" }}
              whileTap={{ scale: 0.95 }}
            >
              <LogOut size={18} />
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Content Area with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className="fixed inset-0 bg-black/50 z-30 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <AnimatePresence>
          <motion.aside
            className={`w-72 bg-[#FFE4C4] text-[#014D4E] flex flex-col border-r border-[#014D4E]/10 z-40 md:relative md:translate-x-0 fixed inset-y-0 left-0 transform transition-transform duration-300 ease-in-out ${
              isMobileMenuOpen
                ? "translate-x-0"
                : "-translate-x-full md:translate-x-0"
            }`}
            animate={{ x: 0, opacity: 1 }}
            transition={{
              duration: 0.3,
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            style={{
              msOverflowStyle: "none" /* IE and Edge */,
              scrollbarWidth: "none" /* Firefox */,
            }}
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b border-[#014D4E]/10">
              <motion.button
                onClick={createNewChat}
                className="w-full flex items-center justify-center gap-2 bg-[#014D4E] hover:bg-[#013638] text-white py-2 px-4 rounded-md transition-colors shadow-sm relative overflow-hidden group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.span
                  className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.7 }}
                />
                <PlusCircle size={16} />
                <span className="text-sm">New Conversation</span>
              </motion.button>
            </div>

            {/* Navigation Links */}
            <nav className="p-3 border-b border-[#014D4E]/10">
              <AnimatePresence>
                <motion.div
                  key={"dashboard"}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                >
                  <Link
                    href="/dashboard"
                    className="flex items-center p-2 rounded-md hover:bg-[#f5d4b0] transition-colors"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="mr-2 text-[#014D4E]/80"
                    >
                      <Home size={16} />
                    </motion.div>
                    <span className="text-sm">Dashboard</span>
                  </Link>
                </motion.div>
                <motion.div
                  key={"ai-companion"}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  <Link
                    href="/dashboard/ai-companion"
                    className="flex items-center p-2 rounded-md hover:bg-[#f5d4b0] transition-colors mt-1 bg-[#f5d4b0]/60"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="mr-2 text-[#014D4E]"
                    >
                      <Bot size={16} />
                    </motion.div>
                    <span className="text-sm font-medium">AI Companion</span>
                  </Link>
                </motion.div>
              </AnimatePresence>
            </nav>

            {/* Search Box */}
            <div className="p-3 border-b border-[#014D4E]/10">
              <motion.div
                className="relative"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  size={14}
                />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-md border border-[#014D4E]/20 bg-white/80 focus:outline-none focus:ring-1 focus:ring-[#014D4E]/30 transition-all duration-200 text-sm"
                />
              </motion.div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  className="mx-3 mt-3 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded-md text-xs shadow-sm"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Chat Sessions List */}
            <div
              className="flex-1 overflow-y-auto p-2"
              style={{
                msOverflowStyle: "none" /* IE and Edge */,
                scrollbarWidth: "none" /* Firefox */,
              }}
            >
              <style jsx>{`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}</style>

              <motion.h3
                className="text-xs font-semibold px-2 py-1 text-[#014D4E]/80 uppercase tracking-wider"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.3 }}
              >
                Recent Conversations
              </motion.h3>

              <div className="mt-2 space-y-2">
                <AnimatePresence>
                  {filteredSessions.map((chat, index) => (
                    <motion.div
                      key={chat.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * (index % 10), duration: 0.3 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <Link
                        href={`/dashboard/ai-companion?sessionId=${chat.id}`}
                        className="block rounded-lg transition-all duration-200 hover:bg-[#f5d4b0]/50"
                      >
                        <div className="p-3 bg-white/60 rounded-lg">
                          <div className="flex items-start">
                            <div className="bg-[#f5d4b0] rounded-full p-2 mr-3 flex-shrink-0">
                              <MessageCircle
                                size={14}
                                className="text-[#014D4E]/70"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium truncate text-[#014D4E] text-sm">
                                  {chat.name}
                                </h4>
                                <ChevronDown className="h-4 w-4 text-[#014D4E]/40 ml-1 flex-shrink-0" />
                              </div>
                              {chat.messages.length > 0 && (
                                <p className="text-xs text-[#014D4E]/60 truncate mt-0.5">
                                  {chat.messages[0].content.substring(0, 40)}
                                  {chat.messages[0].content.length > 40
                                    ? "..."
                                    : ""}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isLoadingChats && (
                  <div className="flex justify-center p-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                      }}
                    >
                      <Loader2 size={16} className="text-[#014D4E]" />
                    </motion.div>
                  </div>
                )}

                {hasMoreChats && !isLoadingChats && (
                  <motion.button
                    onClick={loadMoreChats}
                    className="w-full p-2 text-xs text-center text-[#014D4E] hover:bg-[#f5d4b0] rounded-md transition-colors font-medium mt-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Load more conversations
                  </motion.button>
                )}

                {filteredSessions.length === 0 && !isLoadingChats && (
                  <motion.div
                    className="text-xs text-[#014D4E]/60 p-4 text-center rounded-md bg-white/60 mt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    <div className="flex flex-col items-center">
                      <MessageCircle className="h-6 w-6 text-[#014D4E]/30 mb-2" />
                      {searchQuery
                        ? "No matching conversations found"
                        : "No conversations yet"}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Sidebar Footer */}
            <div className="p-2 border-t border-[#014D4E]/10">
              <motion.div
                className="flex items-center text-xs text-[#014D4E]/60 justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <Bot className="h-3 w-3 mr-1" /> Reflectly.AI  ©{" "}
                {new Date().getFullYear()}
              </motion.div>
            </div>
          </motion.aside>
        </AnimatePresence>

        {/* Main Content */}
        <motion.main
          className="flex-1 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
