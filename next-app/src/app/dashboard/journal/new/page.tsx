"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Send, Save, ArrowLeft } from "lucide-react";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError("Please enter some content for your journal entry");
      return;
    }

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
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#014D4E]" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
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
              className="w-20 h-20 rounded-full bg-[#014D4E] flex items-center justify-center mb-6"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                <Save className="h-8 w-8 text-white" />
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
                className="text-amber-600 font-medium mb-6"
              >
                🔥 Streak increased!
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            <div className="flex items-center mb-6">
              <button
                onClick={() => router.push("/dashboard/journal")}
                className="mr-4 p-2 rounded-full hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-[#014D4E]">
                New Journal Entry
              </h1>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label
                  htmlFor="journal-mood"
                  className="block text-sm font-medium text-gray-700 mb-2"
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
                          ? "border-[#014D4E] bg-[#014D4E] text-white"
                          : "border-gray-200 hover:border-[#014D4E]/50"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span>{mood.emoji}</span>
                      <span>{mood.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label
                  htmlFor="journal-content"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Write your thoughts
                </label>
                <textarea
                  id="journal-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What's on your mind today? How was your day? What are you grateful for?"
                  className="w-full h-64 rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#014D4E] focus:border-transparent resize-none"
                  disabled={isSubmitting}
                />
                <div className="mt-2 text-xs text-gray-500 flex justify-between">
                  <span>
                    Tip: Try to write for at least 5 minutes to get the most
                    benefit.
                  </span>
                  <span className="font-medium">
                    {content.length} characters
                  </span>
                </div>
              </div>

              <div className="flex justify-end">
                <motion.button
                  type="submit"
                  disabled={isSubmitting || !content.trim()}
                  className="bg-[#014D4E] text-white px-6 py-3 rounded-md flex items-center gap-2 hover:bg-[#013638] transition-colors disabled:opacity-50"
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
