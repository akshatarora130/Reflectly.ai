"use client";

import { useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import confetti from "canvas-confetti";
import Navbar from "@/app/components/navbar";

interface MemoryCard {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
  pairId: number;
}

type ThemeOption = "mindfulness" | "emotions" | "nature" | "animals" | "food";

interface ThemeData {
  title: string;
  description: string;
  emojis: string[];
}

export default function MemoryMatchGame() {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [selectedTheme, setSelectedTheme] =
    useState<ThemeOption>("mindfulness");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium"
  );

  // Emoji themes
  const themes: Record<ThemeOption, ThemeData> = {
    mindfulness: {
      title: "Mindfulness & Meditation",
      description: "Find pairs of calming and mindful emojis",
      emojis: [
        "🧘",
        "🌈",
        "🕊️",
        "🌸",
        "🌊",
        "☯️",
        "🧠",
        "🌿",
        "🔮",
        "🌙",
        "🌞",
        "🍃",
      ],
    },
    emotions: {
      title: "Emotional Wellness",
      description: "Match pairs of emotion-related emojis",
      emojis: [
        "😊",
        "😌",
        "🥰",
        "😇",
        "😎",
        "🤗",
        "😄",
        "😍",
        "🥳",
        "😁",
        "😉",
        "☺️",
      ],
    },
    nature: {
      title: "Nature & Outdoors",
      description: "Find pairs of nature-themed emojis",
      emojis: [
        "🌲",
        "🌺",
        "🌵",
        "🌴",
        "🍁",
        "🌷",
        "🌻",
        "🌹",
        "🍄",
        "🌱",
        "🌾",
        "🌿",
      ],
    },
    animals: {
      title: "Animal Friends",
      description: "Match pairs of animal emojis",
      emojis: [
        "🐶",
        "🐱",
        "🐢",
        "🦊",
        "🐼",
        "🦁",
        "🐘",
        "🦋",
        "🐬",
        "🦉",
        "🐝",
        "🦜",
      ],
    },
    food: {
      title: "Healthy Foods",
      description: "Find pairs of nutritious food emojis",
      emojis: [
        "🍎",
        "🍌",
        "🥑",
        "🥦",
        "🍓",
        "🥕",
        "🍇",
        "🥝",
        "🍉",
        "🥭",
        "🍒",
        "🥥",
      ],
    },
  };

  useEffect(() => {
    if (gameStarted) {
      setupGame();
    }
  }, [gameStarted, selectedTheme, difficulty]);

  const setupGame = () => {
    setIsLoading(true);

    // Determine how many pairs to use based on difficulty
    let pairsCount = 6; // default for easy
    if (difficulty === "medium") {
      pairsCount = 8;
    } else if (difficulty === "hard") {
      pairsCount = 12;
    }

    // Get emojis for the selected theme
    const themeEmojis = themes[selectedTheme].emojis.slice(0, pairsCount);

    // Create pairs of cards
    const cardPairs: MemoryCard[] = [];

    themeEmojis.forEach((emoji, index) => {
      // First card
      cardPairs.push({
        id: index * 2,
        emoji: emoji,
        isFlipped: false,
        isMatched: false,
        pairId: index,
      });

      // Second card (matching pair)
      cardPairs.push({
        id: index * 2 + 1,
        emoji: emoji,
        isFlipped: false,
        isMatched: false,
        pairId: index,
      });
    });

    // Shuffle the cards
    const shuffledCards = [...cardPairs].sort(() => Math.random() - 0.5);

    setCards(shuffledCards);
    setMatchedPairs(0);
    setMoves(0);
    setFlippedCards([]);
    setGameCompleted(false);
    setIsLoading(false);
  };

  const handleCardClick = (id: number) => {
    // Prevent clicking if already two cards are flipped or the card is already flipped/matched
    if (
      flippedCards.length === 2 ||
      cards.find((card) => card.id === id)?.isFlipped ||
      cards.find((card) => card.id === id)?.isMatched
    ) {
      return;
    }

    // Flip the card
    setCards((prevCards) =>
      prevCards.map((card) =>
        card.id === id ? { ...card, isFlipped: true } : card
      )
    );

    // Add to flipped cards
    setFlippedCards((prev) => [...prev, id]);

    // If this is the second card flipped
    if (flippedCards.length === 1) {
      setMoves((prev) => prev + 1);

      // Check for a match
      setTimeout(() => {
        const firstCardId = flippedCards[0];
        const firstCard = cards.find((card) => card.id === firstCardId);
        const secondCard = cards.find((card) => card.id === id);

        if (firstCard && secondCard && firstCard.pairId === secondCard.pairId) {
          // Match found
          setCards((prevCards) =>
            prevCards.map((card) =>
              card.id === firstCardId || card.id === id
                ? { ...card, isMatched: true }
                : card
            )
          );
          setMatchedPairs((prev) => {
            const newMatchedPairs = prev + 1;
            // Check if game is completed
            if (newMatchedPairs === cards.length / 2) {
              setGameCompleted(true);
              confetti({
                particleCount: 150,
                spread: 80,
                origin: { y: 0.6 },
                colors: ["#0D9488", "#14B8A6", "#2DD4BF", "#F5F5DC", "#FFFBEB"],
              });
            }
            return newMatchedPairs;
          });
        } else {
          // No match, flip cards back
          setCards((prevCards) =>
            prevCards.map((card) =>
              card.id === firstCardId || card.id === id
                ? { ...card, isFlipped: false }
                : card
            )
          );
        }

        // Reset flipped cards
        setFlippedCards([]);
      }, 800); // Slightly faster reveal for better gameplay
    }
  };

  const startGame = () => {
    setGameStarted(true);
  };

  const restartGame = () => {
    setupGame();
  };

  const changeTheme = (theme: ThemeOption) => {
    setSelectedTheme(theme);
    if (gameStarted) {
      setupGame();
    }
  };

  const changeDifficulty = (newDifficulty: "easy" | "medium" | "hard") => {
    setDifficulty(newDifficulty);
    if (gameStarted) {
      setupGame();
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBEB]/30">
      <Navbar />

      {!gameStarted ? (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
          <div className="w-full max-w-md bg-white shadow-lg rounded-xl overflow-hidden border border-teal-100">
            <div className="flex flex-col items-center p-8 space-y-6">
              <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mb-2">
                <span className="text-3xl">🧠</span>
              </div>

              <div className="text-center">
                <h1 className="text-2xl font-bold text-teal-800">
                  Memory Match
                </h1>
                <p className="mt-2 text-teal-600">
                  Test your memory by matching pairs of emojis
                </p>
              </div>

              <div className="w-full space-y-6">
                <div>
                  <label className="block text-sm font-medium text-teal-700 mb-2">
                    Choose a Theme
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.keys(themes).map((theme) => (
                      <button
                        key={theme}
                        onClick={() => setSelectedTheme(theme as ThemeOption)}
                        className={`px-4 py-3 text-sm rounded-lg transition-all duration-200 ${
                          selectedTheme === theme
                            ? "bg-teal-600 text-white shadow-md"
                            : "bg-teal-50 text-teal-700 hover:bg-teal-100"
                        }`}
                      >
                        {themes[theme as ThemeOption].title}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-teal-700 mb-2">
                    Select Difficulty
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setDifficulty("easy")}
                      className={`px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                        difficulty === "easy"
                          ? "bg-teal-500 text-white shadow-md"
                          : "bg-teal-50 text-teal-700 hover:bg-teal-100"
                      }`}
                    >
                      Easy
                    </button>
                    <button
                      onClick={() => setDifficulty("medium")}
                      className={`px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                        difficulty === "medium"
                          ? "bg-teal-600 text-white shadow-md"
                          : "bg-teal-50 text-teal-700 hover:bg-teal-100"
                      }`}
                    >
                      Medium
                    </button>
                    <button
                      onClick={() => setDifficulty("hard")}
                      className={`px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                        difficulty === "hard"
                          ? "bg-teal-700 text-white shadow-md"
                          : "bg-teal-50 text-teal-700 hover:bg-teal-100"
                      }`}
                    >
                      Hard
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={startGame}
                className="w-full px-6 py-3 text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
              >
                Start Game
              </button>
            </div>
          </div>
        </div>
      ) : isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
          <Loader2 className="h-12 w-12 animate-spin text-teal-600" />
          <p className="mt-4 text-teal-600 font-medium">
            Setting up the game...
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center p-6 max-w-6xl mx-auto">
          <div className="w-full">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
              <div className="space-y-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-teal-800">
                  Memory Match
                </h1>
                <p className="text-teal-600">
                  {themes[selectedTheme].description}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 justify-center md:justify-end">
                <div className="flex items-center gap-4">
                  <div className="px-4 py-2 bg-teal-50 rounded-lg shadow-sm">
                    <span className="font-medium text-teal-700">Moves:</span>{" "}
                    <span className="text-teal-900">{moves}</span>
                  </div>
                  <div className="px-4 py-2 bg-teal-50 rounded-lg shadow-sm">
                    <span className="font-medium text-teal-700">Pairs:</span>{" "}
                    <span className="text-teal-900">
                      {matchedPairs}/{cards.length / 2}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <select
                    value={selectedTheme}
                    onChange={(e) => changeTheme(e.target.value as ThemeOption)}
                    className="text-sm border border-teal-200 rounded-lg px-3 py-2 bg-white text-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {Object.keys(themes).map((theme) => (
                      <option key={theme} value={theme}>
                        {themes[theme as ThemeOption].title}
                      </option>
                    ))}
                  </select>

                  <select
                    value={difficulty}
                    onChange={(e) =>
                      changeDifficulty(
                        e.target.value as "easy" | "medium" | "hard"
                      )
                    }
                    className="text-sm border border-teal-200 rounded-lg px-3 py-2 bg-white text-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>

                  <button
                    onClick={restartGame}
                    className="flex items-center px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-200 shadow-sm"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Restart
                  </button>
                </div>
              </div>
            </div>

            <div
              className={`grid ${
                difficulty === "easy"
                  ? "grid-cols-3 md:grid-cols-4"
                  : difficulty === "medium"
                  ? "grid-cols-4"
                  : "grid-cols-4 md:grid-cols-6"
              } gap-4 md:gap-6`}
            >
              {cards.map((card) => (
                <div
                  key={card.id}
                  className="aspect-square cursor-pointer"
                  onClick={() => handleCardClick(card.id)}
                >
                  <div
                    className="relative w-full h-full"
                    style={{ perspective: "1000px" }}
                  >
                    <div
                      className={`absolute w-full h-full transition-all duration-500`}
                      style={{
                        transformStyle: "preserve-3d",
                        transform:
                          card.isFlipped || card.isMatched
                            ? "rotateY(180deg)"
                            : "",
                      }}
                    >
                      {/* Front of card */}
                      <div
                        className={`absolute w-full h-full flex items-center justify-center rounded-xl ${
                          card.isMatched
                            ? "bg-gradient-to-br from-teal-400 to-teal-600"
                            : "bg-gradient-to-br from-teal-500 to-teal-700"
                        } text-white shadow-lg border-2 ${
                          card.isMatched ? "border-teal-300" : "border-teal-400"
                        }`}
                        style={{ backfaceVisibility: "hidden" }}
                      >
                        <span className="text-3xl font-bold">?</span>
                      </div>

                      {/* Back of card */}
                      <div
                        className={`absolute w-full h-full flex items-center justify-center text-center bg-white rounded-xl shadow-lg border-2 ${
                          card.isMatched ? "border-teal-400" : "border-teal-200"
                        }`}
                        style={{
                          backfaceVisibility: "hidden",
                          transform: "rotateY(180deg)",
                        }}
                      >
                        <span className="text-5xl select-none">
                          {card.emoji}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {gameCompleted && (
              <div className="mt-10 p-6 bg-gradient-to-r from-teal-50 to-teal-100 rounded-xl text-center shadow-md border border-teal-200 max-w-2xl mx-auto">
                <div className="w-16 h-16 mx-auto bg-teal-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-3xl">🎉</span>
                </div>
                <h2 className="text-2xl font-bold text-teal-800 mb-2">
                  Congratulations!
                </h2>
                <p className="mb-6 text-teal-700 text-lg">
                  You completed the game in{" "}
                  <span className="font-bold">{moves}</span> moves!
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <button
                    onClick={restartGame}
                    className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-200 shadow-md"
                  >
                    Play Again
                  </button>
                  <button
                    onClick={() => setGameStarted(false)}
                    className="px-6 py-3 bg-white text-teal-700 border border-teal-300 rounded-lg hover:bg-teal-50 transition-colors duration-200 shadow-md"
                  >
                    Change Settings
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
