"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/app/components/navbar";
import { Heart, Trophy, Info, Star } from "lucide-react";

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
  const [showInstructions, setShowInstructions] = useState(false);
  const gameRef = useRef<HTMLDivElement>(null);
  const maxMisses = 3;
  const minActiveOrbs = 2;
  const maxActiveOrbs = 3;

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

  const getOrbColors = () => {
    // Use the same teal/blue-green color palette for all difficulties, but with varying intensity
    const palettes = {
      easy: [
        ["#016566", "#014D4E"], // Teal gradient (main site colors)
        ["#017778", "#015F60"], // Slightly lighter teal
        ["#018788", "#016F70"], // Slightly lighter teal
        ["#019798", "#017F80"], // Slightly lighter teal
      ],
      medium: [
        ["#016566", "#014D4E"], // Teal gradient (main site colors)
        ["#015556", "#013D3E"], // Slightly darker teal
        ["#014546", "#012D2E"], // Darker teal
        ["#013536", "#011D1E"], // Darker teal
      ],
      hard: [
        ["#016566", "#014D4E"], // Teal gradient (main site colors)
        ["#014546", "#012D2E"], // Darker teal
        ["#013536", "#011D1E"], // Darker teal
        ["#012526", "#010D0E"], // Very dark teal
      ],
    };

    // Default to medium if no difficulty selected
    const activePalette = difficulty ? palettes[difficulty] : palettes.medium;
    const selectedPalette =
      activePalette[Math.floor(Math.random() * activePalette.length)];

    return {
      from: selectedPalette[0],
      to: selectedPalette[1],
    };
  };

  const getFallSpeed = () => {
    // Base speed depends on difficulty - LOWER values = FASTER speed
    let baseSpeed = 30; // Default medium

    if (difficulty === "easy") {
      baseSpeed = 40;
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
    const colors = getOrbColors();

    orb.className =
      "game-orb absolute flex items-center justify-center select-none cursor-pointer";
    orb.style.width = `${Math.random() * 20 + 90}px`;
    orb.style.height = orb.style.width;
    orb.style.borderRadius = "50%";
    orb.style.background = `radial-gradient(circle, ${colors.from}, ${colors.to})`;
    orb.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.15)";
    orb.style.top = `0px`;
    orb.style.left = `${Math.random() * 80 + 10}%`;
    orb.style.transform = "translateX(-50%)";
    orb.style.transition = "transform 0.2s ease-out";
    orb.style.zIndex = "10";

    // Create inner text element
    const textElement = document.createElement("span");
    textElement.className = "text-center font-bold text-white";
    textElement.style.fontSize = "1rem"; // Slightly larger text
    textElement.style.padding = "0.5rem";
    textElement.style.textShadow =
      "0 2px 4px rgba(0, 0, 0, 0.6), 0 0 2px rgba(0, 0, 0, 0.9)"; // Stronger text shadow
    textElement.style.pointerEvents = "none";
    textElement.style.position = "relative";
    textElement.style.zIndex = "2";
    textElement.innerText = word;

    // Add a semi-transparent background behind the text for better readability
    const textBackground = document.createElement("div");
    textBackground.className =
      "absolute inset-0 rounded-full flex items-center justify-center";
    textBackground.style.background = "rgba(0, 0, 0, 0.2)"; // Semi-transparent black background
    textBackground.style.zIndex = "1";
    orb.appendChild(textBackground);

    // Add glow effect
    const glowElement = document.createElement("div");
    glowElement.className = "absolute inset-0 rounded-full";
    glowElement.style.background = `radial-gradient(circle, ${colors.from}33, transparent 70%)`;
    glowElement.style.filter = "blur(8px)";
    glowElement.style.transform = "scale(1.2)";
    glowElement.style.opacity = "0.7";
    glowElement.style.pointerEvents = "none";

    orb.appendChild(glowElement);
    orb.appendChild(textElement);

    let topPosition = 0;
    const intervalSpeed = getFallSpeed();

    const fallInterval = setInterval(() => {
      topPosition += 5;
      orb.style.top = `${topPosition}px`;

      if (topPosition >= window.innerHeight - 100) {
        clearInterval(fallInterval);
        orb.classList.add("missed");

        // Add miss animation
        orb.style.transform = "translateX(-50%) scale(0.5)";
        orb.style.opacity = "0";
        orb.style.transition = "transform 0.3s ease-out, opacity 0.3s ease-out";

        setTimeout(() => {
          orb.remove();
          setActiveOrbCount((prev) => prev - 1);
        }, 300);

        setMisses((prev) => {
          const newMisses = prev + 1;
          if (newMisses >= maxMisses) {
            endGame();
          }
          return newMisses;
        });
      }
    }, intervalSpeed);

    // Hover effect
    orb.onmouseenter = () => {
      orb.style.transform = "translateX(-50%) scale(1.1)";
      orb.style.boxShadow = "0 12px 32px rgba(0, 0, 0, 0.25)";
    };

    orb.onmouseleave = () => {
      orb.style.transform = "translateX(-50%) scale(1)";
      orb.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.15)";
    };

    orb.onclick = () => {
      clearInterval(fallInterval);

      // Add click animation
      orb.style.transform = "translateX(-50%) scale(1.3)";
      orb.style.opacity = "0";
      orb.style.transition = "transform 0.4s ease-out, opacity 0.4s ease-out";

      // Create particle effect
      createParticles(Number.parseInt(orb.style.left), topPosition, colors);

      setTimeout(() => {
        orb.remove();
        setActiveOrbCount((prev) => prev - 1);
      }, 400);

      setScore((prev) => prev + 1);
      setCollectedWords((prev) => [...prev, word]);
    };

    gameRef.current.appendChild(orb);
  };

  const createParticles = (
    x: number,
    y: number,
    colors: { from: string; to: string }
  ) => {
    if (!gameRef.current) return;

    const particleCount = 8;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      particle.className = "absolute rounded-full";
      particle.style.width = `${Math.random() * 10 + 5}px`;
      particle.style.height = particle.style.width;
      particle.style.background = Math.random() > 0.5 ? colors.from : colors.to;
      particle.style.left = `${x}%`;
      particle.style.top = `${y}px`;
      particle.style.transform = "translate(-50%, -50%)";
      particle.style.opacity = "1";
      particle.style.zIndex = "5";

      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 100 + 50;
      const destinationX = x + (Math.cos(angle) * distance) / 10;
      const destinationY = y + Math.sin(angle) * distance;

      particle.animate(
        [
          { transform: "translate(-50%, -50%) scale(1)", opacity: 1 },
          {
            transform: `translate(calc(-50% + ${
              Math.cos(angle) * distance
            }px), calc(-50% + ${Math.sin(angle) * distance}px)) scale(0)`,
            opacity: 0,
          },
        ],
        {
          duration: Math.random() * 500 + 500,
          easing: "cubic-bezier(0.1, 0.8, 0.2, 1)",
        }
      );

      gameRef.current.appendChild(particle);

      setTimeout(() => {
        particle.remove();
      }, 1000);
    }
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
      <div className="relative flex-1 overflow-hidden bg-gradient-to-br from-[#f0f7fa] to-[#fff8f0] font-sans">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 25 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full opacity-20"
              style={{
                width: `${Math.random() * 300 + 50}px`,
                height: `${Math.random() * 300 + 50}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                background: `radial-gradient(circle, ${
                  [
                    "#014D4E",
                    "#016566",
                    "#FFE4C4",
                    "#E6F2F2",
                    "#f0f4f8",
                    "#f0f7f7",
                  ][Math.floor(Math.random() * 6)]
                }, transparent)`,
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
              {/* Score display */}
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="fixed top-24 left-4 bg-white/90 backdrop-blur-sm text-gray-800 text-lg p-3 px-5 rounded-full shadow-lg z-10 border border-[#E6F2F2] transition-all duration-300"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#014D4E] to-[#016566] rounded-full flex items-center justify-center text-white mr-2 shadow-md">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 font-medium">
                      SCORE
                    </span>
                    <span className="font-bold text-xl">{score}</span>
                  </div>
                </div>
              </motion.div>

              {/* Lives display */}
              <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="fixed top-24 right-4 bg-white/90 backdrop-blur-sm text-gray-800 text-lg p-3 px-5 rounded-full shadow-lg z-10 border border-[#E6F2F2] flex items-center transition-all duration-300"
              >
                <div className="flex flex-col items-end mr-2">
                  <span className="text-xs text-gray-500 font-medium">
                    LIVES
                  </span>
                  <span className="sr-only">
                    Lives remaining: {maxMisses - misses}
                  </span>
                </div>
                <div className="flex">
                  {Array(maxMisses)
                    .fill(0)
                    .map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 1 }}
                        animate={{
                          scale:
                            i === maxMisses - misses - 1 && misses > 0
                              ? [1, 1.5, 1]
                              : 1,
                          opacity: i < maxMisses - misses ? 1 : 0.3,
                        }}
                        transition={{ duration: 0.5 }}
                        className={`w-6 h-6 mx-0.5 flex items-center justify-center transition-all duration-300`}
                      >
                        <Heart
                          className={`w-5 h-5 ${
                            i < maxMisses - misses
                              ? "text-red-500 fill-red-500"
                              : "text-gray-300"
                          }`}
                        />
                      </motion.div>
                    ))}
                </div>
              </motion.div>

              {/* Difficulty badge */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="fixed top-40 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium shadow-md z-10 border border-[#E6F2F2] transition-all duration-300"
              >
                <div className="flex items-center">
                  <span className="font-bold uppercase tracking-wider text-[#014D4E] mr-2">
                    {difficulty} Mode
                  </span>
                  <div
                    className={`w-3 h-3 rounded-full ${
                      difficulty === "easy"
                        ? "bg-green-500"
                        : difficulty === "medium"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                  ></div>
                </div>
              </motion.div>

              {/* Info button */}
              <motion.button
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                onClick={() => setShowInstructions(true)}
                className="fixed top-40 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md z-10 border border-[#E6F2F2] hover:bg-[#E6F2F2]/50 transition-all duration-300"
                aria-label="Show instructions"
              >
                <Info className="w-5 h-5 text-[#014D4E]" />
              </motion.button>
            </>
          )}

          <AnimatePresence>
            {showInstructions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
                onClick={() => setShowInstructions(false)}
              >
                <motion.div
                  initial={{ y: 20 }}
                  animate={{ y: 0 }}
                  className="bg-white rounded-2xl p-8 max-w-md m-4 shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-2xl font-bold mb-4 text-[#014D4E]">
                    How to Play
                  </h3>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <div className="bg-[#E6F2F2] rounded-full p-1 mr-3 mt-0.5">
                        <Star className="w-4 h-4 text-[#014D4E]" />
                      </div>
                      <p>
                        Colorful orbs with positive words will fall from the top
                      </p>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-[#E6F2F2] rounded-full p-1 mr-3 mt-0.5">
                        <Star className="w-4 h-4 text-[#014D4E]" />
                      </div>
                      <p>Click on them before they reach the bottom</p>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-[#E6F2F2] rounded-full p-1 mr-3 mt-0.5">
                        <Star className="w-4 h-4 text-[#014D4E]" />
                      </div>
                      <p>You have 3 lives - don't miss too many!</p>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-[#E6F2F2] rounded-full p-1 mr-3 mt-0.5">
                        <Star className="w-4 h-4 text-[#014D4E]" />
                      </div>
                      <p>Collect as many positive words as you can</p>
                    </li>
                  </ul>
                  <button
                    onClick={() => setShowInstructions(false)}
                    className="w-full bg-gradient-to-r from-[#014D4E] to-[#016566] text-white font-medium py-2 px-4 rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Got it!
                  </button>
                </motion.div>
              </motion.div>
            )}

            {!gameStarted && !gameOver && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-xl text-center z-20 w-96 border border-[#E6F2F2]"
              >
                <motion.div
                  initial={{ y: -20 }}
                  animate={{ y: 0 }}
                  className="mb-6"
                >
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-[#014D4E] to-[#016566] rounded-full flex items-center justify-center">
                    <span className="text-4xl">✨</span>
                  </div>
                  <h2 className="text-4xl font-bold mb-2 text-[#014D4E] tracking-tight">
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
                  className="mb-8 bg-gradient-to-r from-[#E6F2F2]/30 to-[#FFE4C4]/30 p-4 rounded-xl"
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
                    className="bg-gradient-to-r from-[#014D4E] to-[#016566] text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg border border-[#E6F2F2] flex justify-between items-center"
                  >
                    <span>Easy</span>
                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => startGame("medium")}
                    className="bg-gradient-to-r from-[#014D4E] to-[#016566] text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg border border-[#E6F2F2] flex justify-between items-center"
                  >
                    <span>Medium</span>
                    <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => startGame("hard")}
                    className="bg-gradient-to-r from-[#014D4E] to-[#016566] text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg border border-[#E6F2F2] flex justify-between items-center"
                  >
                    <span>Hard</span>
                    <div className="w-4 h-4 rounded-full bg-red-500"></div>
                  </motion.button>
                </div>
              </motion.div>
            )}

            {gameOver && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-xl text-center z-20 w-96 border border-[#E6F2F2]"
              >
                <div className="mb-4 flex justify-center">
                  <motion.div
                    initial={{ rotate: 0, scale: 0.8 }}
                    animate={{ rotate: 360, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="w-20 h-20 bg-gradient-to-r from-[#014D4E] to-[#016566] rounded-full flex items-center justify-center text-white"
                  >
                    <span className="text-3xl">🎉</span>
                  </motion.div>
                </div>
                <h2 className="text-3xl font-bold mb-4 text-[#014D4E]">
                  Game Over!
                </h2>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-r from-[#E6F2F2]/50 to-[#FFE4C4]/50 p-4 rounded-xl mb-6"
                >
                  <p className="text-gray-700 mb-1">Your Score</p>
                  <motion.p
                    initial={{ scale: 0.5 }}
                    animate={{ scale: [0.5, 1.2, 1] }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="text-4xl font-bold text-[#014D4E] mb-2"
                  >
                    {score}
                  </motion.p>
                  <p className="text-sm text-gray-500">
                    {score < 5
                      ? "Good effort! Keep practicing."
                      : score < 15
                      ? "Well done! You're getting better."
                      : "Amazing job! You're a pro!"}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mb-6"
                >
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
                </motion.div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
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
