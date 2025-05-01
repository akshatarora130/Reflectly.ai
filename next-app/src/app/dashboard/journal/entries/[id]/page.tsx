"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import {
  Loader2,
  ChevronLeft,
  Calendar,
  PenLine,
  BarChart,
  Home,
  Menu,
  X,
  ChevronRight,
  BookOpen,
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

interface JournalAnalysis {
  id: string;
  result: {
    summary: string;
    emotions: string[];
    themes: string[];
    insights: string[];
    recommendations: string[];
    sentiment_score: number;
    affirmation?: string;
    mindfulness_score?: number;
  };
  createdAt: string;
}

export default function JournalEntryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [analysis, setAnalysis] = useState<JournalAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"entry" | "analysis">("entry");
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Fetch journal entry and analysis
  useEffect(() => {
    const fetchEntryAndAnalysis = async () => {
      if (status !== "authenticated" || !session?.user?.id || !params.id)
        return;

      try {
        setIsLoading(true);
        setError(null);

        // Fetch the journal entry
        const entryResponse = await fetch(
          `/api/journal/entries/${params.id}?userId=${session.user.id}`
        );

        if (!entryResponse.ok) {
          throw new Error(`Entry API returned ${entryResponse.status}`);
        }

        const entryData = await entryResponse.json();
        setEntry(entryData);

        // Fetch the analysis if it exists
        const analysisResponse = await fetch(
          `/api/journal/analysis/${params.id}?userId=${session.user.id}`
        );

        if (analysisResponse.ok) {
          const analysisData = await analysisResponse.json();
          setAnalysis(analysisData);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load journal entry"
        );
        console.error("Error fetching journal entry:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntryAndAnalysis();
  }, [session?.user?.id, status, params.id]);

  // Format date for display
  const formatEntryDate = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMMM d, yyyy 'at' h:mm a");
  };

  // Request analysis if not already available
  const requestAnalysis = async () => {
    if (!entry || !session?.user?.id) return;

    try {
      setIsAnalysisLoading(true);
      setError(null);

      const response = await fetch(`/api/journal/analysis`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          journalEntryId: entry.id,
          userId: session.user.id,
          content: entry.content,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `API returned ${response.status}`);
      }

      const data = await response.json();
      setAnalysis(data);
      setActiveTab("analysis");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate analysis"
      );
      console.error("Error generating analysis:", err);
    } finally {
      setIsAnalysisLoading(false);
    }
  };

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
          Loading your journal entry
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

  if (!entry) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-6">
          Journal entry not found or you don't have permission to view it.
        </div>
        <button
          onClick={() => router.push("/dashboard/journal/entries")}
          className="text-[#014D4E] hover:text-[#013638] flex items-center gap-1"
        >
          <ChevronLeft size={16} />
          <span>Back to Journal Entries</span>
        </button>
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
                Journal Entry
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
            className="text-[#014D4E] hover:text-[#013638] flex items-center gap-1  px-3 py-1 rounded-md"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          ></motion.button>
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

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/dashboard/journal/entries")}
            className="text-[#014D4E] hover:text-[#013638] flex items-center gap-1"
          >
            <ChevronLeft size={16} />
            <span>Back to Entries</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Entry Info */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-[#FFE4C4]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-[#014D4E]" />
              <span className="text-gray-600 font-medium">
                {formatEntryDate(entry.createdAt)}
              </span>
            </div>
            {entry.mood && (
              <span className="px-4 py-1 bg-[#FFE4C4] text-[#014D4E] rounded-full font-medium shadow-sm">
                {entry.mood}
              </span>
            )}
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <div className="flex space-x-8">
              <motion.button
                onClick={() => setActiveTab("entry")}
                className={`py-3 border-b-2 font-medium text-sm ${
                  activeTab === "entry"
                    ? "border-[#014D4E] text-[#014D4E]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                whileHover={activeTab !== "entry" ? { y: -1 } : {}}
              >
                Journal Entry
              </motion.button>
              <motion.button
                onClick={() => {
                  if (analysis) {
                    setActiveTab("analysis");
                  } else if (!isAnalysisLoading) {
                    requestAnalysis();
                  }
                }}
                disabled={isAnalysisLoading}
                className={`py-3 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === "analysis"
                    ? "border-[#014D4E] text-[#014D4E]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                } ${isAnalysisLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                whileHover={
                  activeTab !== "analysis" && !isAnalysisLoading
                    ? { y: -1 }
                    : {}
                }
              >
                <BarChart size={14} className="mr-2" />
                Analysis
                {isAnalysisLoading && (
                  <Loader2 size={14} className="ml-2 animate-spin" />
                )}
              </motion.button>
            </div>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === "entry" && (
              <motion.div
                className="prose max-w-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed p-2">
                  {entry.content}
                </div>
              </motion.div>
            )}

            {activeTab === "analysis" && analysis && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="bg-[#F8FAFA] p-5 rounded-lg">
                  <h3 className="text-lg font-semibold text-[#014D4E] mb-2 flex items-center gap-2">
                    <span>📝</span> Summary
                  </h3>
                  <p className="text-gray-700">{analysis.result.summary}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[#F8FAFA] p-4 rounded-lg">
                    <h3 className="text-md font-semibold text-[#014D4E] mb-3 flex items-center gap-2">
                      <span>🌈</span> Detected Emotions
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.result.emotions.map((emotion, index) => (
                        <motion.span
                          key={index}
                          className="px-3 py-1 bg-[#FFE4C4] text-[#014D4E] rounded-full text-sm"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.05 }}
                        >
                          {emotion}
                        </motion.span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#F8FAFA] p-4 rounded-lg">
                    <h3 className="text-md font-semibold text-[#014D4E] mb-3 flex items-center gap-2">
                      <span>🔍</span> Key Themes
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.result.themes.map((theme, index) => (
                        <motion.span
                          key={index}
                          className="px-3 py-1 bg-[#E6F2F2] text-[#014D4E] rounded-full text-sm"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 + 0.3 }}
                          whileHover={{ scale: 1.05 }}
                        >
                          {theme}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-[#F8FAFA] p-5 rounded-lg">
                  <h3 className="text-lg font-semibold text-[#014D4E] mb-3 flex items-center gap-2">
                    <span>💡</span> Insights
                  </h3>
                  <ul className="list-disc pl-5 space-y-2">
                    {analysis.result.insights.map((insight, index) => (
                      <motion.li
                        key={index}
                        className="text-gray-700"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 + 0.5 }}
                      >
                        {insight}
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#E6F2F2] p-5 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold text-[#014D4E] mb-3 flex items-center gap-2">
                    <span>✅</span> Recommendations
                  </h3>
                  <ul className="list-disc pl-5 space-y-2">
                    {analysis.result.recommendations.map(
                      (recommendation, index) => (
                        <motion.li
                          key={index}
                          className="text-gray-700"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 + 0.7 }}
                        >
                          {recommendation}
                        </motion.li>
                      )
                    )}
                  </ul>
                </div>

                {analysis.result.affirmation && (
                  <motion.div
                    className="bg-[#FFE4C4] bg-opacity-30 p-5 rounded-lg shadow-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                  >
                    <h3 className="text-lg font-semibold text-[#014D4E] mb-3 flex items-center gap-2">
                      <span>✨</span> Daily Affirmation
                    </h3>
                    <p className="text-gray-700 italic text-center font-medium p-3 bg-white bg-opacity-50 rounded-lg">
                      "{analysis.result.affirmation}"
                    </p>
                  </motion.div>
                )}

                {analysis.result.mindfulness_score !== undefined && (
                  <motion.div
                    className="mt-4 bg-[#F8FAFA] p-5 rounded-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1 }}
                  >
                    <h3 className="text-md font-semibold text-[#014D4E] mb-3 flex items-center gap-2">
                      <span>🧘</span> Mindfulness Score
                    </h3>
                    <div className="w-full bg-gray-200 rounded-full h-5 overflow-hidden">
                      <motion.div
                        className="bg-[#014D4E] h-5 rounded-full relative"
                        initial={{ width: "0%" }}
                        animate={{
                          width: `${analysis.result.mindfulness_score}%`,
                        }}
                        transition={{
                          delay: 1.3,
                          duration: 1,
                          ease: "easeOut",
                        }}
                      >
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                          {analysis.result.mindfulness_score}%
                        </span>
                      </motion.div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0</span>
                      <span>50</span>
                      <span>100</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-3">
                      This score reflects your level of self-awareness and
                      presence in this journal entry.
                    </p>
                  </motion.div>
                )}

                <div className="text-sm text-gray-500 italic mt-6">
                  Analysis generated on{" "}
                  {format(
                    parseISO(analysis.createdAt),
                    "MMMM d, yyyy 'at' h:mm a"
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "analysis" && !analysis && !isAnalysisLoading && (
              <div className="text-center py-10">
                <BarChart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="mb-4 text-gray-600">
                  No analysis available for this journal entry yet.
                </p>
                <motion.button
                  onClick={requestAnalysis}
                  className="bg-[#014D4E] text-white px-5 py-2 rounded-md hover:bg-[#013638] transition-colors shadow-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Generate Analysis
                </motion.button>
              </div>
            )}

            {activeTab === "analysis" && isAnalysisLoading && (
              <div className="text-center py-10">
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-[#FFE4C4] opacity-30"
                    animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                    }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-t-[#014D4E] border-r-transparent border-b-transparent border-l-transparent"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1.5,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                  />
                  <motion.div
                    className="absolute inset-2 rounded-full border-4 border-t-transparent border-r-[#014D4E] border-b-transparent border-l-transparent"
                    animate={{ rotate: -360 }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                  />
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Number.POSITIVE_INFINITY,
                    }}
                  >
                    <BarChart className="h-8 w-8 text-[#014D4E]" />
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <h3 className="text-lg font-medium text-[#014D4E] mb-2">
                    Analyzing your journal entry
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Our AI is processing your thoughts and feelings
                  </p>

                  <div className="max-w-md mx-auto space-y-3">
                    {[
                      "Identifying emotions",
                      "Extracting themes",
                      "Generating insights",
                      "Creating recommendations",
                    ].map((step, index) => (
                      <motion.div
                        key={step}
                        className="flex items-center gap-3 bg-[#F8FAFA] p-2 px-4 rounded-lg"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.3 + 0.5 }}
                      >
                        <motion.div
                          className="h-3 w-3 rounded-full bg-[#014D4E]"
                          animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.7, 1, 0.7],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Number.POSITIVE_INFINITY,
                            delay: index * 0.4,
                          }}
                        />
                        <span className="text-sm">{step}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
