"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Trophy,
  BookOpen,
  PenLine,
  ArrowRight,
  Home,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { format, parseISO, isToday, differenceInDays } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface JournalStats {
  currentStreak: number;
  longestStreak: number;
  totalEntries: number;
  totalPoints: number;
  lastEntryDate: string | null;
}

interface JournalEntry {
  id: string;
  content: string;
  mood: string | null;
  createdAt: string;
  pointsEarned: number;
}

export default function JournalPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [journalStats, setJournalStats] = useState<JournalStats | null>(null);
  const [recentEntries, setRecentEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [streakAnimation, setStreakAnimation] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Fetch journal stats and recent entries
  useEffect(() => {
    const fetchJournalData = async () => {
      if (status !== "authenticated" || !session?.user?.id) return;

      try {
        setIsLoading(true);
        setError(null);

        // Fetch journal stats
        const statsResponse = await fetch(
          `/api/journal/stats?userId=${session.user.id}`
        );

        if (!statsResponse.ok) {
          throw new Error(`Stats API returned ${statsResponse.status}`);
        }

        const statsData = await statsResponse.json();
        setJournalStats(statsData);

        // Fetch recent entries
        const entriesResponse = await fetch(
          `/api/journal/entries?userId=${session.user.id}&limit=5&offset=0`
        );

        if (!entriesResponse.ok) {
          throw new Error(`Entries API returned ${entriesResponse.status}`);
        }

        const entriesData = await entriesResponse.json();
        setRecentEntries(entriesData.entries);

        // Trigger streak animation if there's a streak
        if (statsData.currentStreak > 0) {
          setTimeout(() => setStreakAnimation(true), 500);
          setTimeout(() => setStreakAnimation(false), 3000);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load journal data"
        );
        console.error("Error fetching journal data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJournalData();
  }, [session?.user?.id, status]);

  // Check if user has journaled today
  const hasJournaledToday = journalStats?.lastEntryDate
    ? isToday(parseISO(journalStats.lastEntryDate))
    : false;

  // Calculate days since last entry
  const daysSinceLastEntry = journalStats?.lastEntryDate
    ? differenceInDays(new Date(), parseISO(journalStats.lastEntryDate))
    : null;

  if (status === "loading" || isLoading) {
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
            <BookOpen className="h-10 w-10 text-[#014D4E]" />
          </motion.div>
        </motion.div>

        <motion.h2
          className="text-xl font-semibold text-[#014D4E] mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Loading your journal
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
                Reflectily Journal
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
              onClick={() => router.push("/dashboard/ai-companion")}
              className="text-gray-600 hover:text-[#014D4E] flex items-center gap-1"
              whileHover={{ scale: 1.05 }}
            >
              Sage AI Companion
            </motion.button>
            <motion.button
              onClick={() => router.push("/dashboard/journal/entries")}
              className="text-gray-600 hover:text-[#014D4E] flex items-center gap-1"
              whileHover={{ scale: 1.05 }}
            >
              All Entries
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
                  router.push("/dashboard/ai-companion");
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 px-3 rounded-md hover:bg-gray-100 flex items-center justify-between"
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center">Sage AI Companion</div>
                <ChevronRight size={16} />
              </motion.button>
              <motion.button
                onClick={() => {
                  router.push("/dashboard/journal/entries");
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 px-3 rounded-md hover:bg-gray-100 flex items-center justify-between"
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center">All Journal Entries</div>
                <ChevronRight size={16} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <h1 className="text-3xl font-bold text-[#014D4E] mb-4 md:mb-0">
            Your Journal
          </h1>
          <motion.button
            onClick={() => router.push("/dashboard/journal/new")}
            className="bg-[#014D4E] text-white px-6 py-3 rounded-md flex items-center gap-2 hover:bg-[#013638] transition-colors shadow-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <PenLine size={18} />
            <span>
              {hasJournaledToday ? "Add Another Entry" : "Write Today's Entry"}
            </span>
          </motion.button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Streak Card */}
          <motion.div
            className="bg-white rounded-xl shadow-md p-6 border border-[#FFE4C4] hover:shadow-lg transition-shadow"
            animate={
              streakAnimation
                ? {
                    scale: [1, 1.05, 1],
                    boxShadow: [
                      "0 4px 6px rgba(255, 228, 196, 0.1)",
                      "0 10px 15px rgba(255, 228, 196, 0.3)",
                      "0 4px 6px rgba(255, 228, 196, 0.1)",
                    ],
                  }
                : {}
            }
            transition={{ duration: 1 }}
            whileHover={{ translateY: -5 }}
          >
            <div className="flex items-center mb-4">
              <div
                className={`h-12 w-12 rounded-full flex items-center justify-center ${
                  streakAnimation ? "bg-amber-100" : "bg-[#FFE4C4]"
                }`}
              >
                <Trophy
                  className={`h-6 w-6 ${
                    streakAnimation ? "text-amber-500" : "text-[#014D4E]"
                  }`}
                />
              </div>
              <h2 className="ml-3 text-xl font-semibold text-[#014D4E]">
                Streak
              </h2>
            </div>
            <div className="flex items-baseline">
              <span className="text-4xl font-bold text-[#014D4E]">
                {journalStats?.currentStreak || 0}
              </span>
              <span className="ml-2 text-sm text-gray-500">
                days ({journalStats?.longestStreak || 0} best)
              </span>
            </div>

            <div className="mt-3 text-sm text-gray-600">
              {hasJournaledToday ? (
                <motion.span
                  className="text-green-600 font-medium flex items-center gap-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                  Journaled today!
                </motion.span>
              ) : daysSinceLastEntry === 1 ? (
                <span className="text-amber-600 font-medium">
                  Journal today to maintain your streak!
                </span>
              ) : (
                <span className="text-gray-500">
                  {journalStats?.lastEntryDate
                    ? `Last entry: ${format(
                        parseISO(journalStats.lastEntryDate),
                        "MMM d, yyyy"
                      )}`
                    : "No entries yet. Start today!"}
                </span>
              )}
            </div>
          </motion.div>

          {/* Entries Card */}
          <motion.div
            className="bg-white rounded-xl shadow-md p-6 border border-[#FFE4C4] hover:shadow-lg transition-shadow"
            whileHover={{ translateY: -5 }}
          >
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 rounded-full bg-[#FFE4C4] flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-[#014D4E]" />
              </div>
              <h2 className="ml-3 text-xl font-semibold text-[#014D4E]">
                Entries
              </h2>
            </div>
            <div className="flex items-baseline">
              <span className="text-4xl font-bold text-[#014D4E]">
                {journalStats?.totalEntries || 0}
              </span>
              <span className="ml-2 text-sm text-gray-500">total</span>
            </div>
            <div className="mt-3 text-sm text-gray-600">
              {journalStats?.totalEntries ? (
                <span>Keep writing to understand yourself better</span>
              ) : (
                <span>Start journaling to track your thoughts</span>
              )}
            </div>
          </motion.div>

          {/* Points Card */}
          <motion.div
            className="bg-white rounded-xl shadow-md p-6 border border-[#FFE4C4] hover:shadow-lg transition-shadow"
            whileHover={{ translateY: -5 }}
          >
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 rounded-full bg-[#FFE4C4] flex items-center justify-center">
                <Calendar className="h-6 w-6 text-[#014D4E]" />
              </div>
              <h2 className="ml-3 text-xl font-semibold text-[#014D4E]">
                Points
              </h2>
            </div>
            <div className="flex items-baseline">
              <span className="text-4xl font-bold text-[#014D4E]">
                {journalStats?.totalPoints || 0}
              </span>
              <span className="ml-2 text-sm text-gray-500">earned</span>
            </div>
            <div className="mt-3 text-sm text-gray-600">
              Earn points by journaling regularly
            </div>
          </motion.div>
        </div>

        {/* Recent Entries */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-[#FFE4C4]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-[#014D4E] flex items-center gap-2">
              <BookOpen size={20} />
              Recent Entries
            </h2>
            <button
              onClick={() => router.push("/dashboard/journal/entries")}
              className="text-[#014D4E] hover:text-[#013638] flex items-center gap-1 text-sm font-medium hover:underline"
            >
              View all <ArrowRight size={14} />
            </button>
          </div>

          {recentEntries.length > 0 ? (
            <div className="space-y-5">
              {recentEntries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: {
                      delay: index * 0.1,
                    },
                  }}
                  className="p-4 border border-gray-100 rounded-lg hover:shadow-md transition-all cursor-pointer bg-white"
                  whileHover={{ scale: 1.01, backgroundColor: "#FFFAF0" }}
                  onClick={() =>
                    router.push(`/dashboard/journal/entries/${entry.id}`)
                  }
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500 flex items-center">
                      <Calendar size={14} className="mr-1" />
                      {format(parseISO(entry.createdAt), "MMMM d, yyyy")}
                    </span>
                    {entry.mood && (
                      <span className="text-sm font-medium px-3 py-1 bg-[#FFE4C4]/30 rounded-full text-[#014D4E]">
                        {entry.mood}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-800 line-clamp-2">{entry.content}</p>
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
          ) : (
            <div className="text-center py-10 text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
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
            </div>
          )}
        </div>

        {/* Journaling Benefits */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-[#FFE4C4]">
          <h2 className="text-xl font-semibold text-[#014D4E] mb-6 flex items-center gap-2">
            <span className="text-xl">✨</span> Benefits of Regular Journaling
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#FFE4C4]/10 transition-colors">
              <div className="h-10 w-10 rounded-full bg-[#FFE4C4] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                <span className="text-[#014D4E] text-lg">🧠</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 mb-1">
                  Reduce Stress & Anxiety
                </h3>
                <p className="text-sm text-gray-600">
                  Writing about your emotions helps process feelings and reduce
                  stress levels.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#FFE4C4]/10 transition-colors">
              <div className="h-10 w-10 rounded-full bg-[#FFE4C4] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                <span className="text-[#014D4E] text-lg">💡</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 mb-1">
                  Improve Self-Awareness
                </h3>
                <p className="text-sm text-gray-600">
                  Regular journaling helps you understand patterns in your
                  thoughts and behavior.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#FFE4C4]/10 transition-colors">
              <div className="h-10 w-10 rounded-full bg-[#FFE4C4] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                <span className="text-[#014D4E] text-lg">🎯</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 mb-1">
                  Clarify Goals & Intentions
                </h3>
                <p className="text-sm text-gray-600">
                  Writing helps organize thoughts and focus on what truly
                  matters to you.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#FFE4C4]/10 transition-colors">
              <div className="h-10 w-10 rounded-full bg-[#FFE4C4] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                <span className="text-[#014D4E] text-lg">✨</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 mb-1">
                  Track Personal Growth
                </h3>
                <p className="text-sm text-gray-600">
                  Looking back at past entries helps you see how much you've
                  grown over time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
