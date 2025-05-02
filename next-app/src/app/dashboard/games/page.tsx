"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Loader2,
  AlertCircle,
  GamepadIcon,
  Sparkles,
  Star,
  Trophy,
  Brain,
  Heart,
} from "lucide-react";
import Navbar from "@/app/components/navbar";

export default function GamesDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Hardcoded games list
  const games = [
    {
      id: "word-drop",
      title: "Word Catcher",
      description:
        "Catch falling words from positive mental health affirmations to build your resilience score.",
      thumbnail: "/games/word-drop-thumbnail.png",
      themes: ["resilience", "mindfulness", "self-care"],
      benefits: [
        "Improves focus",
        "Reinforces positive language",
        "Builds mental agility",
      ],
      icon: <Star className="h-6 w-6" />,
      color: "from-blue-500/20 to-purple-500/20",
      borderColor: "border-blue-200",
    },
    {
      id: "memory-match",
      title: "Mindful Memory",
      description:
        "Match pairs of wellness concepts to strengthen your memory and mindfulness.",
      thumbnail: "/games/memory-match-thumbnail.png",
      themes: ["mindfulness", "wellness", "balance"],
      benefits: ["Enhances memory", "Promotes mindfulness", "Reduces stress"],
      icon: <Brain className="h-6 w-6" />,
      color: "from-green-500/20 to-teal-500/20",
      borderColor: "border-green-200",
    },
    {
      id: "breathing-rhythm",
      title: "Breathing Rhythm",
      description:
        "Follow the animated guide to practice deep breathing exercises with calming visuals.",
      thumbnail: "/games/breathing-rhythm-thumbnail.png",
      themes: ["relaxation", "stress-relief", "focus"],
      benefits: ["Reduces anxiety", "Improves focus", "Promotes relaxation"],
      icon: <Heart className="h-6 w-6" />,
      color: "from-amber-500/20 to-orange-500/20",
      borderColor: "border-amber-200",
    },
    {
      id: "would-you-rather",
      title: "Would You Rather",
      description:
        "Make quick choices between mental health scenarios and see how many you can answer in the time limit.",
      thumbnail: "/games/would-you-rather-thumbnail.png",
      themes: ["self-reflection", "values", "preferences"],
      benefits: [
        "Promotes self-awareness",
        "Clarifies personal values",
        "Encourages reflection",
      ],
      icon: <Trophy className="h-6 w-6" />,
      color: "from-purple-500/20 to-pink-500/20",
      borderColor: "border-purple-200",
    },
  ];

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      // Just set loading to false since we're using hardcoded games
      setIsLoading(false);
      // Set visibility after a small delay to trigger animations
      setTimeout(() => setIsVisible(true), 100);
    }
  }, [status, router]);

  // Show loading state while checking authentication
  if (status === "loading" || isLoading) {
    return (
      <div className="flex flex-col h-screen">
        <Navbar />
        <div className="flex justify-center items-center flex-1 bg-gray-50">
          <div className="flex flex-col items-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            >
              <Loader2 className="h-8 w-8 text-[#014D4E]" />
            </motion.div>
            <p className="mt-2 text-[#014D4E]">Loading games...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex-1 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
        <div className="container mx-auto px-4 h-full flex flex-col">
          {/* Header Section - More compact */}
          <div className="relative mb-6 mt-4">
            <div className="absolute inset-0 bg-[#014D4E]/5 rounded-2xl -z-10"></div>
            <motion.div
              className="absolute -right-10 -top-10 w-40 h-40 bg-[#FFE4C4]/30 rounded-full blur-3xl -z-10"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{
                duration: 8,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
            />
            <motion.div
              className="absolute -left-10 -bottom-10 w-40 h-40 bg-[#014D4E]/20 rounded-full blur-3xl -z-10"
              animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
              transition={{
                duration: 10,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
                delay: 1,
              }}
            />

            <div className="max-w-4xl mx-auto py-5 px-6">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -20 }}
                transition={{ duration: 0.6 }}
                className="flex items-center gap-3 mb-3"
              >
                <div className="bg-[#014D4E] p-2 rounded-xl shadow-lg">
                  <GamepadIcon className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-[#014D4E]">
                  Mental Wellness Games
                </h1>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -10 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-gray-600 max-w-3xl leading-relaxed"
              >
                Interactive games designed to boost your mental wellbeing,
                improve focus, and promote mindfulness.
              </motion.p>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -10 }}
              transition={{ duration: 0.4 }}
              className="bg-red-100 border border-red-400 text-red-700 px-6 py-3 rounded-xl mb-4 shadow-sm max-w-4xl mx-auto"
            >
              <span className="flex items-center">
                <AlertCircle className="mr-2 flex-shrink-0" size={18} />
                <span>{error}</span>
              </span>
            </motion.div>
          )}

          {/* Games Grid - Flex-grow to fill available space */}
          <div className="flex-grow overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-7xl mx-auto h-full">
              {games.map((game, index) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{
                    opacity: isVisible ? 1 : 0,
                    y: isVisible ? 0 : 30,
                  }}
                  transition={{
                    duration: 0.5,
                    delay: isVisible ? 0.2 + index * 0.1 : 0,
                  }}
                  whileHover={{ y: -5 }}
                  className="h-full"
                >
                  {/* Card - More compact */}
                  <div className="h-full flex flex-col overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 bg-white group">
                    {/* Card Image - Reduced height */}
                    <div
                      className={`relative h-36 bg-gradient-to-br ${game.color} overflow-hidden`}
                    >
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
                          <div className="text-[#014D4E]">{game.icon}</div>
                        </div>
                      </motion.div>
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"
                        initial={{ opacity: 0.6 }}
                        whileHover={{ opacity: 0.8 }}
                      />
                    </div>

                    {/* Card Header - Reduced padding */}
                    <div className="p-4 pb-2">
                      <h3 className="text-lg font-bold text-[#014D4E] group-hover:text-[#013638] transition-colors">
                        {game.title}
                      </h3>
                      <p className="text-gray-600 mt-1 text-sm leading-relaxed line-clamp-2">
                        {game.description}
                      </p>
                    </div>

                    {/* Card Content - Reduced padding */}
                    <div className="px-4 pb-2 flex-grow">
                      <div className="flex flex-wrap gap-1 mb-2">
                        {game.themes.map((theme) => (
                          <span
                            key={theme}
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-[#FFE4C4]/30 text-[#014D4E] hover:bg-[#FFE4C4]/50 transition-colors ${game.borderColor}`}
                          >
                            {theme}
                          </span>
                        ))}
                      </div>
                      <div className="space-y-1.5">
                        {game.benefits.map((benefit, i) => (
                          <div
                            key={i}
                            className="flex items-center text-xs text-gray-600 group-hover:text-gray-700 transition-colors"
                          >
                            <Sparkles className="h-3 w-3 mr-1.5 text-[#014D4E] opacity-70" />
                            <span>{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Card Footer - Reduced padding */}
                    <div className="p-4 pt-3 mt-auto">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="w-full py-2 px-4 bg-[#014D4E] hover:bg-[#013638] text-white font-medium rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#014D4E] focus:ring-opacity-50 shadow-sm"
                        onClick={() =>
                          router.push(`/dashboard/games/${game.id}`)
                        }
                      >
                        Play Now
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
