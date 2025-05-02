"use client";

import { useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import confetti from "canvas-confetti";

interface CardPair {
  id: string;
  concept: string;
  match: string;
  category: string;
}

interface MemoryCard {
  id: number;
  content: string;
  isFlipped: boolean;
  isMatched: boolean;
  pairId: string;
}

interface GameContent {
  pairs: CardPair[];
  difficulty: string;
  theme: string;
  title: string;
  description: string;
}

export default function MemoryMatchGame() {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [gameContent, setGameContent] = useState<GameContent | null>(null);

  useEffect(() => {
    if (gameStarted) {
      fetchMemoryPairs();
    }
  }, [gameStarted]);

  const fetchMemoryPairs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/games/memory-match/pairs");
      if (!response.ok) {
        throw new Error("Failed to fetch memory pairs");
      }

      const data = await response.json();
      console.log("Memory match data received:", data);
      setGameContent(data);

      // Create cards from pairs
      const cardPairs: MemoryCard[] = [];

      // Process each pair to create two cards
      data.pairs.forEach((pair: CardPair, index: number) => {
        // First card with concept
        cardPairs.push({
          id: index * 2,
          content: pair.concept,
          isFlipped: false,
          isMatched: false,
          pairId: pair.id,
        });

        // Second card with match
        cardPairs.push({
          id: index * 2 + 1,
          content: pair.match,
          isFlipped: false,
          isMatched: false,
          pairId: pair.id,
        });
      });

      // Shuffle the cards
      const shuffledCards = [...cardPairs].sort(() => Math.random() - 0.5);

      setCards(shuffledCards);
      setMatchedPairs(0);
      setMoves(0);
      setFlippedCards([]);
      setGameCompleted(false);
    } catch (error) {
      console.error("Error fetching memory pairs:", error);
      console.error("Failed to load memory pairs. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
              });
              console.log("Congratulations! You completed the game!");
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
      }, 1000);
    }
  };

  const startGame = () => {
    setGameStarted(true);
  };

  const restartGame = () => {
    fetchMemoryPairs();
  };

  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <div className="w-full max-w-md bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="flex flex-col items-center p-6 space-y-6">
            <h1 className="text-2xl font-bold text-center text-gray-800">
              Memory Match
            </h1>
            <p className="text-center text-gray-600">
              Test your memory by matching pairs of cards with mental health
              concepts and their descriptions.
            </p>
            <button
              onClick={startGame}
              className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Start Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="mt-4 text-gray-600">Loading memory cards...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-4 space-y-6">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-800">
              {gameContent?.title || "Memory Match"}
            </h1>
            <p className="text-sm text-gray-600">
              {gameContent?.description || "Match the pairs of cards"}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <span className="font-medium">Moves:</span> {moves}
            </div>
            <div className="text-sm">
              <span className="font-medium">Pairs:</span> {matchedPairs}/
              {cards.length / 2}
            </div>
            <button
              onClick={restartGame}
              className="flex items-center px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Restart
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                      card.isFlipped || card.isMatched ? "rotateY(180deg)" : "",
                  }}
                >
                  {/* Front of card */}
                  <div
                    className={`absolute w-full h-full flex items-center justify-center rounded-lg ${
                      card.isMatched ? "bg-green-500" : "bg-blue-600"
                    } text-white`}
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <span className="text-2xl">?</span>
                  </div>

                  {/* Back of card */}
                  <div
                    className="absolute w-full h-full flex items-center justify-center text-center p-4 bg-white border rounded-lg"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    <p>{card.content}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {gameCompleted && (
          <div className="mt-8 p-4 bg-green-100 rounded-lg text-center">
            <h2 className="text-xl font-bold text-green-800">
              Congratulations!
            </h2>
            <p className="mb-4 text-green-700">
              You completed the game in {moves} moves!
            </p>
            <button
              onClick={restartGame}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
