"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shuffle,
  Home,
  Menu,
  X,
  ChevronRight,
  Info,
  RefreshCw,
  History,
} from "lucide-react";

// Placeholder for card data - you would replace these with your actual card images
const cardData = [
  {
    id: 1,
    image: "/carecard1.png",
  },
  {
    id: 2,
    image: "/carecard2.png",
  },
  {
    id: 3,
    image: "/carecard3.png",
  },
  {
    id: 4,
    image: "/carecard4.png",
  },
  {
    id: 5,
    image: "/carecard5.png",
  },
  {
    id: 6,
    image: "/carecard6.png",
  },
  {
    id: 7,
    image: "/carecard7.png",
  },
  {
    id: 8,
    image: "/carecard8.png",
  },
];

export default function SelfCareCardsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [deck, setDeck] = useState([...cardData]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isFlipped, setIsFlipped] = useState(true); // Start with back showing
  const [viewedCards, setViewedCards] = useState<number[]>([0]); // Start with the first card
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [todaysDate] = useState(
    new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  );
  const [isFirstInteraction, setIsFirstInteraction] = useState(true);

  const cardRef = useRef(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Just flip the card for the first interaction without changing it
  const handleFirstFlip = () => {
    if (isShuffling) return;

    setIsFirstInteraction(false);
    setIsFlipped(false); // Just flip to front
  };

  // Shuffle the deck and show the next card
  const shuffleAndDraw = () => {
    if (isShuffling) return;

    // If it's the first interaction, just flip the card without changing it
    if (isFirstInteraction) {
      handleFirstFlip();
      return;
    }

    setIsShuffling(true);
    setIsFlipped(true);

    // Flip the card to the back first
    setTimeout(() => {
      // Shuffle the deck
      const shuffled = [...deck];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      setDeck(shuffled);

      // Select the next card (different from current if possible)
      let nextIndex = Math.floor(Math.random() * shuffled.length);
      // Try to avoid showing the same card twice in a row
      if (nextIndex === currentCardIndex && shuffled.length > 1) {
        nextIndex = (nextIndex + 1) % shuffled.length;
      }

      setCurrentCardIndex(nextIndex);

      // Add to viewed cards history
      setViewedCards((prev) => [...prev, nextIndex]);

      // Flip back to front after a delay
      setTimeout(() => {
        setIsFlipped(false);
        setTimeout(() => {
          setIsShuffling(false);
        }, 500);
      }, 600);
    }, 600);
  };

  // Reset the deck and history
  const resetDeck = () => {
    // If it's the first interaction, just flip the card without changing it
    if (isFirstInteraction) {
      handleFirstFlip();
      return;
    }

    setIsFlipped(true);

    setTimeout(() => {
      setCurrentCardIndex(0);
      setViewedCards([0]);

      setTimeout(() => {
        setIsFlipped(false);
      }, 300);
    }, 600);
  };

  // Show a specific card from history
  const showCardFromHistory = (historyIndex: number) => {
    // If it's the first interaction, just flip the card without changing it
    if (isFirstInteraction) {
      handleFirstFlip();
      return;
    }

    const cardIndex = viewedCards[historyIndex];

    setIsFlipped(true);

    setTimeout(() => {
      setCurrentCardIndex(cardIndex);

      setTimeout(() => {
        setIsFlipped(false);
        setIsHistoryModalOpen(false);
      }, 300);
    }, 600);
  };

  if (status === "loading") {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-[#FFE4C4]/10">
        <motion.div
          className="relative w-24 h-24 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="absolute inset-0 rounded-full bg-[#FFE4C4]/30"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
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
          <motion.div className="absolute inset-0 flex items-center justify-center">
            <Shuffle className="h-10 w-10 text-[#014D4E]" />
          </motion.div>
        </motion.div>

        <motion.h2
          className="text-xl font-semibold text-[#014D4E] mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Loading Self-Care Cards
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
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-b from-gray-50 to-[#FFE4C4]/20 relative overflow-hidden flex flex-col">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-[#014D4E] opacity-10 pattern-dots pattern-size-2 pattern-opacity-10"></div>
      </div>

      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 py-3 px-6 shadow-sm z-20 relative">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="md:hidden"
            >
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </motion.div>
            <div className="flex items-center space-x-3">
              <img
                src="/logo.svg"
                alt="logo"
                className="h-10 w-10 object-contain"
              />
              <h1 className="text-2xl md:text-3xl font-bold text-[#014D4E] font-serif">
                Reflectly.AI
              </h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <motion.button
              onClick={() => router.push("/dashboard")}
              className="text-gray-600 hover:text-[#014D4E] flex items-center gap-1"
              whileHover={{ scale: 1.05 }}
            >
              <Home size={18} className="mr-1" />
              Dashboard
            </motion.button>
            <motion.button
              onClick={() => router.push("/dashboard/journal")}
              className="text-gray-600 hover:text-[#014D4E] flex items-center gap-1"
              whileHover={{ scale: 1.05 }}
            >
              Journal
            </motion.button>
            <motion.button
              onClick={() => router.push("/dashboard/ai-companion")}
              className="text-gray-600 hover:text-[#014D4E] flex items-center gap-1"
              whileHover={{ scale: 1.05 }}
            >
              Aura AI Companion
            </motion.button>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => setIsHistoryModalOpen(true)}
              className="p-2 rounded-full hover:bg-gray-100 text-[#014D4E]"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              title="Card History"
            >
              <History size={20} />
            </motion.button>
            <motion.button
              onClick={() => setIsInfoModalOpen(true)}
              className="p-2 rounded-full hover:bg-gray-100 text-[#014D4E]"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              title="About Self-Care Cards"
            >
              <Info size={20} />
            </motion.button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white border-b border-gray-200 overflow-hidden md:hidden relative z-20"
          >
            <div className="px-6 py-4 space-y-3">
              <motion.button
                onClick={() => {
                  router.push("/dashboard");
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 px-3 rounded-md hover:bg-gray-100 flex items-center justify-between"
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center">
                  <Home size={18} className="mr-2" />
                  Dashboard
                </div>
                <ChevronRight size={16} />
              </motion.button>
              <motion.button
                onClick={() => {
                  router.push("/dashboard/journal");
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 px-3 rounded-md hover:bg-gray-100 flex items-center justify-between"
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center">Journal</div>
                <ChevronRight size={16} />
              </motion.button>
              <motion.button
                onClick={() => {
                  router.push("/dashboard/ai-companion");
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 px-3 rounded-md hover:bg-gray-100 flex items-center justify-between"
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center">Sage AI Companion</div>
                <ChevronRight size={16} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="max-w-7xl w-full mx-auto px-4 py-4 relative z-10 flex-grow flex flex-col overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-[#014D4E] mb-2">
              Daily Self-Care Cards
            </h1>
            <p className="text-gray-600 max-w-xl">
              Draw a card for daily inspiration or shuffle to receive a new
              mindfulness practice. Each card offers a simple self-care activity
              to enhance your wellbeing.
            </p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <motion.button
              onClick={resetDeck}
              className="bg-white border border-[#014D4E] text-[#014D4E] px-4 py-3 rounded-md flex items-center gap-2 shadow-sm hover:bg-[#F8FAFA] transition-colors"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 4px 12px rgba(1, 77, 78, 0.1)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw size={18} />
              <span>Reset</span>
            </motion.button>
            <motion.button
              onClick={shuffleAndDraw}
              disabled={isShuffling}
              className={`bg-gradient-to-r from-[#014D4E] to-[#016566] text-white px-6 py-3 rounded-md flex items-center gap-2 shadow-md ${
                isShuffling
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:bg-[#013638]"
              } transition-colors`}
              whileHover={
                !isShuffling
                  ? {
                      scale: 1.05,
                      boxShadow: "0 4px 20px rgba(1, 77, 78, 0.2)",
                    }
                  : {}
              }
              whileTap={!isShuffling ? { scale: 0.95 } : {}}
            >
              <motion.div
                animate={isShuffling ? { rotate: 360 } : {}}
                transition={{
                  duration: 1,
                  ease: "linear",
                  repeat: isShuffling ? Number.POSITIVE_INFINITY : 0,
                }}
              >
                <Shuffle size={18} />
              </motion.div>
              <span>Draw Card</span>
            </motion.button>
          </div>
        </div>

        {/* Card Display */}
        <div className="flex justify-center items-center flex-grow">
          <div className="relative w-full max-w-md perspective">
            <div
              ref={cardRef}
              className={`card-container w-full aspect-[1000/1350] transition-transform duration-700 transform-style-3d ${
                isFlipped ? "rotate-y-180" : ""
              }`}
              style={{
                transformStyle: "preserve-3d",
                transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
              }}
            >
              {/* Card Front */}
              <div
                className="absolute w-full h-full backface-hidden rounded-xl overflow-hidden shadow-2xl cursor-pointer"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(0deg)",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isFirstInteraction) {
                    handleFirstFlip();
                  } else {
                    shuffleAndDraw();
                  }
                }}
              >
                <div className="w-full h-full relative">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="w-full h-full"
                  >
                    <img
                      src={deck[currentCardIndex].image || "/placeholder.svg"}
                      alt={deck[currentCardIndex].id.toString()}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                </div>
              </div>

              {/* Card Back */}
              <div
                className="absolute w-full h-full backface-hidden rounded-xl overflow-hidden shadow-2xl bg-[#014D4E] flex items-center justify-center cursor-pointer"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isFirstInteraction) {
                    handleFirstFlip();
                  } else {
                    shuffleAndDraw();
                  }
                }}
              >
                <div className="absolute inset-0 p-8 bg-[#014D4E] bg-opacity-90">
                  <div className="border-4 border-[#FFE4C4]/30 h-full w-full rounded-lg flex items-center justify-center">
                    <div className="text-center p-6">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 3,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "linear",
                        }}
                        className="mx-auto mb-4"
                      >
                        <span className="text-[#FFE4C4] text-5xl">✨</span>
                      </motion.div>
                      <h3 className="text-[#FFE4C4] text-xl font-semibold mb-2">
                        Self-Care Card
                      </h3>
                      <p className="text-[#FFE4C4]/80 text-sm">
                        Mindfulness & Wellbeing
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Back Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="h-full w-full bg-white pattern-dots pattern-size-2 pattern-opacity-10"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Modal */}
      <AnimatePresence>
        {isInfoModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsInfoModalOpen(false)}
          >
            <motion.div
              className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-[#014D4E] flex items-center gap-2">
                  <motion.span
                    className="text-xl"
                    animate={{ rotate: [0, 15, 0, -15, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatDelay: 1,
                    }}
                  >
                    ✨
                  </motion.span>
                  About Self-Care Cards
                </h2>
                <motion.button
                  onClick={() => setIsInfoModalOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X size={18} />
                </motion.button>
              </div>

              <div className="space-y-4">
                <p className="text-gray-700">
                  Self-Care Cards are designed to provide daily inspiration,
                  mindfulness prompts, and self-care activities to support your
                  mental wellbeing journey.
                </p>

                <div className="bg-gradient-to-r from-[#FFE4C4]/20 to-[#FFE4C4]/10 p-4 rounded-lg border border-[#FFE4C4]/30">
                  <h3 className="font-medium text-[#014D4E] mb-2">
                    How to use:
                  </h3>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700">
                    <li>
                      Click the "Draw Card" button to shuffle and reveal a new
                      card
                    </li>
                    <li>
                      Reflect on the message or complete the suggested activity
                    </li>
                    <li>View your card history to revisit previous cards</li>
                    <li>Reset the deck to start fresh</li>
                  </ul>
                </div>

                <p className="text-gray-700">
                  Each card contains wisdom, activities, or reflections designed
                  to enhance your mindfulness practice and overall wellbeing.
                </p>

                <div className="bg-[#F8FAFA] p-4 rounded-lg border border-[#014D4E]/10">
                  <p className="text-sm text-gray-600 italic">
                    "Small moments of mindfulness throughout your day can
                    transform your relationship with yourself and the world
                    around you."
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <motion.button
                  onClick={() => setIsInfoModalOpen(false)}
                  className="bg-gradient-to-r from-[#014D4E] to-[#016566] text-white px-4 py-2 rounded-md hover:shadow-lg transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Got it
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History Modal */}
      <AnimatePresence>
        {isHistoryModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsHistoryModalOpen(false)}
          >
            <motion.div
              className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-[#014D4E] flex items-center gap-2">
                  <History size={20} /> Card History
                </h2>
                <motion.button
                  onClick={() => setIsHistoryModalOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X size={18} />
                </motion.button>
              </div>

              <div className="max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {viewedCards.map((cardIndex, historyIndex) => (
                  <motion.div
                    key={historyIndex}
                    className={`flex items-center gap-3 p-3 rounded-lg mb-2 cursor-pointer ${
                      cardIndex === currentCardIndex
                        ? "bg-gradient-to-r from-[#014D4E]/10 to-[#014D4E]/5 border border-[#014D4E]/20"
                        : "hover:bg-gray-100"
                    }`}
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => showCardFromHistory(historyIndex)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: historyIndex * 0.05 }}
                  >
                    <div className="w-12 h-16 rounded-md overflow-hidden flex-shrink-0 shadow-sm">
                      <img
                        src={deck[cardIndex].image || "/placeholder.svg"}
                        alt={deck[cardIndex].id.toString()}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-[#014D4E]">
                        Card #{historyIndex + 1}
                      </p>
                    </div>
                    {cardIndex === currentCardIndex && (
                      <span className="text-xs bg-[#014D4E] text-white px-2 py-1 rounded-full">
                        Current
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 flex justify-between">
                <motion.button
                  onClick={resetDeck}
                  className="text-[#014D4E] border border-[#014D4E] px-4 py-2 rounded-md hover:bg-[#F8FAFA] transition-colors flex items-center gap-2"
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RefreshCw size={16} />
                  Reset Deck
                </motion.button>
                <motion.button
                  onClick={() => setIsHistoryModalOpen(false)}
                  className="bg-gradient-to-r from-[#014D4E] to-[#016566] text-white px-4 py-2 rounded-md hover:shadow-lg transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom CSS for 3D effects */}
      <style jsx global>{`
        .perspective {
          perspective: 1000px;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a1a1a1;
        }
        .pattern-dots {
          background-image: radial-gradient(currentColor 1px, transparent 1px);
          background-size: calc(10 * 1px) calc(10 * 1px);
        }
      `}</style>
    </div>
  );
}
