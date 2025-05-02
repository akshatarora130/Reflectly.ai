"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  Play,
  Pause,
  Clock,
  Award,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    // Clean up timer on unmount
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
      setGameContent(data);

      // Reset game state
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
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Time's up
            clearInterval(timerRef.current!);
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
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Time's up
            clearInterval(timerRef.current!);
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
  if (status === "loading" || isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4 flex items-center justify-between">
        <button
          className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
          onClick={() => router.push("/dashboard/games")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Games
        </button>

        {gameState === "playing" && (
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <span className="font-medium">{formatTime(timeLeft)}</span>
          </div>
        )}
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-6 relative"
        >
          <span className="flex items-center">
            <AlertCircle className="mr-2" size={16} />
            {error}
          </span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden h-full">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-blue-800">
                  {gameContent?.title || "Would You Rather"}
                </h2>
                {gameState === "playing" && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Question {currentQuestionIndex + 1} of{" "}
                    {gameContent?.questions.length}
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

            <div className="relative">
              {/* Game Area */}
              <div className="relative w-full min-h-[500px] bg-gradient-to-b from-gray-50 to-gray-100 overflow-hidden border-t border-b border-gray-200">
                {gameState === "intro" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      className="max-w-md"
                    >
                      <h2 className="text-2xl font-bold text-blue-800 mb-4">
                        Would You Rather
                      </h2>
                      <p className="text-gray-600 mb-6">
                        Make quick choices between two options related to mental
                        health and wellbeing. How many questions can you answer
                        before time runs out?
                      </p>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category
                          </label>
                          <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="general">General</option>
                            <option value="self-care">Self-Care</option>
                            <option value="relationships">Relationships</option>
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
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="30">30 seconds</option>
                            <option value="60">1 minute</option>
                            <option value="120">2 minutes</option>
                            <option value="180">3 minutes</option>
                          </select>
                        </div>
                      </div>

                      <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center"
                        onClick={startGame}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-4 w-4" />
                            Start Game
                          </>
                        )}
                      </button>
                    </motion.div>
                  </div>
                )}

                {gameState === "playing" && gameContent && (
                  <div className="p-6">
                    {/* Timer Progress Bar */}
                    <div className="mb-6">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(timeLeft / timeLimit) * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-1 text-xs text-gray-500">
                        <span>{formatTime(timeLeft)}</span>
                        <span>{answers.length} answered</span>
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
                        <h3 className="text-xl font-medium text-center mb-8">
                          Would you rather...
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <motion.button
                            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg border-2 border-transparent hover:border-blue-600 transition-all text-left h-full"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleAnswer("a")}
                          >
                            <h4 className="text-lg font-medium text-blue-800 mb-2">
                              Option A
                            </h4>
                            <p className="text-gray-700">
                              {
                                gameContent.questions[currentQuestionIndex]
                                  .option_a
                              }
                            </p>
                          </motion.button>

                          <motion.button
                            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg border-2 border-transparent hover:border-blue-600 transition-all text-left h-full"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleAnswer("b")}
                          >
                            <h4 className="text-lg font-medium text-blue-800 mb-2">
                              Option B
                            </h4>
                            <p className="text-gray-700">
                              {
                                gameContent.questions[currentQuestionIndex]
                                  .option_b
                              }
                            </p>
                          </motion.button>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                )}

                {gameState === "gameOver" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-black/50">
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      className="bg-white p-6 rounded-lg shadow-lg max-w-md"
                    >
                      <h2 className="text-2xl font-bold text-blue-800 mb-2">
                        Time's Up!
                      </h2>
                      <div className="flex justify-center items-center mb-4">
                        <Award className="h-12 w-12 text-yellow-500 mr-2" />
                        <span className="text-4xl font-bold text-blue-800">
                          {answers.length}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4">
                        You answered {answers.length} questions in{" "}
                        {formatTime(timeLimit - timeLeft)}!
                      </p>
                      <div className="flex justify-center space-x-3 mt-4">
                        <button
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center"
                          onClick={startGame}
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Play Again
                        </button>
                        <button
                          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                          onClick={() => router.push("/dashboard/games")}
                        >
                          Back to Games
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}

                {/* Pause Overlay */}
                {gameState === "paused" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-white p-4 rounded-lg shadow-lg"
                    >
                      <h3 className="text-xl font-bold text-blue-800 mb-2">
                        Game Paused
                      </h3>
                      <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center"
                        onClick={pauseGame}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Resume
                      </button>
                    </motion.div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 flex justify-between">
              {gameState === "playing" && (
                <button
                  className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
                  onClick={pauseGame}
                >
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </button>
              )}
              {gameState !== "playing" && gameState !== "intro" && (
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center"
                  onClick={startGame}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  New Game
                </button>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg shadow-md overflow-hidden h-full">
            <div className="p-4 border-b">
              <h2 className="text-xl font-bold text-blue-800">
                {gameState === "gameOver" ? "Your Insights" : "Game Info"}
              </h2>
            </div>
            <div className="p-4">
              {gameState === "gameOver" ? (
                <div className="space-y-4">
                  {/* Game Results */}
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">
                      Your Choices
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(insights).map(
                        ([questionId, data], index) => {
                          const question = gameContent?.questions.find(
                            (q) => q.id === questionId
                          );
                          if (!question) return null;

                          return (
                            <div
                              key={questionId}
                              className="bg-gray-50 p-3 rounded-md"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-sm font-medium text-blue-800">
                                  Question {index + 1}
                                </span>
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    data.choice === "a"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-purple-100 text-purple-800"
                                  }`}
                                >
                                  Option {data.choice.toUpperCase()}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                {data.choice === "a"
                                  ? question.option_a
                                  : question.option_b}
                              </p>
                              <p className="text-xs italic text-gray-500">
                                {data.insight}
                              </p>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h3 className="font-medium text-blue-800 mb-2">
                      What This Says About You
                    </h3>
                    <p className="text-gray-700 text-sm">
                      Your choices reveal your preferences and values related to
                      mental wellbeing. The more you play, the more you'll learn
                      about yourself and your approach to mental health.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">
                      How to Play
                    </h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>
                        You'll be presented with "Would You Rather" questions
                      </li>
                      <li>Choose the option that resonates with you more</li>
                      <li>
                        Answer as many questions as you can before time runs out
                      </li>
                      <li>
                        Each choice reveals something about your preferences
                      </li>
                      <li>
                        At the end, you'll see insights based on your choices
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Benefits</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>Promotes self-reflection and self-awareness</li>
                      <li>Helps clarify your personal values</li>
                      <li>
                        Encourages thinking about mental health preferences
                      </li>
                      <li>
                        Provides insights into your decision-making patterns
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h3 className="font-medium text-blue-800 mb-2">Tip</h3>
                    <p className="text-gray-700">
                      Go with your first instinct rather than overthinking each
                      choice. Your immediate reactions often reveal your true
                      preferences.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
