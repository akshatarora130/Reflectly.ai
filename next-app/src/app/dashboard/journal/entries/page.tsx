"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Search,
  XCircle,
  Trophy,
  Home,
  Menu,
  X,
  BookOpen,
  PenLine,
} from "lucide-react";
import { format, parseISO, isToday, isYesterday } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface JournalEntry {
  id: string;
  content: string;
  mood: string | null;
  createdAt: string;
  pointsEarned: number;
}

export default function JournalEntriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [totalEntries, setTotalEntries] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const limit = 10;

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Fetch journal entries
  useEffect(() => {
    const fetchEntries = async () => {
      if (status !== "authenticated" || !session?.user?.id) return;

      try {
        setIsLoading(true);
        setError(null);

        const queryParams = new URLSearchParams({
          userId: session.user.id,
          limit: limit.toString(),
          offset: offset.toString(),
        });

        if (searchQuery) {
          queryParams.append("search", searchQuery);
        }

        const response = await fetch(
          `/api/journal/entries?${queryParams.toString()}`
        );

        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }

        const data = await response.json();
        setEntries(data.entries);
        setHasMore(data.hasMore);
        setTotalEntries(data.totalEntries);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load journal entries"
        );
        console.error("Error fetching journal entries:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntries();
  }, [session?.user?.id, status, offset, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setOffset(0); // Reset pagination on new search
  };

  const clearSearch = () => {
    setSearchQuery("");
    setOffset(0);
  };

  const handlePrevPage = () => {
    setOffset(Math.max(0, offset - limit));
  };

  const handleNextPage = () => {
    if (hasMore) {
      setOffset(offset + limit);
    }
  };

  // Format date for display
  const formatEntryDate = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMMM d, yyyy");
  };

  if (status === "loading" || (isLoading && entries.length === 0)) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
        <motion.div
          className="relative w-24 h-24 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="absolute inset-0 rounded-full bg-[#FFE4C4]/30"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          />
          <motion.div
            className="absolute inset-2 rounded-full bg-[#FFE4C4]/50"
            animate={{ scale: [1.1, 1, 1.1] }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: 0.3,
            }}
          />
          <motion.div className="absolute inset-0 flex items-center justify-center">
            <Calendar className="h-10 w-10 text-[#014D4E]" />
          </motion.div>
        </motion.div>

        <motion.h2
          className="text-xl font-semibold text-[#014D4E] mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Loading your entries
        </motion.h2>

        <motion.div
          className="flex space-x-2 mt-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {[0, 1, 2].map((dot) => (
            <motion.div
              key={dot}
              className="w-2.5 h-2.5 rounded-full bg-[#014D4E]"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 1.2,
                repeat: Number.POSITIVE_INFINITY,
                delay: dot * 0.3,
              }}
            />
          ))}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 py-3 px-6 shadow-sm z-20">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
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
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </motion.div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-[#014D4E]" />
              <h1 className="text-xl font-bold text-[#014D4E]">
                Journal Entries
              </h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <motion.button
              onClick={() => router.push("/dashboard")}
              className="text-gray-600 hover:text-[#014D4E] flex items-center gap-1"
              whileHover={{ scale: 1.05 }}
            >
              <Home size={18} className="mr-1" />
              Dashboard
            </motion.button>
            <motion.button
              onClick={() => router.push("/dashboard/journal")}
              className="text-gray-600 hover:text-[#014D4E] flex items-center gap-1"
              whileHover={{ scale: 1.05 }}
            >
              Journal Home
            </motion.button>
            <motion.button
              onClick={() => router.push("/dashboard/ai-companion")}
              className="text-gray-600 hover:text-[#014D4E] flex items-center gap-1"
              whileHover={{ scale: 1.05 }}
            >
              Sage AI Companion
            </motion.button>
          </div>

          <motion.button
            onClick={() => router.push("/dashboard/journal/new")}
            className="bg-[#014D4E] text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-[#013638] transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <PenLine size={16} />
            <span className="hidden sm:inline">New Entry</span>
          </motion.button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white border-b border-gray-200 overflow-hidden md:hidden"
          >
            <div className="px-6 py-4 space-y-3">
              <motion.button
                onClick={() => {
                  router.push("/dashboard");
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 px-3 rounded-md hover:bg-gray-100 flex items-center justify-between"
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center">
                  <Home size={18} className="mr-2" />
                  Dashboard
                </div>
                <ChevronRight size={16} />
              </motion.button>
              <motion.button
                onClick={() => {
                  router.push("/dashboard/journal");
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 px-3 rounded-md hover:bg-gray-100 flex items-center justify-between"
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center">Journal Home</div>
                <ChevronRight size={16} />
              </motion.button>
              <motion.button
                onClick={() => {
                  router.push("/dashboard/ai-companion");
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 px-3 rounded-md hover:bg-gray-100 flex items-center justify-between"
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center">Sage AI Companion</div>
                <ChevronRight size={16} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/dashboard/journal")}
            className="text-[#014D4E] hover:text-[#013638] flex items-center gap-1"
          >
            <ChevronLeft size={16} />
            <span>Back to Journal</span>
          </button>

          <div className="text-gray-500 text-sm hidden md:flex items-center">
            <span>
              Total entries:{" "}
              <strong className="text-[#014D4E]">{totalEntries}</strong>
            </span>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 border border-[#FFE4C4]">
          <form
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-2"
          >
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your journal entries..."
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014D4E] focus:border-transparent"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              )}
            </div>
            <motion.button
              type="submit"
              className="bg-[#014D4E] text-white px-4 py-2 rounded-md hover:bg-[#013638] transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Search
            </motion.button>
          </form>
        </div>

        {/* Entries List */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-[#FFE4C4]">
          <div className="md:hidden text-gray-500 text-sm mb-4">
            Total entries:{" "}
            <strong className="text-[#014D4E]">{totalEntries}</strong>
          </div>

          {entries.length > 0 ? (
            <>
              <div className="space-y-5">
                {entries.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: {
                        delay: index * 0.05,
                      },
                    }}
                    className="p-4 border border-gray-100 rounded-lg hover:shadow-md transition-all cursor-pointer bg-white"
                    whileHover={{ scale: 1.01, backgroundColor: "#FFFAF0" }}
                    onClick={() =>
                      router.push(`/dashboard/journal/entries/${entry.id}`)
                    }
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatEntryDate(entry.createdAt)}
                      </span>
                      {entry.mood && (
                        <span className="text-sm font-medium px-3 py-1 bg-[#FFE4C4]/30 rounded-full text-[#014D4E]">
                          {entry.mood}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-800 line-clamp-3">
                      {entry.content}
                    </p>
                    <div className="flex justify-end mt-2">
                      <span className="text-xs text-gray-500 flex items-center">
                        <Trophy
                          size={12}
                          className="inline mr-1 text-amber-500"
                        />{" "}
                        {entry.pointsEarned} pts
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4">
                <div className="text-sm text-gray-500">
                  Showing {offset + 1}-
                  {Math.min(offset + entries.length, totalEntries)} of{" "}
                  {totalEntries} entries
                </div>
                <div className="flex space-x-2">
                  <motion.button
                    onClick={handlePrevPage}
                    disabled={offset === 0}
                    className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    whileHover={offset !== 0 ? { scale: 1.05 } : {}}
                    whileTap={offset !== 0 ? { scale: 0.95 } : {}}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </motion.button>
                  <motion.button
                    onClick={handleNextPage}
                    disabled={!hasMore}
                    className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    whileHover={hasMore ? { scale: 1.05 } : {}}
                    whileTap={hasMore ? { scale: 0.95 } : {}}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-10 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              {searchQuery ? (
                <>
                  <p className="mb-4">No entries match your search criteria.</p>
                  <button
                    onClick={clearSearch}
                    className="text-[#014D4E] hover:underline"
                  >
                    Clear search
                  </button>
                </>
              ) : (
                <>
                  <p className="mb-4">
                    You haven't written any journal entries yet.
                  </p>
                  <motion.button
                    onClick={() => router.push("/dashboard/journal/new")}
                    className="bg-[#014D4E] text-white px-6 py-3 rounded-md inline-flex items-center gap-2 hover:bg-[#013638] transition-colors shadow-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <PenLine size={16} />
                    <span>Write Your First Entry</span>
                  </motion.button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
