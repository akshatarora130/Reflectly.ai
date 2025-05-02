"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Send,
  Save,
  ArrowLeft,
  Home,
  Menu,
  X,
  ChevronRight,
  BookOpen,
  PenLine,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const moods = [
  { label: "Happy", value: "Happy", emoji: "😊" },
  { label: "Calm", value: "Calm", emoji: "😌" },
  { label: "Sad", value: "Sad", emoji: "😔" },
  { label: "Anxious", value: "Anxious", emoji: "😰" },
  { label: "Energetic", value: "Energetic", emoji: "⚡" },
  { label: "Tired", value: "Tired", emoji: "😴" },
  { label: "Grateful", value: "Grateful", emoji: "🙏" },
  { label: "Frustrated", value: "Frustrated", emoji: "😤" },
];

export default function NewJournalEntryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [streakIncreased, setStreakIncreased] = useState(false);
  const [entryId, setEntryId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [charCount, setCharCount] = useState(0);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Auto-focus the textarea
  useEffect(() => {
    if (status === "authenticated") {
      const textarea = document.getElementById(
        "journal-content"
      ) as HTMLTextAreaElement;
      if (textarea) {
        textarea.focus();
      }
    }
  }, [status]);

  // Update character count
  useEffect(() => {
    setCharCount(content.length);
  }, [content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError("Please enter some content for your journal entry");
      return;
    }

    // @ts-ignore
    if (!session?.user?.id) {
      setError("You must be logged in to create a journal entry");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch("/api/journal/entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          mood: selectedMood,
          // @ts-ignore
          userId: session.user.id,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `API returned ${response.status}`);
      }

      const data = await response.json();
      setPointsEarned(data.pointsEarned);
      setStreakIncreased(data.streakIncreased);
      setEntryId(data.id);
      setShowAnimation(true);

      // Wait for animation to complete before redirecting
      setTimeout(() => {
        router.push(`/dashboard/journal/entries/${data.id}`);
      }, 3500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create journal entry"
      );
      console.error("Error creating journal entry:", err);
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
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
            <PenLine className="h-10 w-10 text-[#014D4E]" />
          </motion.div>
        </motion.div>

        <motion.h2
          className="text-xl font-semibold text-[#014D4E] mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Preparing your journal
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
                New Journal Entry
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
              onClick={() => router.push("/dashboard/journal/entries")}
              className="text-gray-600 hover:text-[#014D4E] flex items-center gap-1"
              whileHover={{ scale: 1.05 }}
            >
              All Entries
            </motion.button>
          </div>

          <motion.button
            onClick={() => router.push("/dashboard/journal")}
            className="text-[#014D4E] hover:text-[#013638] flex items-center gap-1"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Back to Journal</span>
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

      <AnimatePresence>
        {showAnimation ? (
          <motion.div
            className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.5 }}
              className="w-24 h-24 rounded-full bg-[#014D4E] flex items-center justify-center mb-6 shadow-lg"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                <Save className="h-10 w-10 text-white" />
              </motion.div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-2xl font-bold text-[#014D4E] mb-4"
            >
              Journal Entry Saved!
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="flex items-center mb-2"
            >
              <span className="text-lg font-semibold">
                +{pointsEarned} points
              </span>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.2 }}
                className="ml-2 inline-block"
              >
                🏆
              </motion.span>
            </motion.div>

            {streakIncreased && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.4 }}
                className="text-amber-600 font-medium mb-6 flex items-center gap-2"
              >
                <span>🔥</span> Streak increased!
              </motion.div>
            )}

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6 }}
              className="text-gray-600"
            >
              Redirecting to your journal...
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto px-4 py-8"
          >
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white rounded-xl shadow-md p-6 border border-[#FFE4C4]">
                <label
                  htmlFor="journal-mood"
                  className="block text-lg font-medium text-[#014D4E] mb-4"
                >
                  How are you feeling today?
                </label>
                <div className="flex flex-wrap gap-3">
                  {moods.map((mood) => (
                    <motion.button
                      key={mood.value}
                      type="button"
                      onClick={() => setSelectedMood(mood.value)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors ${
                        selectedMood === mood.value
                          ? "border-[#014D4E] bg-[#014D4E] text-white shadow-md"
                          : "border-gray-200 hover:border-[#014D4E]/50 hover:bg-[#FFE4C4]/20"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="text-lg">{mood.emoji}</span>
                      <span>{mood.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border border-[#FFE4C4]">
                <label
                  htmlFor="journal-content"
                  className="block text-lg font-medium text-[#014D4E] mb-4"
                >
                  Write your thoughts
                </label>
                <motion.div
                  className="relative"
                  whileHover={{ boxShadow: "0 4px 12px rgba(1, 77, 78, 0.1)" }}
                  transition={{ duration: 0.3 }}
                >
                  <textarea
                    id="journal-content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What's on your mind today? How was your day? What are you grateful for?"
                    className="w-full h-64 rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#014D4E] focus:border-transparent resize-none bg-gray-50 focus:bg-white transition-colors"
                    disabled={isSubmitting}
                  />
                </motion.div>
                <div className="mt-3 flex flex-col sm:flex-row sm:justify-between space-y-2 sm:space-y-0">
                  <span className="text-sm text-gray-500 italic">
                    Tip: Try to write for at least 5 minutes to get the most
                    benefit.
                  </span>
                  <span
                    className={`font-medium text-sm ${
                      charCount > 500 ? "text-green-600" : "text-gray-600"
                    }`}
                  >
                    {charCount} characters
                  </span>
                </div>
              </div>

              <div className="flex justify-end">
                <motion.button
                  type="submit"
                  disabled={isSubmitting || !content.trim()}
                  className="bg-[#014D4E] text-white px-6 py-3 rounded-md flex items-center gap-2 hover:bg-[#013638] transition-colors disabled:opacity-50 shadow-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      <span>Save Entry</span>
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
