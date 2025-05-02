"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/app/components/navbar";

export default function WordDropGame() {
  const [score, setScore] = useState(0);
  const [collectedWords, setCollectedWords] = useState<string[]>([]);
  const [misses, setMisses] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState<
    "easy" | "medium" | "hard" | null
  >(null);
  const [activeOrbCount, setActiveOrbCount] = useState(0);
  const gameRef = useRef<HTMLDivElement>(null);
  const maxMisses = 3;
  const minActiveOrbs = 2; // Minimum number of words to spawn at once
  const maxActiveOrbs = 3; // Maximum number of words to spawn at once

  // Expanded list of positive words
  const positiveWords = [
    // Personal qualities
    "brave",
    "unstoppable",
    "strong",
    "kind",
    "beautiful",
    "amazing",
    "fearless",
    "powerful",
    "resilient",
    "creative",
    "joyful",
    "radiant",
    "incredible",
    "unique",
    "limitless",
    "inspiring",
    "energetic",
    "motivated",
    "dedicated",
    "wonderful",
    "outstanding",
    "brilliant",
    "exceptional",
    "magnificent",
    "talented",
    "extraordinary",
    "vibrant",
    "glowing",
    "determined",
    "passionate",
    "genuine",
    "authentic",
    "loving",
    "caring",
    "thoughtful",
    "generous",
    "wise",
    "intelligent",
    "clever",
    "bright",
    "gifted",
    "remarkable",
    "confident",
    "courageous",
    "bold",
    "daring",
    "adventurous",
    "optimistic",
    "positive",
    "cheerful",
    "enthusiastic",
    "spirited",
    "lively",
    "dynamic",
    "innovative",
    "original",
    "imaginative",
    "resourceful",
    "adaptable",
    "flexible",
    "persistent",
    "tenacious",
    "focused",

    // Emotional states
    "happy",
    "peaceful",
    "grateful",
    "blessed",
    "content",
    "fulfilled",
    "hopeful",
    "serene",
    "tranquil",
    "calm",
    "balanced",
    "harmonious",
    "blissful",
    "delighted",
    "ecstatic",
    "elated",
    "thrilled",
    "excited",
    "enchanted",
    "captivated",
    "fascinated",

    // Growth words
    "growing",
    "evolving",
    "thriving",
    "blooming",
    "flourishing",
    "ascending",
    "progressing",
    "developing",
    "advancing",
    "improving",
    "transforming",
    "expanding",
    "elevating",
    "rising",

    // Success words
    "successful",
    "accomplished",
    "achieving",
    "victorious",
    "triumphant",
    "winning",
    "excelling",
    "prosperous",
    "abundant",
    "fortunate",
    "lucky",
    "blessed",
    "favored",
    "privileged",

    // Relationship words
    "loved",
    "cherished",
    "adored",
    "treasured",
    "valued",
    "appreciated",
    "respected",
    "admired",
    "esteemed",
    "honored",
    "revered",
    "celebrated",
    "embraced",
    "accepted",
  ];

  const randomColor = () => {
    // Using the app's color scheme
    const colors = [
      "#014D4E", // Main teal
      "#016566", // Darker teal
      "#FFE4C4", // Beige
      "#E6F2F2", // Light teal
      "#f0f4f8", // Light blue-gray
      "#f0f7f7", // Very light teal
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const getFallSpeed = () => {
    // Base speed depends on difficulty - LOWER values = FASTER speed
    let baseSpeed = 30; // Default medium (faster than before)

    if (difficulty === "easy") {
      baseSpeed = 40; // Faster than before but still easier than medium
    } else if (difficulty === "hard") {
      baseSpeed = 15; // Much faster
    }

    // Further adjust based on score - make it even faster as score increases
    if (score >= 30) return Math.max(8, baseSpeed - 15);
    if (score >= 15) return Math.max(10, baseSpeed - 10);
    return baseSpeed;
  };

  const getRandomPositiveWord = () => {
    return positiveWords[Math.floor(Math.random() * positiveWords.length)];
  };

  const spawnOrb = (word: string) => {
    if (!gameRef.current || gameOver || !gameStarted) return;

    setActiveOrbCount((prev) => prev + 1);

    const orb = document.createElement("div");
    orb.className =
      "game-orb absolute w-24 h-24 rounded-full text-white text-center font-bold cursor-pointer shadow-lg transition-transform duration-200 hover:scale-110 flex items-center justify-center select-none";
    orb.style.background = `radial-gradient(circle, ${randomColor()}, ${randomColor()})`;
    orb.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.2)";
    orb.style.top = `0px`;
    orb.style.left = `${Math.random() * 80 + 10}%`;
    orb.style.fontSize = "0.9rem";
    orb.style.padding = "0.5rem";
    orb.style.textShadow = "0 1px 2px rgba(0, 0, 0, 0.3)";
    orb.innerText = word;

    let topPosition = 0;
    const intervalSpeed = getFallSpeed();

    const fallInterval = setInterval(() => {
      topPosition += 5;
      orb.style.top = `${topPosition}px`;

      if (topPosition >= window.innerHeight - 100) {
        clearInterval(fallInterval);
        orb.remove();
        setActiveOrbCount((prev) => prev - 1);
        setMisses((prev) => {
          const newMisses = prev + 1;
          if (newMisses >= maxMisses) {
            endGame();
          }
          return newMisses;
        });
      }
    }, intervalSpeed);

    orb.onclick = () => {
      clearInterval(fallInterval);
      setScore((prev) => prev + 1);
      setCollectedWords((prev) => [...prev, word]);
      orb.remove();
      setActiveOrbCount((prev) => prev - 1);
    };

    gameRef.current.appendChild(orb);
  };

  const spawnWords = () => {
    if (gameOver || !gameStarted) return;

    // Determine how many orbs to spawn (between min and max)
    const orbsToSpawn =
      minActiveOrbs +
      Math.floor(Math.random() * (maxActiveOrbs - minActiveOrbs + 1));

    // Spawn the determined number of orbs
    for (let i = 0; i < orbsToSpawn; i++) {
      spawnOrb(getRandomPositiveWord());
    }
  };

  const startGame = (selectedDifficulty: "easy" | "medium" | "hard") => {
    setDifficulty(selectedDifficulty);
    setGameStarted(true);
    setScore(0);
    setMisses(0);
    setCollectedWords([]);
    setGameOver(false);
    setActiveOrbCount(0);
  };

  const endGame = () => {
    setGameOver(true);
  };

  const restartGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setScore(0);
    setMisses(0);
    setCollectedWords([]);
    setActiveOrbCount(0);

    // Remove any existing orbs
    const elements = document.querySelectorAll(".game-orb");
    elements.forEach((el) => el.remove());
  };

  useEffect(() => {
    let gameInterval: NodeJS.Timeout | null = null;

    if (gameStarted && !gameOver) {
      // Start spawning words every 2 seconds
      gameInterval = setInterval(() => {
        spawnWords();
      }, 2000);
    }

    return () => {
      if (gameInterval) clearInterval(gameInterval);
    };
  }, [gameStarted, gameOver]);

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="relative flex-1 overflow-hidden bg-gradient-to-br from-[#f0f4f8] to-[#FFF5EB] font-sans">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full opacity-20"
              style={{
                width: `${Math.random() * 300 + 50}px`,
                height: `${Math.random() * 300 + 50}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                background: `radial-gradient(circle, ${randomColor()}, transparent)`,
                animation: `float ${
                  Math.random() * 20 + 10
                }s infinite ease-in-out`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>

        <div
          ref={gameRef}
          className="relative w-full h-full flex flex-col justify-start items-center pt-12"
        >
          {gameStarted && (
            <>
              <div className="fixed top-24 left-4 bg-white/90 backdrop-blur-sm text-gray-800 text-lg p-3 px-5 rounded-full shadow-lg z-10 border border-[#E6F2F2] transition-all duration-300">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#014D4E] to-[#016566] rounded-full flex items-center justify-center text-white mr-2 shadow-md">
                    <span className="font-bold">{score}</span>
                  </div>
                  <span className="font-medium">Score</span>
                </div>
              </div>
              <div className="fixed top-24 right-4 bg-white/90 backdrop-blur-sm text-gray-800 text-lg p-3 px-5 rounded-full shadow-lg z-10 border border-[#E6F2F2] flex items-center transition-all duration-300">
                <span className="font-medium mr-2">Lives</span>
                <div className="flex">
                  {Array(maxMisses)
                    .fill(0)
                    .map((_, i) => (
                      <div
                        key={i}
                        className={`w-6 h-6 mx-0.5 ${
                          i < maxMisses - misses
                            ? "text-red-500"
                            : "text-gray-300"
                        } transition-all duration-300`}
                      >
                        ❤️
                      </div>
                    ))}
                </div>
              </div>

              {/* Difficulty badge */}
              <div className="fixed top-40 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium shadow-md z-10 border border-[#E6F2F2] transition-all duration-300">
                <span
                  className={`${
                    difficulty === "easy"
                      ? "text-[#016566]"
                      : difficulty === "medium"
                      ? "text-[#014D4E]"
                      : "text-[#013638]"
                  } font-bold`}
                >
                  {difficulty?.toUpperCase()} MODE
                </span>
              </div>
            </>
          )}

          <AnimatePresence>
            {!gameStarted && !gameOver && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl text-center z-20 w-96 border border-[#E6F2F2]"
              >
                <motion.div
                  initial={{ y: -20 }}
                  animate={{ y: 0 }}
                  className="mb-6"
                >
                  <h2 className="text-4xl font-bold mb-2 text-[#014D4E]">
                    Word Drop
                  </h2>
                  <p className="text-gray-600">
                    Catch positive words to boost your mood!
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mb-8 bg-[#E6F2F2]/30 p-4 rounded-xl"
                >
                  <p className="text-gray-700 mb-2 font-medium">How to play:</p>
                  <ul className="text-sm text-gray-600 text-left list-disc pl-5 space-y-1">
                    <li>
                      Colorful orbs with positive words will fall from the top
                    </li>
                    <li>Click on them before they reach the bottom</li>
                    <li>You have 3 lives - don't miss too many!</li>
                    <li>Collect as many positive words as you can</li>
                  </ul>
                </motion.div>

                <p className="mb-6 text-gray-700 font-medium">
                  Select difficulty:
                </p>
                <div className="flex flex-col gap-3">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => startGame("easy")}
                    className="bg-gradient-to-r from-[#014D4E] to-[#016566] text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg border border-[#E6F2F2]"
                  >
                    Easy
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => startGame("medium")}
                    className="bg-gradient-to-r from-[#016566] to-[#014D4E] text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg border border-[#E6F2F2]"
                  >
                    Medium
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => startGame("hard")}
                    className="bg-gradient-to-r from-[#013638] to-[#014D4E] text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg border border-[#E6F2F2]"
                  >
                    Hard
                  </motion.button>
                </div>
              </motion.div>
            )}

            {gameOver && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl text-center z-20 w-96 border border-[#E6F2F2]"
              >
                <div className="mb-2 flex justify-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#014D4E] to-[#016566] rounded-full flex items-center justify-center text-white">
                    <span className="text-3xl">🎉</span>
                  </div>
                </div>
                <h2 className="text-3xl font-bold mb-4 text-[#014D4E]">
                  Game Over!
                </h2>

                <div className="bg-[#E6F2F2]/30 p-4 rounded-xl mb-6">
                  <p className="text-gray-700 mb-1">Your Score</p>
                  <p className="text-4xl font-bold text-[#014D4E] mb-2">
                    {score}
                  </p>
                  <p className="text-sm text-gray-500">
                    {score < 5
                      ? "Good effort! Keep practicing."
                      : score < 15
                      ? "Well done! You're getting better."
                      : "Amazing job! You're a pro!"}
                  </p>
                </div>

                <div className="mb-6">
                  <p className="font-medium text-gray-700 mb-2">
                    Your Positive Words:
                  </p>
                  <div className="max-h-32 overflow-y-auto bg-gradient-to-r from-[#E6F2F2]/30 to-[#FFE4C4]/30 p-4 rounded-xl">
                    <p className="italic text-lg text-gray-700">
                      {collectedWords.length > 0
                        ? `"${collectedWords.join(" ")}"`
                        : "No words collected"}
                    </p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={restartGame}
                  className="bg-gradient-to-r from-[#014D4E] to-[#016566] hover:from-[#013638] hover:to-[#015556] text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg w-full"
                >
                  Play Again
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Custom CSS for floating animation */}
        <style jsx>{`
          @keyframes float {
            0%,
            100% {
              transform: translateY(0) rotate(0deg);
            }
            50% {
              transform: translateY(-20px) rotate(5deg);
            }
          }
        `}</style>
      </div>
    </div>
  );
}
