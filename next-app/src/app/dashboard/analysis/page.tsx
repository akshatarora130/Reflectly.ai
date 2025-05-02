"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Heart,
  ArrowUpCircle,
  CheckCircle2,
  Clock,
  RefreshCcw,
  ChevronDown,
} from "lucide-react";

interface AnalysisReport {
  greeting: string;
  personality_analysis: string;
  current_emotion: string;
  progress: string;
  self_awareness: {
    score: number;
    comment: string;
  };
  suggestion: string;
  affirmation: string;
}

export default function AnalysisPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      setLoading(false);
    }
  }, [status, router]);

  const generateReport = async () => {
    if (!session?.user?.id) return;

    try {
      setGenerating(true);
      setError(null);

      const response = await fetch(
        `/api/analysis/generate?userId=${session.user.id}`
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setReport(data);
    } catch (err) {
      console.error("Error generating report:", err);
      setError(
        err instanceof Error ? err.message : "Failed to generate report"
      );
    } finally {
      setGenerating(false);
    }
  };

  const renderSelfAwarenessScore = (score: number) => {
    let color = "bg-red-500";
    let label = "Low";

    if (score >= 70) {
      color = "bg-green-500";
      label = "High";
    } else if (score >= 40) {
      color = "bg-yellow-500";
      label = "Moderate";
    }

    return (
      <div className="mb-4">
        <div className="flex justify-between mb-1 text-sm font-medium">
          <span>Self-Awareness Score</span>
          <span>
            {score}/100 - {label}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`${color} h-2.5 rounded-full transition-all duration-1000 ease-out`}
            style={{ width: `${score}%` }}
          ></div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#014D4E]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-[#014D4E] mb-2">
        Wellness Analysis
      </h1>
      <p className="text-gray-600 mb-8">
        Get insights into your emotional wellbeing based on your chat
        conversations and journal entries.
      </p>

      {!report && !generating && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 text-center">
          <BarChart3 className="mx-auto h-16 w-16 text-[#014D4E] mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            Generate Your Wellness Report
          </h2>
          <p className="text-gray-600 mb-6">
            This report analyzes your chat conversations and journal entries to
            provide insights about your emotional wellbeing.
          </p>
          <button
            onClick={generateReport}
            className="bg-[#014D4E] text-white px-6 py-3 rounded-md hover:bg-[#013638] transition-colors"
            disabled={generating}
          >
            Generate Report
          </button>
        </div>
      )}

      {generating && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#014D4E] mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Analyzing Your Data</h2>
          <p className="text-gray-600">
            This may take a moment. We're analyzing your chat conversations and
            journal entries to generate personalized insights.
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-700 underline mt-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {report && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="bg-[#014D4E] p-4 text-white">
            <h2 className="text-xl font-semibold">{report.greeting}</h2>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <Heart className="mr-2 h-5 w-5 text-[#014D4E]" />
                Current Emotional State
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <div className="mb-4 sm:mb-0">
                    <p className="text-sm text-gray-500">Current Emotion</p>
                    <p className="text-lg font-medium capitalize">
                      {report.current_emotion}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">
                      Personality Analysis
                    </p>
                    <p className="text-lg font-medium capitalize">
                      {report.personality_analysis}
                    </p>
                  </div>
                </div>
              </div>

              {renderSelfAwarenessScore(report.self_awareness.score)}

              <div className="mb-4">
                <p className="text-sm text-gray-500">Self-Awareness Comment</p>
                <p className="text-gray-700">{report.self_awareness.comment}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <ArrowUpCircle className="mr-2 h-5 w-5 text-[#014D4E]" />
                Progress & Suggestions
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-gray-700">{report.progress}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Suggestion</p>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                  <p className="text-gray-700">{report.suggestion}</p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <CheckCircle2 className="mr-2 h-5 w-5 text-[#014D4E]" />
                Your Affirmation
              </h3>
              <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500 italic text-center">
                "{report.affirmation}"
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center text-[#014D4E] hover:underline"
              >
                {showDetails ? "Hide" : "Show"} Analysis Details
                <ChevronDown
                  className={`ml-1 h-4 w-4 transition-transform ${
                    showDetails ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showDetails && (
                <div className="mt-4 text-sm text-gray-600">
                  <div className="flex items-center mb-2">
                    <Clock className="mr-2 h-4 w-4" />
                    <p>Analysis generated on {new Date().toLocaleString()}</p>
                  </div>
                  <p className="mb-2">
                    This analysis is based on your chat conversations and
                    journal entries. It provides insights into your emotional
                    well-being, but it's not a substitute for professional
                    mental health advice.
                  </p>
                  <p>
                    For a more accurate analysis, continue using your AI
                    companion and journal regularly.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={generateReport}
                className="flex items-center text-[#014D4E] hover:underline"
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Regenerate Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
