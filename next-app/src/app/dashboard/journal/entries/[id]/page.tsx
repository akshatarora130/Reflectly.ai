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
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#014D4E]" />
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold text-[#014D4E] mb-4 md:mb-0">
          Journal Entry
        </h1>
        <button
          onClick={() => router.push("/dashboard/journal/entries")}
          className="text-[#014D4E] hover:text-[#013638] flex items-center gap-1"
        >
          <ChevronLeft size={16} />
          <span>Back to Entries</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {/* Entry Info */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-[#FFE4C4] mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-[#014D4E]" />
            <span className="text-gray-600">
              {formatEntryDate(entry.createdAt)}
            </span>
          </div>
          <div className="flex items-center mt-4 md:mt-0">
            {entry.mood && (
              <span className="mr-4 px-3 py-1 bg-[#FFE4C4] text-[#014D4E] rounded-full font-medium">
                {entry.mood}
              </span>
            )}
            <button
              onClick={() => router.push(`/dashboard/journal/edit/${entry.id}`)}
              className="flex items-center gap-1 text-[#014D4E] hover:text-[#013638]"
            >
              <PenLine size={14} />
              <span>Edit</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("entry")}
              className={`py-3 border-b-2 font-medium text-sm ${
                activeTab === "entry"
                  ? "border-[#014D4E] text-[#014D4E]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Journal Entry
            </button>
            <button
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
            >
              <BarChart size={14} className="mr-2" />
              Analysis
              {isAnalysisLoading && (
                <Loader2 size={14} className="ml-2 animate-spin" />
              )}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "entry" && (
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap">{entry.content}</div>
            </div>
          )}

          {activeTab === "analysis" && analysis && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-semibold text-[#014D4E] mb-2">
                  Summary
                </h3>
                <p className="text-gray-700">{analysis.result.summary}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-md font-semibold text-[#014D4E] mb-3">
                    Detected Emotions
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.result.emotions.map((emotion, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-[#FFE4C4] text-[#014D4E] rounded-full text-sm"
                      >
                        {emotion}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-md font-semibold text-[#014D4E] mb-3">
                    Key Themes
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.result.themes.map((theme, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-[#E6F2F2] text-[#014D4E] rounded-full text-sm"
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#014D4E] mb-2">
                  Insights
                </h3>
                <ul className="list-disc pl-5 space-y-2">
                  {analysis.result.insights.map((insight, index) => (
                    <li key={index} className="text-gray-700">
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#E6F2F2] p-5 rounded-lg">
                <h3 className="text-lg font-semibold text-[#014D4E] mb-3">
                  Recommendations
                </h3>
                <ul className="list-disc pl-5 space-y-2">
                  {analysis.result.recommendations.map(
                    (recommendation, index) => (
                      <li key={index} className="text-gray-700">
                        {recommendation}
                      </li>
                    )
                  )}
                </ul>
              </div>

              {analysis.result.affirmation && (
                <div className="bg-[#FFE4C4] bg-opacity-30 p-5 rounded-lg">
                  <h3 className="text-lg font-semibold text-[#014D4E] mb-3">
                    Daily Affirmation
                  </h3>
                  <p className="text-gray-700 italic text-center">
                    {analysis.result.affirmation}
                  </p>
                </div>
              )}

              {analysis.result.mindfulness_score !== undefined && (
                <div className="mt-4">
                  <h3 className="text-md font-semibold text-[#014D4E] mb-2">
                    Mindfulness Score
                  </h3>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-[#014D4E] h-4 rounded-full"
                      style={{ width: `${analysis.result.mindfulness_score}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0</span>
                    <span>50</span>
                    <span>100</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    This score reflects your level of self-awareness and
                    presence in this journal entry.
                  </p>
                </div>
              )}

              <div className="text-sm text-gray-500 italic mt-4">
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
              <button
                onClick={requestAnalysis}
                className="bg-[#014D4E] text-white px-4 py-2 rounded-md hover:bg-[#013638] transition-colors"
              >
                Generate Analysis
              </button>
            </div>
          )}

          {activeTab === "analysis" && isAnalysisLoading && (
            <div className="text-center py-10">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#014D4E]" />
              <p className="text-gray-600">Analyzing your journal entry...</p>
              <p className="text-sm text-gray-500 mt-2">
                This may take a moment
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
