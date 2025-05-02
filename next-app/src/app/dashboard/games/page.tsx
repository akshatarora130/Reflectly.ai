"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, GamepadIcon, Sparkles } from "lucide-react";

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
      difficulty_levels: ["easy", "medium", "hard"],
      themes: ["resilience", "mindfulness", "self-care", "gratitude", "growth"],
      benefits: [
        "Improves focus",
        "Reinforces positive language",
        "Builds mental agility",
      ],
    },
    {
      id: "memory-match",
      title: "Mindful Memory",
      description:
        "Match pairs of wellness concepts to strengthen your memory and mindfulness.",
      thumbnail: "/games/memory-match-thumbnail.png",
      difficulty_levels: ["easy", "medium", "hard"],
      themes: ["mindfulness", "wellness", "balance"],
      benefits: ["Enhances memory", "Promotes mindfulness", "Reduces stress"],
    },
    {
      id: "breathing-rhythm",
      title: "Breathing Rhythm",
      description:
        "Follow the animated guide to practice deep breathing exercises with calming visuals.",
      thumbnail: "/games/breathing-rhythm-thumbnail.png",
      difficulty_levels: ["beginner", "intermediate", "advanced"],
      themes: ["relaxation", "stress-relief", "focus"],
      benefits: ["Reduces anxiety", "Improves focus", "Promotes relaxation"],
    },
    {
      id: "would-you-rather",
      title: "Would You Rather",
      description:
        "Make quick choices between mental health scenarios and see how many you can answer in the time limit.",
      thumbnail: "/games/would-you-rather-thumbnail.png",
      difficulty_levels: ["easy", "medium", "hard"],
      themes: ["self-reflection", "values", "preferences"],
      benefits: [
        "Promotes self-awareness",
        "Clarifies personal values",
        "Encourages reflection",
      ],
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
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-[#014D4E]" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1
          className={`text-3xl font-bold text-[#014D4E] mb-2 transform transition-all duration-500 ${
            isVisible ? "translate-y-0 opacity-100" : "-translate-y-5 opacity-0"
          }`}
        >
          Mental Wellness Games
        </h1>
        <p
          className={`text-gray-600 max-w-3xl transform transition-all duration-500 delay-100 ${
            isVisible ? "translate-y-0 opacity-100" : "-translate-y-5 opacity-0"
          }`}
        >
          Engage with these interactive games designed to boost your mental
          wellbeing, improve focus, and promote mindfulness. Each game offers
          unique benefits for your mental health journey.
        </p>
      </div>

      {error && (
        <div
          className={`bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-6 relative transform transition-all duration-300 ${
            isVisible ? "translate-y-0 opacity-100" : "-translate-y-5 opacity-0"
          }`}
        >
          <span className="flex items-center">
            <AlertCircle className="mr-2" size={16} />
            {error}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game, index) => (
          <div
            key={game.id}
            className={`transform transition-all duration-500 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-5 opacity-0"
            }`}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            {/* Card */}
            <div className="h-full flex flex-col overflow-hidden rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 border-2 border-transparent hover:border-[#FFE4C4] bg-white">
              {/* Card Image */}
              <div className="relative h-48 bg-gray-100">
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-[#014D4E]/10 to-[#FFE4C4]/10">
                  <GamepadIcon className="h-16 w-16 text-[#014D4E]/40" />
                </div>
              </div>

              {/* Card Header */}
              <div className="p-4 pb-2">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-semibold text-[#014D4E]">
                    {game.title}
                  </h3>
                  <div className="flex space-x-1">
                    {game.difficulty_levels.includes("easy") && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                        Easy
                      </span>
                    )}
                    {game.difficulty_levels.includes("medium") && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
                        Medium
                      </span>
                    )}
                    {game.difficulty_levels.includes("hard") && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                        Hard
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-gray-600 mt-2 text-sm">{game.description}</p>
              </div>

              {/* Card Content */}
              <div className="px-4 pb-2 flex-grow">
                <div className="flex flex-wrap gap-1 mb-3">
                  {game.themes.map((theme) => (
                    <span
                      key={theme}
                      className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-[#FFE4C4]/30 text-[#014D4E] hover:bg-[#FFE4C4]/50"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
                <div className="space-y-2">
                  {game.benefits.map((benefit, i) => (
                    <div
                      key={i}
                      className="flex items-center text-sm text-gray-600"
                    >
                      <Sparkles className="h-4 w-4 mr-2 text-[#014D4E]" />
                      {benefit}
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-4 pt-2 mt-auto">
                <button
                  className="w-full py-2 px-4 bg-[#014D4E] hover:bg-[#013638] text-white font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#014D4E] focus:ring-opacity-50"
                  onClick={() => router.push(`/dashboard/games/${game.id}`)}
                >
                  Play Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
