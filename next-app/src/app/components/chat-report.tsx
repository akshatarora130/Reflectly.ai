"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Loader2,
  FileText,
  BarChart,
  Brain,
  Sparkles,
  Download,
  Share2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface ChatReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  userId: string;
}

interface ReportData {
  summary: string;
  emotions: string[];
  themes: string[];
  motivational_closing: string;
  mindfulness_score: number;
  intensity: number;
  trigger_or_catalyst: string;
  growth_opportunity: string;
}

export default function ChatReportModal({
  isOpen,
  onClose,
  sessionId,
  userId,
}: ChatReportModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    summary: true,
    emotions: true,
    intensity: true,
    mindfulness: true,
    growth: true,
    closing: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const generateReport = async () => {
    if (!sessionId || !userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          userId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `API returned ${response.status}`);
      }

      const data = await response.json();
      setReportData(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate conversation report"
      );
      console.error("Error generating report:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate report when modal opens
  useEffect(() => {
    if (isOpen && !reportData && !isLoading) {
      generateReport();
    }
  }, [isOpen, reportData, isLoading]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-[#014D4E] to-[#016566] text-white sticky top-0 z-10">
              <h2 className="text-2xl font-bold flex items-center">
                <FileText className="mr-3 h-6 w-6" />
                Conversation Report
              </h2>
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/10 text-white"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  title="Close"
                >
                  <X size={20} />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="relative w-24 h-24 mb-6">
                    <motion.div
                      className="absolute inset-0 rounded-full bg-[#FFE4C4]/30"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                      }}
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
                      className="absolute inset-4 rounded-full border-4 border-t-transparent border-r-[#014D4E] border-b-transparent border-l-transparent"
                      animate={{ rotate: -360 }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                      }}
                    />
                    <motion.div className="absolute inset-0 flex items-center justify-center">
                      <FileText className="h-8 w-8 text-[#014D4E]" />
                    </motion.div>
                  </div>

                  <motion.h3
                    className="text-xl font-semibold text-[#014D4E] mb-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Generating Your Report
                  </motion.h3>

                  <motion.p
                    className="text-gray-600 mb-6 text-center max-w-md"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    We're analyzing your conversation with Sage to provide
                    meaningful insights about your discussion.
                  </motion.p>

                  <div className="max-w-md w-full space-y-3">
                    {[
                      "Analyzing conversation patterns",
                      "Identifying key emotions and themes",
                      "Calculating mindfulness metrics",
                      "Generating personalized insights",
                    ].map((step, index) => (
                      <motion.div
                        key={step}
                        className="flex items-center gap-3 bg-[#F8FAFA] p-3 px-4 rounded-lg"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.2 + 0.4 }}
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
                </div>
              ) : error ? (
                <motion.div
                  className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-red-100 rounded-full">
                      <X className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <p className="font-medium text-lg mb-2">
                        Error Generating Report
                      </p>
                      <p className="mb-4">{error}</p>
                      <motion.button
                        onClick={generateReport}
                        className="bg-[#014D4E] text-white px-4 py-2 rounded-md hover:bg-[#013638] transition-colors inline-flex items-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Loader2 className="h-4 w-4" />
                        Try Again
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ) : reportData ? (
                <div className="space-y-6">
                  {/* Summary Section */}
                  <motion.div
                    className="bg-gradient-to-br from-[#F8F9FA] to-white rounded-xl p-6 shadow-sm border border-gray-100"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => toggleSection("summary")}
                    >
                      <h3 className="text-xl font-semibold text-[#014D4E] flex items-center">
                        <div className="bg-[#014D4E]/10 p-2 rounded-full mr-3">
                          <FileText className="h-5 w-5 text-[#014D4E]" />
                        </div>
                        Conversation Summary
                      </h3>
                      {expandedSections.summary ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>

                    <AnimatePresence>
                      {expandedSections.summary && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <p className="text-gray-700 mt-4 leading-relaxed">
                            {reportData.summary}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Emotions & Themes */}
                  <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <div className="bg-gradient-to-br from-[#F0F7F7] to-white rounded-xl p-6 shadow-sm border border-gray-100">
                      <div
                        className="flex justify-between items-center cursor-pointer"
                        onClick={() => toggleSection("emotions")}
                      >
                        <h3 className="text-lg font-semibold text-[#014D4E] flex items-center">
                          <div className="bg-[#014D4E]/10 p-2 rounded-full mr-3">
                            <Brain className="h-4 w-4 text-[#014D4E]" />
                          </div>
                          Key Emotions
                        </h3>
                        {expandedSections.emotions ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>

                      <AnimatePresence>
                        {expandedSections.emotions && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="flex flex-wrap gap-2 mt-4">
                              {reportData.emotions.map((emotion, index) => (
                                <motion.span
                                  key={index}
                                  className="px-3 py-1.5 bg-[#FFE4C4] text-[#014D4E] rounded-full text-sm font-medium shadow-sm"
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: index * 0.1 }}
                                  whileHover={{
                                    scale: 1.05,
                                    backgroundColor: "#FFD4A4",
                                  }}
                                >
                                  {emotion}
                                </motion.span>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="bg-gradient-to-br from-[#F0F7F7] to-white rounded-xl p-6 shadow-sm border border-gray-100">
                      <h3 className="text-lg font-semibold text-[#014D4E] flex items-center mb-4">
                        <div className="bg-[#014D4E]/10 p-2 rounded-full mr-3">
                          <BarChart className="h-4 w-4 text-[#014D4E]" />
                        </div>
                        Main Themes
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {reportData.themes.map((theme, index) => (
                          <motion.span
                            key={index}
                            className="px-3 py-1.5 bg-[#E6F2F2] text-[#014D4E] rounded-full text-sm font-medium shadow-sm"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 + 0.2 }}
                            whileHover={{
                              scale: 1.05,
                              backgroundColor: "#D6ECEC",
                            }}
                          >
                            {theme}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  </motion.div>

                  {/* Emotional Intensity */}
                  <motion.div
                    className="bg-gradient-to-br from-[#F8F9FA] to-white rounded-xl p-6 shadow-sm border border-gray-100"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => toggleSection("intensity")}
                    >
                      <h3 className="text-lg font-semibold text-[#014D4E] flex items-center">
                        <div className="bg-[#014D4E]/10 p-2 rounded-full mr-3">
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{
                              duration: 2,
                              repeat: Number.POSITIVE_INFINITY,
                            }}
                          >
                            <Sparkles className="h-4 w-4 text-[#014D4E]" />
                          </motion.div>
                        </div>
                        Emotional Intensity
                      </h3>
                      {expandedSections.intensity ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>

                    <AnimatePresence>
                      {expandedSections.intensity && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4">
                            <div className="w-full bg-gray-200 rounded-full h-5 mb-2 overflow-hidden">
                              <motion.div
                                className="bg-gradient-to-r from-[#014D4E] to-[#016566] h-5 rounded-full flex items-center justify-end pr-2"
                                initial={{ width: 0 }}
                                animate={{
                                  width: `${
                                    (reportData.intensity / 10) * 100
                                  }%`,
                                }}
                                transition={{ duration: 1, delay: 0.5 }}
                              >
                                <span className="text-xs font-medium text-white">
                                  {reportData.intensity}/10
                                </span>
                              </motion.div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mb-4">
                              <span>Low</span>
                              <span>Moderate</span>
                              <span>High</span>
                            </div>
                            <p className="text-gray-700 bg-[#F0F7F7] p-4 rounded-lg border border-[#E6F2F2]">
                              {reportData.trigger_or_catalyst}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Mindfulness Score */}
                  <motion.div
                    className="bg-gradient-to-br from-[#F0F7F7] to-white rounded-xl p-6 shadow-sm border border-gray-100"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => toggleSection("mindfulness")}
                    >
                      <h3 className="text-lg font-semibold text-[#014D4E] flex items-center">
                        <div className="bg-[#014D4E]/10 p-2 rounded-full mr-3">
                          <Brain className="h-4 w-4 text-[#014D4E]" />
                        </div>
                        Mindfulness Score
                      </h3>
                      {expandedSections.mindfulness ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>

                    <AnimatePresence>
                      {expandedSections.mindfulness && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4">
                            <div className="relative pt-4 pb-8">
                              <div className="w-full bg-gray-200 rounded-full h-5 mb-2 overflow-hidden">
                                <motion.div
                                  className="bg-gradient-to-r from-[#014D4E] to-[#016566] h-5 rounded-full flex items-center justify-end pr-2"
                                  initial={{ width: 0 }}
                                  animate={{
                                    width: `${reportData.mindfulness_score}%`,
                                  }}
                                  transition={{ duration: 1, delay: 0.5 }}
                                >
                                  <span className="text-xs font-medium text-white">
                                    {reportData.mindfulness_score}%
                                  </span>
                                </motion.div>
                              </div>

                              <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>0</span>
                                <span>50</span>
                                <span>100</span>
                              </div>

                              <div className="absolute -bottom-1 left-0 w-full flex justify-between px-1">
                                <div className="flex flex-col items-center">
                                  <div className="w-0.5 h-3 bg-gray-300"></div>
                                  <span className="text-[10px] text-gray-500 mt-1">
                                    Low
                                  </span>
                                </div>
                                <div className="flex flex-col items-center">
                                  <div className="w-0.5 h-3 bg-gray-300"></div>
                                  <span className="text-[10px] text-gray-500 mt-1">
                                    Moderate
                                  </span>
                                </div>
                                <div className="flex flex-col items-center">
                                  <div className="w-0.5 h-3 bg-gray-300"></div>
                                  <span className="text-[10px] text-gray-500 mt-1">
                                    High
                                  </span>
                                </div>
                              </div>
                            </div>

                            <p className="mt-4 text-gray-700">
                              This score reflects your level of self-awareness
                              and presence in this conversation.
                              {reportData.mindfulness_score > 75 ? (
                                <span className="block mt-2 text-green-600 font-medium">
                                  You demonstrated excellent mindfulness during
                                  this conversation!
                                </span>
                              ) : reportData.mindfulness_score > 50 ? (
                                <span className="block mt-2 text-blue-600 font-medium">
                                  You showed good awareness during this
                                  conversation.
                                </span>
                              ) : (
                                <span className="block mt-2 text-amber-600 font-medium">
                                  There's opportunity to increase your
                                  mindfulness in future conversations.
                                </span>
                              )}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Growth Opportunity */}
                  <motion.div
                    className="bg-gradient-to-br from-[#FFE4C4]/30 to-white rounded-xl p-6 shadow-sm border border-[#FFE4C4]/30"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => toggleSection("growth")}
                    >
                      <h3 className="text-lg font-semibold text-[#014D4E] flex items-center">
                        <div className="bg-[#014D4E]/10 p-2 rounded-full mr-3">
                          <Sparkles className="h-4 w-4 text-[#014D4E]" />
                        </div>
                        Growth Opportunity
                      </h3>
                      {expandedSections.growth ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>

                    <AnimatePresence>
                      {expandedSections.growth && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 bg-white/70 p-4 rounded-lg border border-[#FFE4C4]/30">
                            <p className="text-gray-700">
                              {reportData.growth_opportunity}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Motivational Closing */}
                  <motion.div
                    className="bg-gradient-to-br from-[#014D4E]/10 to-white rounded-xl p-6 shadow-sm border border-[#014D4E]/10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => toggleSection("closing")}
                    >
                      <h3 className="text-lg font-semibold text-[#014D4E] flex items-center">
                        <div className="bg-[#014D4E]/10 p-2 rounded-full mr-3">
                          <Sparkles className="h-4 w-4 text-[#014D4E]" />
                        </div>
                        Closing Thoughts
                      </h3>
                      {expandedSections.closing ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>

                    <AnimatePresence>
                      {expandedSections.closing && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 bg-white/70 p-5 rounded-lg border border-[#014D4E]/10 text-center">
                            <p className="text-gray-700 italic text-lg">
                              "{reportData.motivational_closing}"
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  <motion.div
                    className="text-center text-sm text-gray-500 mt-8 bg-[#F8F9FA] p-4 rounded-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <p className="mb-1">
                      This report was generated based on your conversation with
                      Sage.
                    </p>
                    <p>
                      The insights provided are meant to help you reflect on
                      your thoughts and emotions.
                    </p>
                  </motion.div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="bg-[#F8F9FA] p-6 rounded-lg text-center max-w-md">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      No report data available. Please try again.
                    </p>
                    <motion.button
                      onClick={generateReport}
                      className="bg-[#014D4E] text-white px-4 py-2 rounded-md hover:bg-[#013638] transition-colors inline-flex items-center gap-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Loader2 className="h-4 w-4" />
                      Generate Report
                    </motion.button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {reportData && (
              <div className="border-t border-gray-200 p-4 flex justify-end">
                <motion.button
                  onClick={onClose}
                  className="bg-[#014D4E] text-white px-6 py-2.5 rounded-md hover:bg-[#013638] transition-colors shadow-sm flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>Close Report</span>
                </motion.button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
