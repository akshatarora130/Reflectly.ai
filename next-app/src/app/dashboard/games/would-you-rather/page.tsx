"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  AlertCircle,
  RefreshCw,
  Play,
  Pause,
  Clock,
  Award,
  Brain,
  Timer,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Lightbulb,
  Hourglass,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "@/app/components/navbar";

interface Question {
  id: string;
  option_a: string;
  option_b: string;
  insight_a: string;
  insight_b: string;
}

interface GameContent {
  questions: Question[];
  category: string;
  title: string;
  description: string;
}

interface Answer {
  questionId: string;
  choice: "a" | "b";
}

export default function WouldYouRatherGame() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [gameContent, setGameContent] = useState<GameContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameState, setGameState] = useState<
    "intro" | "playing" | "paused" | "gameOver"
  >("intro");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds by default
  const [category, setCategory] = useState("general");
  const [questionCount, setQuestionCount] = useState(10);
  const [timeLimit, setTimeLimit] = useState(60);
  const [insights, setInsights] = useState<
    Record<string, { choice: "a" | "b"; insight: string }>
  >({});
  const [pageLoading, setPageLoading] = useState(true);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const initialLoadRef = useRef(true);

  // Handle authentication redirect
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }

    // Set initial loading to false after auth check
    if (initialLoadRef.current && status !== "loading") {
      initialLoadRef.current = false;
      // Add a small delay to show the loader animation
      setTimeout(() => {
        setPageLoading(false);
      }, 1000);
    }
  }, [status, router]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startGame = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch game content
      const response = await fetch(
        `/api/games/would-you-rather/questions?count=${questionCount}&category=${category}`
      );

      if (response.status === 401) {
        setError("Unauthorized. Please log in again.");
        toast.error("Unauthorized. Please log in again.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        router.push("/login");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API returned ${response.status}`);
      }

      const data = await response.json();

      // Update game state after data is fetched
      setGameContent(data);
      setGameState("playing");
      setCurrentQuestionIndex(0);
      setAnswers([]);
      setTimeLeft(timeLimit);
      setInsights({});

      toast.info("Game started! Make your choices quickly!", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Start timer
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Time's up
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }
            setGameState("gameOver");
            toast.info("Time's up!", {
              position: "top-center",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error("Error fetching game content:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load game content";
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const pauseGame = () => {
    if (gameState === "playing") {
      setGameState("paused");
      if (timerRef.current) clearInterval(timerRef.current);
      toast.info("Game paused", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } else if (gameState === "paused") {
      setGameState("playing");
      toast.info("Game resumed", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      // Resume timer
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Time's up
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }
            setGameState("gameOver");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const handleAnswer = (choice: "a" | "b") => {
    if (!gameContent || gameState !== "playing") return;

    const currentQuestion = gameContent.questions[currentQuestionIndex];

    // Record the answer
    setAnswers((prev) => [...prev, { questionId: currentQuestion.id, choice }]);

    // Record the insight
    setInsights((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        choice,
        insight:
          choice === "a"
            ? currentQuestion.insight_a
            : currentQuestion.insight_b,
      },
    }));

    // Move to next question or end game if no more questions
    if (currentQuestionIndex < gameContent.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // No more questions, end the game
      if (timerRef.current) clearInterval(timerRef.current);
      setGameState("gameOver");
      toast.success("You've answered all the questions!", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Show loading state while checking authentication
  if (status === "loading" || pageLoading) {
    return (
      <div className="flex flex-col h-screen">
        <Navbar />
        <div className="flex flex-col justify-center items-center flex-1 bg-gradient-to-b from-[#f0f4f8] to-white overflow-hidden">
          <div className="relative">
            <motion.div
              className="absolute inset-0 rounded-full bg-[#014D4E]/10"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            />
            <motion.div
              className="absolute inset-2 rounded-full bg-[#014D4E]/20"
              animate={{ scale: [1.1, 1, 1.1] }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                delay: 0.3,
              }}
            />
            <motion.div
              className="relative z-10 w-24 h-24 flex items-center justify-center"
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            >
              <Brain className="h-12 w-12 text-[#014D4E]" />
            </motion.div>
          </div>
          <motion.h2
            className="text-xl font-semibold text-[#014D4E] mt-6 mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Loading Would You Rather
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
          <ToastContainer />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex-1 bg-gradient-to-b from-[#f0f4f8] to-white p-4 sm:p-6 overflow-auto">
        <div className="max-w-6xl mx-auto w-full h-full flex flex-col">
          <div className="mb-6 flex items-center justify-between">
            {gameState === "playing" && (
              <motion.div
                className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Timer className="h-5 w-5 text-[#014D4E]" />
                <span className="font-medium text-[#014D4E]">
                  {formatTime(timeLeft)}
                </span>
              </motion.div>
            )}
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 shadow-sm"
            >
              <span className="flex items-center">
                <AlertCircle className="mr-2" size={18} />
                {error}
              </span>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
            <div className="lg:col-span-2">
              <motion.div
                className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-full border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="p-5 border-b border-gray-100">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-[#014D4E]">
                      {gameContent?.title || "Would You Rather"}
                    </h2>
                    {gameState === "playing" && gameContent && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#E6F2F2] text-[#014D4E]">
                        Question {currentQuestionIndex + 1} of{" "}
                        {gameContent.questions.length}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mt-1">
                    {gameState === "intro" &&
                      "Choose between two options to explore your mental health preferences."}
                    {gameState === "playing" &&
                      "Select the option that resonates with you more."}
                    {gameState === "paused" &&
                      "Game paused. Click Resume to continue."}
                    {gameState === "gameOver" &&
                      "Game over! See your results below."}
                  </p>
                </div>

                <div className="relative flex-1 overflow-auto">
                  {/* Game Area */}
                  <div className="min-h-full bg-gradient-to-b from-[#f8fafa] to-[#f0f7f7]">
                    {gameState === "intro" && (
                      <div className="p-6 flex flex-col items-center justify-center text-center">
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.5 }}
                          className="max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100"
                        >
                          <div className="mb-6 flex justify-center">
                            <div className="bg-[#E6F2F2] p-3 rounded-full">
                              <Brain className="h-8 w-8 text-[#014D4E]" />
                            </div>
                          </div>

                          <h2 className="text-2xl font-bold text-[#014D4E] mb-4">
                            Would You Rather
                          </h2>
                          <p className="text-gray-600 mb-6">
                            Make quick choices between two options related to
                            mental health and wellbeing. How many questions can
                            you answer before time runs out?
                          </p>

                          <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category
                              </label>
                              <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-[#014D4E] focus:border-[#014D4E] bg-white"
                              >
                                <option value="general">General</option>
                                <option value="self-care">Self-Care</option>
                                <option value="relationships">
                                  Relationships
                                </option>
                                <option value="mindfulness">Mindfulness</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Time Limit
                              </label>
                              <select
                                value={timeLimit.toString()}
                                onChange={(e) =>
                                  setTimeLimit(Number.parseInt(e.target.value))
                                }
                                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-[#014D4E] focus:border-[#014D4E] bg-white"
                              >
                                <option value="30">30 seconds</option>
                                <option value="60">1 minute</option>
                                <option value="120">2 minutes</option>
                                <option value="180">3 minutes</option>
                              </select>
                            </div>
                          </div>

                          <motion.button
                            className="w-full px-4 py-3 bg-[#014D4E] text-white rounded-lg hover:bg-[#013638] flex items-center justify-center shadow-md hover:shadow-lg transition-all"
                            onClick={startGame}
                            disabled={isLoading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Loading...
                              </>
                            ) : (
                              <>
                                <Play className="mr-2 h-5 w-5" />
                                Start Game
                              </>
                            )}
                          </motion.button>
                        </motion.div>
                      </div>
                    )}

                    {gameState === "playing" && gameContent && (
                      <div className="p-6">
                        {/* Timer Progress Bar */}
                        <div className="mb-8">
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                            <motion.div
                              className="bg-gradient-to-r from-[#014D4E] to-[#016566] h-3 rounded-full"
                              style={{
                                width: `${(timeLeft / timeLimit) * 100}%`,
                              }}
                              initial={{ width: "100%" }}
                              animate={{
                                width: `${(timeLeft / timeLimit) * 100}%`,
                              }}
                              transition={{ duration: 0.5 }}
                            ></motion.div>
                          </div>
                          <div className="flex justify-between mt-2 text-sm">
                            <span className="text-[#014D4E] font-medium flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {formatTime(timeLeft)}
                            </span>
                            <span className="text-[#014D4E] font-medium flex items-center">
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              {answers.length} answered
                            </span>
                          </div>
                        </div>

                        <AnimatePresence mode="wait">
                          <motion.div
                            key={currentQuestionIndex}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.3 }}
                          >
                            <h3 className="text-2xl font-medium text-center mb-8 text-[#014D4E]">
                              Would you rather...
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <motion.button
                                className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl border-2 border-transparent hover:border-[#014D4E] transition-all text-left h-full relative overflow-hidden group"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleAnswer("a")}
                              >
                                <div className="absolute inset-0 bg-gradient-to-br from-[#E6F2F2]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <h4 className="text-lg font-medium text-[#014D4E] mb-3 flex items-center">
                                  <span className="bg-[#E6F2F2] text-[#014D4E] w-8 h-8 rounded-full flex items-center justify-center mr-3 font-bold">
                                    A
                                  </span>
                                  Option A
                                </h4>
                                <p className="text-gray-700 relative z-10">
                                  {
                                    gameContent.questions[currentQuestionIndex]
                                      .option_a
                                  }
                                </p>
                                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <ChevronRight className="h-5 w-5 text-[#014D4E]" />
                                </div>
                              </motion.button>

                              <motion.button
                                className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl border-2 border-transparent hover:border-[#014D4E] transition-all text-left h-full relative overflow-hidden group"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleAnswer("b")}
                              >
                                <div className="absolute inset-0 bg-gradient-to-br from-[#FFE4C4]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <h4 className="text-lg font-medium text-[#014D4E] mb-3 flex items-center">
                                  <span className="bg-[#FFE4C4] text-[#014D4E] w-8 h-8 rounded-full flex items-center justify-center mr-3 font-bold">
                                    B
                                  </span>
                                  Option B
                                </h4>
                                <p className="text-gray-700 relative z-10">
                                  {
                                    gameContent.questions[currentQuestionIndex]
                                      .option_b
                                  }
                                </p>
                                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <ChevronRight className="h-5 w-5 text-[#014D4E]" />
                                </div>
                              </motion.button>
                            </div>
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    )}

                    {gameState === "gameOver" && (
                      <div className="p-6 flex flex-col items-center justify-center text-center bg-[#014D4E]/10 backdrop-blur-sm">
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.5 }}
                          className="bg-white p-8 rounded-xl shadow-xl max-w-md border border-gray-100"
                        >
                          <motion.div
                            className="mb-4 flex justify-center"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1, rotate: [0, 10, 0] }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                          >
                            <div className="bg-[#FFE4C4] p-4 rounded-full">
                              <Award className="h-10 w-10 text-[#014D4E]" />
                            </div>
                          </motion.div>

                          <h2 className="text-2xl font-bold text-[#014D4E] mb-2">
                            Time's Up!
                          </h2>
                          <div className="flex justify-center items-center mb-4">
                            <motion.div
                              className="text-5xl font-bold text-[#014D4E] flex items-center"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.3 }}
                            >
                              {answers.length}
                              <span className="text-lg ml-2 text-gray-500 font-normal">
                                answers
                              </span>
                            </motion.div>
                          </div>
                          <p className="text-gray-600 mb-6">
                            You answered {answers.length} questions in{" "}
                            <span className="font-medium">
                              {formatTime(timeLimit - timeLeft)}
                            </span>
                            !
                          </p>
                          <div className="flex justify-center space-x-3 mt-4">
                            <motion.button
                              className="px-4 py-2 bg-[#014D4E] text-white rounded-lg hover:bg-[#013638] flex items-center justify-center shadow-md hover:shadow-lg"
                              onClick={startGame}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Play Again
                            </motion.button>
                          </div>
                        </motion.div>
                      </div>
                    )}

                    {/* Pause Overlay */}
                    {gameState === "paused" && (
                      <div className="p-6 flex items-center justify-center bg-[#014D4E]/20 backdrop-blur-sm">
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
                        >
                          <div className="flex justify-center mb-4">
                            <div className="bg-[#E6F2F2] p-3 rounded-full">
                              <Hourglass className="h-6 w-6 text-[#014D4E]" />
                            </div>
                          </div>
                          <h3 className="text-xl font-bold text-[#014D4E] mb-4">
                            Game Paused
                          </h3>
                          <motion.button
                            className="px-4 py-2 bg-[#014D4E] text-white rounded-lg hover:bg-[#013638] flex items-center justify-center shadow-md hover:shadow-lg"
                            onClick={pauseGame}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Play className="mr-2 h-4 w-4" />
                            Resume
                          </motion.button>
                        </motion.div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 flex justify-between border-t border-gray-100">
                  {gameState === "playing" && (
                    <motion.button
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center shadow-sm"
                      onClick={pauseGame}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Pause className="mr-2 h-4 w-4" />
                      Pause
                    </motion.button>
                  )}
                  {gameState !== "playing" && gameState !== "intro" && (
                    <motion.button
                      className="px-4 py-2 bg-[#014D4E] text-white rounded-lg hover:bg-[#013638] flex items-center justify-center shadow-md hover:shadow-lg"
                      onClick={startGame}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      New Game
                    </motion.button>
                  )}
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="h-full"
            >
              <div className="bg-white rounded-xl shadow-lg flex flex-col h-full border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <h2 className="text-xl font-bold text-[#014D4E] flex items-center">
                    {gameState === "gameOver" ? (
                      <>
                        <Sparkles className="h-5 w-5 mr-2 text-[#014D4E]" />
                        Your Insights
                      </>
                    ) : (
                      <>
                        <Lightbulb className="h-5 w-5 mr-2 text-[#014D4E]" />
                        Game Info
                      </>
                    )}
                  </h2>
                </div>
                <div className="p-5 overflow-y-auto flex-1">
                  {gameState === "gameOver" && gameContent ? (
                    <div className="space-y-5">
                      {/* Game Results */}
                      <div>
                        <h3 className="font-medium text-[#014D4E] mb-3">
                          Your Choices
                        </h3>
                        <div className="space-y-4">
                          {Object.entries(insights).map(
                            ([questionId, data], index) => {
                              const question = gameContent.questions.find(
                                (q) => q.id === questionId
                              );
                              if (!question) return null;

                              return (
                                <motion.div
                                  key={questionId}
                                  className="bg-[#f8fafa] p-4 rounded-lg shadow-sm border border-gray-100"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="text-sm font-medium text-[#014D4E] flex items-center">
                                      <span className="bg-[#E6F2F2] text-[#014D4E] w-6 h-6 rounded-full flex items-center justify-center mr-2 text-xs font-bold">
                                        {index + 1}
                                      </span>
                                      Question {index + 1}
                                    </span>
                                    <span
                                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        data.choice === "a"
                                          ? "bg-[#E6F2F2] text-[#014D4E]"
                                          : "bg-[#FFE4C4] text-[#014D4E]"
                                      }`}
                                    >
                                      Option {data.choice.toUpperCase()}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-700 mb-2 font-medium">
                                    {data.choice === "a"
                                      ? question.option_a
                                      : question.option_b}
                                  </p>
                                  <div className="bg-white p-3 rounded-lg border border-gray-100">
                                    <p className="text-xs italic text-gray-600">
                                      <span className="text-[#014D4E] font-medium not-italic">
                                        Insight:
                                      </span>{" "}
                                      {data.insight}
                                    </p>
                                  </div>
                                </motion.div>
                              );
                            }
                          )}
                        </div>
                      </div>

                      {/* Stats */}
                      <motion.div
                        className="p-5 bg-[#E6F2F2] rounded-lg shadow-sm"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <h3 className="font-medium text-[#014D4E] mb-3 flex items-center">
                          <Brain className="h-4 w-4 mr-2" />
                          What This Says About You
                        </h3>
                        <p className="text-gray-700 text-sm">
                          Your choices reveal your preferences and values
                          related to mental wellbeing. The more you play, the
                          more you'll learn about yourself and your approach to
                          mental health.
                        </p>
                      </motion.div>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div>
                        <h3 className="font-medium text-[#014D4E] mb-3 flex items-center">
                          <Play className="h-4 w-4 mr-2" />
                          How to Play
                        </h3>
                        <ul className="list-none text-gray-600 space-y-2">
                          {[
                            "You'll be presented with 'Would You Rather' questions",
                            "Choose the option that resonates with you more",
                            "Answer as many questions as you can before time runs out",
                            "Each choice reveals something about your preferences",
                            "At the end, you'll see insights based on your choices",
                          ].map((item, index) => (
                            <motion.li
                              key={index}
                              className="flex items-start"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <span className="bg-[#E6F2F2] text-[#014D4E] w-5 h-5 rounded-full flex items-center justify-center mr-2 text-xs font-bold mt-0.5">
                                {index + 1}
                              </span>
                              <span>{item}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-medium text-[#014D4E] mb-3 flex items-center">
                          <Sparkles className="h-4 w-4 mr-2" />
                          Benefits
                        </h3>
                        <ul className="list-none text-gray-600 space-y-2">
                          {[
                            "Promotes self-reflection and self-awareness",
                            "Helps clarify your personal values",
                            "Encourages thinking about mental health preferences",
                            "Provides insights into your decision-making patterns",
                          ].map((item, index) => (
                            <motion.li
                              key={index}
                              className="flex items-start"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.4 + index * 0.1 }}
                            >
                              <CheckCircle2 className="h-4 w-4 text-[#014D4E] mr-2 flex-shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
