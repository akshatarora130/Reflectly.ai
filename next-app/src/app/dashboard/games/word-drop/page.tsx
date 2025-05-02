"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Loader2,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  Play,
  Award,
  Heart,
  Clock,
} from "lucide-react";
import "react-toastify/dist/ReactToastify.css";

interface GameContent {
  paragraph: string;
  difficulty: string;
  theme: string;
}

export default function WordDropGame() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [gameContent, setGameContent] = useState<GameContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameState, setGameState] = useState<
    "intro" | "countdown" | "playing" | "gameOver"
  >("intro");
  const [countdownValue, setCountdownValue] = useState(3);
  const [score, setScore] = useState(0);
  const [paragraphWords, setParagraphWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [collectedWords, setCollectedWords] = useState<string[]>([]);
  const [misses, setMisses] = useState(0);
  const [difficulty, setDifficulty] = useState("medium");
  const [theme, setTheme] = useState("general");
  const [gameTime, setGameTime] = useState(0);
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const orbIntervals = useRef<{ [key: string]: NodeJS.Timeout }>({});

  const maxMisses = 1; // Game ends after 1 miss

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    // Clean up all intervals on unmount
    return () => {
      Object.values(orbIntervals.current).forEach((interval) => {
        clearInterval(interval);
      });
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current);
      }
    };
  }, []);

  // Handle countdown
  useEffect(() => {
    if (gameState === "countdown" && countdownValue > 0) {
      const timer = setTimeout(() => {
        setCountdownValue(countdownValue - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (gameState === "countdown" && countdownValue === 0) {
      // Start the game after countdown reaches 0
      setGameState("playing");
      setGameTime(0);

      // Start the game timer
      gameTimerRef.current = setInterval(() => {
        setGameTime((prev) => prev + 1);
      }, 1000);

      // Start spawning words
      setTimeout(() => {
        spawnNextWord();
      }, 500);
    }
  }, [gameState, countdownValue]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Parse paragraph into words
  const parseParagraph = (paragraph: string): string[] => {
    // Split by spaces and remove punctuation
    const words = paragraph
      .split(/\s+/)
      .map((word) => word.trim())
      .filter((word) => word.length > 0)
      .map((word) => word.replace(/[.,!?;:()[\]{}""'']/g, ""));

    return words;
  };

  const randomColor = () => {
    const colors = [
      "#ff6ec4",
      "#7873f5",
      "#f9ca24",
      "#00cec9",
      "#fd79a8",
      "#55efc4",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const getFallSpeed = () => {
    const baseSpeed = 50; // ms
    if (score >= 30) return Math.max(10, baseSpeed - 20);
    if (score >= 15) return Math.max(10, baseSpeed - 10);
    return baseSpeed;
  };

  const startGame = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Sample data for testing if API fails
      const sampleData = {
        paragraph:
          "You are so unique and incredible! Your spirit is radiating with strength! You possess endless energy and courage!",
        difficulty: difficulty,
        theme: theme,
      };

      // Fetch game content when starting the game
      let data;
      try {
        const response = await fetch(
          `/api/games/word-drop/content?difficulty=${difficulty}&theme=${theme}`
        );

        if (response.status === 401) {
          setError("Unauthorized. Please log in again.");
          router.push("/login");
          return;
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `API returned ${response.status}`);
        }

        data = await response.json();
      } catch (fetchError) {
        setError(
          "Using default content due to connection issues. The game will still work!"
        );
        data = sampleData;
      }

      setGameContent(data);

      // Parse paragraph into words
      const words = parseParagraph(data.paragraph);
      setParagraphWords(words);

      // Reset game state
      setScore(0);
      setMisses(0);
      setCollectedWords([]);
      setCurrentWordIndex(0);
      setCountdownValue(3);
      setGameTime(0);

      // Clear any existing intervals
      Object.values(orbIntervals.current).forEach((interval) => {
        clearInterval(interval);
      });
      orbIntervals.current = {};

      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current);
      }

      // Start countdown
      setGameState("countdown");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to start the game";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const spawnOrb = (word: string) => {
    if (!gameAreaRef.current || gameState !== "playing") return;

    const gameArea = gameAreaRef.current;
    const orbId = `orb-${Date.now()}-${Math.random()}`;

    // Create orb element with inline styles since we're not using global.css
    const orb = document.createElement("div");
    orb.id = orbId;
    orb.innerText = word;

    // Apply styles directly to the element
    orb.style.position = "absolute";
    orb.style.padding = "0.75rem 1rem";
    orb.style.borderRadius = "9999px";
    orb.style.cursor = "pointer";
    orb.style.userSelect = "none";
    orb.style.color = "white";
    orb.style.fontWeight = "bold";
    orb.style.textAlign = "center";
    orb.style.minWidth = "80px";
    orb.style.fontSize = "20px"; // Increased font size
    orb.style.border = "2px solid white";
    orb.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
    orb.style.zIndex = "10";
    orb.style.transform = "translate(-50%, -50%)";
    orb.style.background = `radial-gradient(circle, ${randomColor()}, ${randomColor()})`;
    orb.style.top = "0px";
    orb.style.left = `${Math.random() * 80 + 10}%`;

    // Add click handler
    orb.onclick = () => {
      // Clear the interval
      if (orbIntervals.current[orbId]) {
        clearInterval(orbIntervals.current[orbId]);
        delete orbIntervals.current[orbId];
      }

      // Update score
      setScore((prevScore) => prevScore + 1);
      setCollectedWords((prev) => [...prev, word]);

      // Remove the orb with animation
      orb.style.transition = "all 0.3s ease-out";
      orb.style.transform = "translate(-50%, -50%) scale(1.5)";
      orb.style.opacity = "0";

      setTimeout(() => {
        orb.remove();
      }, 300);

      // Spawn next word
      spawnNextWord();
    };

    gameArea.appendChild(orb);

    // Animate falling
    let topPosition = 0;
    const intervalSpeed = getFallSpeed();

    const fallInterval = setInterval(() => {
      if (gameState !== "playing") {
        clearInterval(fallInterval);
        return;
      }

      topPosition += 5;
      orb.style.top = `${topPosition}px`;

      // Check if orb has reached the bottom
      if (topPosition >= gameArea.clientHeight - 50) {
        clearInterval(fallInterval);
        delete orbIntervals.current[orbId];
        orb.remove();

        // End game immediately if a word reaches the bottom
        endGame();
        return;
      }
    }, intervalSpeed);

    // Store the interval reference
    orbIntervals.current[orbId] = fallInterval;
  };

  const spawnNextWord = () => {
    if (gameState !== "playing") return;

    if (paragraphWords.length === 0) return;

    if (currentWordIndex < paragraphWords.length) {
      const nextWord = paragraphWords[currentWordIndex];
      setCurrentWordIndex((prev) => prev + 1);
      spawnOrb(nextWord);
    } else {
      // If we've gone through all words, start over
      setCurrentWordIndex(0);
      setTimeout(() => {
        if (gameState === "playing") {
          spawnNextWord();
        }
      }, 1000);
    }
  };

  const endGame = () => {
    setGameState("gameOver");

    // Clear all intervals
    Object.values(orbIntervals.current).forEach((interval) => {
      clearInterval(interval);
    });
    orbIntervals.current = {};

    // Stop the game timer
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
    }

    // Remove all orbs
    if (gameAreaRef.current) {
      const orbs = gameAreaRef.current.querySelectorAll("div[id^='orb-']");
      orbs.forEach((orb) => orb.remove());
    }
  };

  // Generate a title based on theme and difficulty
  const getGameTitle = () => {
    const themeTitle =
      {
        general: "Mental Wellness",
        resilience: "Building Resilience",
        mindfulness: "Mindful Moments",
        "self-care": "Self-Care Journey",
        gratitude: "Gratitude Practice",
      }[theme] || "Word Catcher";

    return `${themeTitle} - ${
      difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
    }`;
  };

  // Generate a motivational message based on score
  const getMotivationalMessage = () => {
    const totalWords = paragraphWords?.length || 0;
    const collectedPercentage =
      totalWords > 0 ? (collectedWords.length / totalWords) * 100 : 0;

    if (collectedPercentage >= 90) {
      return "Amazing job! Your focus and quick reflexes are impressive!";
    } else if (collectedPercentage >= 70) {
      return "Great work! You're making excellent progress on your mental wellness journey.";
    } else if (collectedPercentage >= 50) {
      return "Good effort! Remember, practice makes perfect.";
    } else {
      return "Keep going! Every small step counts toward your mental wellness.";
    }
  };

  // Reconstruct the paragraph with collected words highlighted
  const renderHighlightedParagraph = () => {
    if (!gameContent || !paragraphWords || paragraphWords.length === 0)
      return null;

    // Create a set of collected words for faster lookup
    const collectedWordsSet = new Set(collectedWords);

    return (
      <div className="text-gray-700 leading-relaxed">
        {paragraphWords.map((word, index) => {
          const className = collectedWordsSet.has(word)
            ? "bg-green-100 text-green-800 px-1 rounded"
            : "bg-red-100 text-red-800 px-1 rounded";

          return (
            <span key={`word-${index}`}>
              <span className={className}>{word}</span>
              {index < paragraphWords.length - 1 && " "}
            </span>
          );
        })}
      </div>
    );
  };

  // Show loading state while checking authentication
  if (status === "loading" || isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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

        <div className="flex items-center space-x-2">
          {gameState === "playing" && (
            <>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <Clock className="h-3 w-3 mr-1" />
                {formatTime(gameTime)}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Score: {score}
              </span>
              <div className="flex items-center space-x-1">
                {misses < maxMisses ? (
                  <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                ) : (
                  <Heart className="h-4 w-4 text-gray-300" />
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-md mb-6 relative"
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
                  {getGameTitle()}
                </h2>
              </div>
              <p className="text-gray-600 mt-1">
                {gameState === "intro" &&
                  "Catch the falling words before they reach the bottom!"}
                {gameState === "countdown" && "Get ready to catch words!"}
                {gameState === "playing" && "Click on words to catch them!"}
                {gameState === "gameOver" &&
                  "Game over! See your results below."}
              </p>
            </div>

            <div className="relative">
              {/* Game Area */}
              <div
                ref={gameAreaRef}
                className="relative w-full h-[500px] bg-gradient-to-b from-blue-50 to-purple-50 overflow-hidden border-t border-b border-gray-200"
                style={{ touchAction: "none" }} // Prevent scrolling on mobile
              >
                {gameState === "intro" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <h2 className="text-2xl font-bold text-blue-800 mb-4">
                        Word Catcher
                      </h2>
                      <p className="text-gray-600 mb-6 max-w-md">
                        Catch the falling words from positive mental health
                        affirmations before they reach the bottom. Each word you
                        catch adds to your score!
                      </p>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Difficulty
                          </label>
                          <select
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Theme
                          </label>
                          <select
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="general">General</option>
                            <option value="resilience">Resilience</option>
                            <option value="mindfulness">Mindfulness</option>
                            <option value="self-care">Self-Care</option>
                            <option value="gratitude">Gratitude</option>
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

                {/* Countdown overlay */}
                {gameState === "countdown" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-50">
                    <motion.div
                      key={countdownValue}
                      initial={{ scale: 2, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="text-white text-9xl font-bold"
                    >
                      {countdownValue}
                    </motion.div>
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
                        Game Over!
                      </h2>
                      <div className="flex justify-center items-center mb-4">
                        <Award className="h-12 w-12 text-yellow-500 mr-2" />
                        <span className="text-4xl font-bold text-blue-800">
                          {score}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-1">
                        You caught {collectedWords.length} words!
                      </p>
                      <p className="text-gray-600 mb-4">
                        Time: {formatTime(gameTime)}
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
              </div>
            </div>

            <div className="p-4 flex justify-between">
              {gameState !== "playing" &&
                gameState !== "intro" &&
                gameState !== "countdown" && (
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
                {gameState === "gameOver" ? "Game Results" : "Game Info"}
              </h2>
            </div>
            <div className="p-4">
              {gameState === "gameOver" ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">
                      Your Affirmation
                    </h3>
                    {renderHighlightedParagraph()}
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">
                      Words Caught ({collectedWords.length})
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {collectedWords.map((word, index) => (
                        <span
                          key={`caught-${index}`}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                        >
                          {word}
                        </span>
                      ))}
                      {collectedWords.length === 0 && (
                        <p className="text-sm text-gray-500">No words caught</p>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h3 className="font-medium text-blue-800 mb-2">
                      Reflection
                    </h3>
                    <p className="text-gray-700">{getMotivationalMessage()}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">
                      How to Play
                    </h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>Words will fall from the top of the screen</li>
                      <li>
                        Click or tap on words to catch them before they reach
                        the bottom
                      </li>
                      <li>Each caught word adds to your score</li>
                      <li>The game ends when a word reaches the bottom</li>
                      <li>Try to catch as many words as you can!</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Benefits</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>Improves focus and attention</li>
                      <li>Enhances hand-eye coordination</li>
                      <li>Reinforces positive mental health language</li>
                      <li>Provides a fun way to practice mindfulness</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h3 className="font-medium text-blue-800 mb-2">Tip</h3>
                    <p className="text-gray-700">
                      Try to focus on the words that are closest to the bottom
                      first, then work your way up. This strategy helps manage
                      multiple falling words effectively.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
