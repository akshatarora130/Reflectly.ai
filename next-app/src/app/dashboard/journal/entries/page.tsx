"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Search,
  XCircle,
  Trophy,
} from "lucide-react";
import { format, parseISO, isToday, isYesterday } from "date-fns";
import { motion } from "framer-motion";

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
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#014D4E]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold text-[#014D4E] mb-4 md:mb-0">
          Journal Entries
        </h1>
        <button
          onClick={() => router.push("/dashboard/journal")}
          className="text-[#014D4E] hover:text-[#013638] flex items-center gap-1"
        >
          <ChevronLeft size={16} />
          <span>Back to Journal</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-md p-4 border border-[#FFE4C4] mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
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
          <button
            type="submit"
            className="bg-[#014D4E] text-white px-4 py-2 rounded-md hover:bg-[#013638] transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Entries List */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-[#FFE4C4] mb-6">
        {entries.length > 0 ? (
          <>
            <div className="space-y-6">
              {entries.map((entry) => (
                <motion.div
                  key={entry.id}
                  className="p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  whileHover={{ scale: 1.01 }}
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
                      <span className="text-sm font-medium px-2 py-1 bg-gray-100 rounded-full">
                        {entry.mood}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-800 line-clamp-3">{entry.content}</p>
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
            <div className="flex justify-between items-center mt-8">
              <div className="text-sm text-gray-500">
                Showing {offset + 1}-
                {Math.min(offset + entries.length, totalEntries)} of{" "}
                {totalEntries} entries
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handlePrevPage}
                  disabled={offset === 0}
                  className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={!hasMore}
                  className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
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
                  className="bg-[#014D4E] text-white px-4 py-2 rounded-md inline-flex items-center gap-2 hover:bg-[#013638] transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Write Your First Entry
                </motion.button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
