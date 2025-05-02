"use client";

import { useEffect, useState } from "react";
import { Loader2, Pause, Play, RefreshCw } from "lucide-react";
import Navbar from "@/app/components/navbar";

interface BreathingExercise {
  name: string;
  description: string;
  inhaleTime: number;
  holdTime: number;
  exhaleTime: number;
  cycles: number;
  instructions?: string[];
  benefits?: string[];
  affirmations?: string[];
}

// Hard-coded breathing exercises
const breathingExercises: BreathingExercise[] = [
  {
    name: "4-7-8 Breathing",
    description: "A relaxing breath pattern that promotes calmness and sleep",
    inhaleTime: 4,
    holdTime: 7,
    exhaleTime: 8,
    cycles: 4,
    benefits: [
      "Reduces anxiety and stress",
      "Helps with falling asleep faster",
      "Improves focus and concentration",
      "Regulates nervous system",
    ],
    affirmations: [
      "I am calm and centered",
      "With each breath, I release tension",
      "I am in control of my thoughts and feelings",
    ],
  },
  {
    name: "Box Breathing",
    description: "Equal parts breathing technique used by Navy SEALs",
    inhaleTime: 4,
    holdTime: 4,
    exhaleTime: 4,
    cycles: 5,
    benefits: [
      "Reduces stress in high-pressure situations",
      "Improves concentration and performance",
      "Regulates autonomic nervous system",
      "Increases mental clarity",
    ],
    affirmations: [
      "I am strong and resilient",
      "I can handle any challenge with calm focus",
      "My mind is clear and sharp",
    ],
  },
  {
    name: "Relaxing Breath",
    description: "Gentle breathing pattern for deep relaxation",
    inhaleTime: 5,
    holdTime: 2,
    exhaleTime: 6,
    cycles: 3,
    benefits: [
      "Promotes deep relaxation",
      "Reduces physical tension",
      "Calms racing thoughts",
      "Helps transition to restful states",
    ],
    affirmations: [
      "I release all tension from my body",
      "I deserve peace and relaxation",
      "My body knows how to heal itself",
    ],
  },
];

export default function BreathingRhythmGame() {
  const [exercise, setExercise] = useState<BreathingExercise | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentPhase, setCurrentPhase] = useState<
    "inhale" | "hold" | "exhale"
  >("inhale");
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [currentCycle, setCurrentCycle] = useState<number>(1);
  const [progress, setProgress] = useState<number>(0);
  const [exerciseComplete, setExerciseComplete] = useState<boolean>(false);
  const [selectedExerciseIndex, setSelectedExerciseIndex] = useState<number>(0);

  useEffect(() => {
    if (gameStarted) {
      loadBreathingExercise();
    }
  }, [gameStarted, selectedExerciseIndex]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isPlaying && exercise) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 0) {
            // Move to next phase
            if (currentPhase === "inhale") {
              setCurrentPhase("hold");
              return exercise.holdTime;
            } else if (currentPhase === "hold") {
              setCurrentPhase("exhale");
              return exercise.exhaleTime;
            } else {
              // End of cycle
              if (currentCycle < exercise.cycles) {
                setCurrentCycle((prev) => prev + 1);
                setCurrentPhase("inhale");
                return exercise.inhaleTime;
              } else {
                // Exercise complete
                setIsPlaying(false);
                setExerciseComplete(true);
                return 0;
              }
            }
          }
          return prev - 0.1;
        });

        // Update progress based on current phase
        if (currentPhase === "inhale") {
          const totalTime = exercise.inhaleTime;
          setProgress(((totalTime - timeRemaining) / totalTime) * 100);
        } else if (currentPhase === "hold") {
          const totalTime = exercise.holdTime;
          setProgress(((totalTime - timeRemaining) / totalTime) * 100);
        } else {
          const totalTime = exercise.exhaleTime;
          setProgress(((totalTime - timeRemaining) / totalTime) * 100);
        }
      }, 100);
    }

    return () => clearInterval(timer);
  }, [isPlaying, currentPhase, timeRemaining, currentCycle, exercise]);

  const loadBreathingExercise = () => {
    setIsLoading(true);

    // Use the selected exercise from our hard-coded data
    const selectedExercise = breathingExercises[selectedExerciseIndex];

    setExercise(selectedExercise);
    setTimeRemaining(selectedExercise.inhaleTime);
    setCurrentPhase("inhale");
    setCurrentCycle(1);
    setProgress(0);
    setExerciseComplete(false);

    // Simulate loading for a smoother experience
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  const startGame = () => {
    setGameStarted(true);
  };

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const restartExercise = () => {
    if (exercise) {
      setIsPlaying(false);
      setTimeRemaining(exercise.inhaleTime);
      setCurrentPhase("inhale");
      setCurrentCycle(1);
      setProgress(0);
      setExerciseComplete(false);
    }
  };

  const getInstructions = () => {
    switch (currentPhase) {
      case "inhale":
        return "Breathe in...";
      case "hold":
        return "Hold...";
      case "exhale":
        return "Breathe out...";
      default:
        return "";
    }
  };

  const getCircleSize = () => {
    if (currentPhase === "inhale") {
      return 100 - progress;
    } else if (currentPhase === "exhale") {
      return progress;
    }
    return 50; // Hold phase
  };

  const getPhaseColor = () => {
    switch (currentPhase) {
      case "inhale":
        return "#014D4E"; // Teal
      case "hold":
        return "#2A797B"; // Medium teal
      case "exhale":
        return "#5BA5A7"; // Light teal
      default:
        return "#014D4E";
    }
  };

  if (!gameStarted) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] p-4 bg-[#FFF5EB]/30">
          <div className="w-full max-w-md bg-white shadow-lg rounded-lg overflow-hidden border border-[#014D4E]/10">
            <div className="flex flex-col items-center p-8 space-y-6">
              <div className="w-20 h-20 rounded-full bg-[#014D4E]/10 flex items-center justify-center">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                    stroke="#014D4E"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z"
                    stroke="#014D4E"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 8V2"
                    stroke="#014D4E"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 22V16"
                    stroke="#014D4E"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 12H2"
                    stroke="#014D4E"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M22 12H16"
                    stroke="#014D4E"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-center text-[#014D4E]">
                Breathing Rhythm
              </h1>
              <p className="text-center text-gray-600 max-w-xs">
                Follow guided breathing exercises to reduce stress, improve
                focus, and find your center.
              </p>

              <div className="w-full space-y-4 mt-4">
                <h3 className="text-sm font-medium text-[#014D4E]">
                  Choose an exercise:
                </h3>
                <div className="space-y-2 w-full">
                  {breathingExercises.map((ex, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedExerciseIndex(index)}
                      className={`w-full p-3 text-left rounded-lg transition-all ${
                        selectedExerciseIndex === index
                          ? "bg-[#014D4E] text-white"
                          : "bg-[#FFF5EB] text-[#014D4E] hover:bg-[#014D4E]/10"
                      }`}
                    >
                      <div className="font-medium">{ex.name}</div>
                      <div
                        className={`text-xs mt-1 ${
                          selectedExerciseIndex === index
                            ? "text-white/80"
                            : "text-gray-500"
                        }`}
                      >
                        {ex.inhaleTime}-{ex.holdTime}-{ex.exhaleTime} •{" "}
                        {ex.cycles} cycles
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={startGame}
                className="w-full px-6 py-3 text-white bg-[#014D4E] rounded-md hover:bg-[#014D4E]/90 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-[#014D4E] focus:ring-opacity-50"
              >
                Start Exercise
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] p-4 bg-[#FFF5EB]/30">
          <Loader2 className="h-10 w-10 animate-spin text-[#014D4E]" />
          <p className="mt-4 text-[#014D4E]">
            Preparing your breathing exercise...
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center p-6 bg-[#FFF5EB]/30 min-h-[calc(100vh-5rem)]">
        <div className="w-full max-w-2xl">
          {exerciseComplete && (
            <div className="mb-6 p-6 bg-[#014D4E]/10 border border-[#014D4E]/20 rounded-lg text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#014D4E]/20 flex items-center justify-center">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999"
                    stroke="#014D4E"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M22 4L12 14.01L9 11.01"
                    stroke="#014D4E"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#014D4E]">
                Exercise Complete!
              </h3>
              <p className="text-[#014D4E]/80 mt-2">
                Great job completing your breathing exercise. Take a moment to
                notice how you feel.
              </p>
              <div className="flex flex-wrap justify-center gap-3 mt-4">
                <button
                  onClick={restartExercise}
                  className="px-4 py-2 bg-[#014D4E] text-white rounded-md hover:bg-[#014D4E]/90 transition-colors"
                >
                  Practice Again
                </button>
                <button
                  onClick={() => setGameStarted(false)}
                  className="px-4 py-2 border border-[#014D4E] text-[#014D4E] rounded-md hover:bg-[#014D4E]/10 transition-colors"
                >
                  Choose Another
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-[#014D4E]">
                {exercise?.name}
              </h1>
              <p className="text-sm text-[#014D4E]/70">
                {exercise?.description}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm bg-[#014D4E]/10 px-3 py-1 rounded-full text-[#014D4E]">
                <span className="font-medium">Cycle:</span> {currentCycle}/
                {exercise?.cycles}
              </div>
              <button
                onClick={restartExercise}
                className="flex items-center px-3 py-1 text-sm border border-[#014D4E]/30 text-[#014D4E] rounded-md hover:bg-[#014D4E]/10 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Restart
              </button>
            </div>
          </div>

          <div className="mb-8 bg-white shadow-lg rounded-xl overflow-hidden border border-[#014D4E]/10">
            <div className="flex flex-col items-center p-8 space-y-8">
              <div className="relative flex items-center justify-center">
                <div className="absolute w-64 h-64 rounded-full border-2 border-dashed border-[#014D4E]/20"></div>
                <div
                  className="rounded-full flex items-center justify-center transition-all duration-1000 ease-in-out shadow-lg"
                  style={{
                    width: `${Math.max(50, 200 + getCircleSize())}px`,
                    height: `${Math.max(50, 200 + getCircleSize())}px`,
                    background: `radial-gradient(circle, ${getPhaseColor()}20 0%, ${getPhaseColor()}40 100%)`,
                    boxShadow: `0 0 40px ${getPhaseColor()}20`,
                  }}
                >
                  <div className="text-3xl font-bold text-[#014D4E]">
                    {getInstructions()}
                  </div>
                </div>
              </div>

              <div className="w-full space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[#014D4E] font-medium">
                    {currentPhase.charAt(0).toUpperCase() +
                      currentPhase.slice(1)}
                  </span>
                  <span className="text-[#014D4E]/70 font-medium">
                    {timeRemaining.toFixed(1)}s
                  </span>
                </div>
                <div className="w-full bg-[#014D4E]/10 rounded-full h-3">
                  <div
                    className="h-3 rounded-full transition-all duration-100 ease-linear"
                    style={{
                      width: `${progress}%`,
                      background: `linear-gradient(90deg, ${getPhaseColor()}70 0%, ${getPhaseColor()} 100%)`,
                    }}
                  ></div>
                </div>
              </div>

              <button
                onClick={togglePlay}
                className="w-full px-5 py-3 flex items-center justify-center text-white bg-[#014D4E] rounded-md hover:bg-[#014D4E]/90 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-[#014D4E] focus:ring-opacity-50"
              >
                {isPlaying ? (
                  <>
                    <Pause className="mr-2 h-5 w-5" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-5 w-5" />{" "}
                    {currentCycle === 1 &&
                    timeRemaining === exercise?.inhaleTime
                      ? "Start"
                      : "Resume"}
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md border border-[#014D4E]/10">
              <h2 className="text-xl font-semibold text-[#014D4E] mb-4">
                Instructions
              </h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-[#014D4E] mr-3"></div>
                  <p className="text-gray-700">
                    <span className="font-medium">Inhale:</span>{" "}
                    {exercise?.inhaleTime}s - Breathe in deeply through your
                    nose
                  </p>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-[#2A797B] mr-3"></div>
                  <p className="text-gray-700">
                    <span className="font-medium">Hold:</span>{" "}
                    {exercise?.holdTime}s - Hold your breath
                  </p>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-[#5BA5A7] mr-3"></div>
                  <p className="text-gray-700">
                    <span className="font-medium">Exhale:</span>{" "}
                    {exercise?.exhaleTime}s - Breathe out slowly through your
                    mouth
                  </p>
                </div>
              </div>
            </div>

            <div>
              {exercise?.benefits && exercise.benefits.length > 0 && (
                <div className="bg-white p-6 rounded-xl shadow-md border border-[#014D4E]/10 mb-6">
                  <h2 className="text-xl font-semibold text-[#014D4E] mb-4">
                    Benefits
                  </h2>
                  <ul className="space-y-2">
                    {exercise.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <svg
                          className="h-5 w-5 text-[#014D4E] mr-2 mt-0.5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {exercise?.affirmations && exercise.affirmations.length > 0 && (
                <div className="bg-[#014D4E]/5 p-6 rounded-xl border border-[#014D4E]/10">
                  <h2 className="text-xl font-semibold text-[#014D4E] mb-4">
                    Affirmations
                  </h2>
                  <div className="space-y-3">
                    {exercise.affirmations.map((affirmation, index) => (
                      <p key={index} className="text-[#014D4E] italic">
                        "{affirmation}"
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
