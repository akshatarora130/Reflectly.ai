"use client";

import { useEffect, useState } from "react";
import { Loader2, Pause, Play, RefreshCw } from "lucide-react";

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

export default function BreathingRhythmGame() {
  const [exercise, setExercise] = useState<BreathingExercise | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentPhase, setCurrentPhase] = useState<
    "inhale" | "hold" | "exhale"
  >("inhale");
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [currentCycle, setCurrentCycle] = useState<number>(1);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [exerciseComplete, setExerciseComplete] = useState<boolean>(false);

  useEffect(() => {
    if (gameStarted) {
      fetchBreathingExercise();
    }
  }, [gameStarted]);

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

  const fetchBreathingExercise = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/games/breathing-rhythm/exercise");
      if (!response.ok) {
        throw new Error(
          `Failed to fetch breathing exercise: ${response.status}`
        );
      }

      const data = await response.json();
      setExercise(data.exercise);
      setTimeRemaining(data.exercise.inhaleTime);
      setCurrentPhase("inhale");
      setCurrentCycle(1);
      setProgress(0);
      setExerciseComplete(false);
    } catch (error) {
      console.error("Error fetching breathing exercise:", error);
      setError("Failed to load breathing exercise. Please try again.");
    } finally {
      setIsLoading(false);
    }
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

  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <div className="w-full max-w-md bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="flex flex-col items-center p-6 space-y-6">
            <h1 className="text-2xl font-bold text-center text-gray-800">
              Breathing Rhythm
            </h1>
            <p className="text-center text-gray-600">
              Follow guided breathing exercises to reduce stress and improve
              focus.
            </p>
            <button
              onClick={startGame}
              className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Start Exercise
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
        <p className="mt-4 text-gray-600">Loading breathing exercise...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <div className="w-full max-w-md bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchBreathingExercise}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-4 space-y-6">
      <div className="w-full max-w-2xl">
        {exerciseComplete && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
            <h3 className="text-lg font-semibold text-green-700">
              Exercise Complete!
            </h3>
            <p className="text-green-600">
              Great job completing your breathing exercise.
            </p>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-800">
              {exercise?.name}
            </h1>
            <p className="text-sm text-gray-600">{exercise?.description}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <span className="font-medium">Cycle:</span> {currentCycle}/
              {exercise?.cycles}
            </div>
            <button
              onClick={restartExercise}
              className="flex items-center px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Restart
            </button>
          </div>
        </div>

        <div className="mb-6 bg-white shadow-md rounded-lg overflow-hidden">
          <div className="flex flex-col items-center p-6 space-y-6">
            <div className="relative flex items-center justify-center">
              <div
                className="rounded-full bg-blue-100 flex items-center justify-center transition-all duration-1000 ease-in-out"
                style={{
                  width: `${Math.max(50, 200 + getCircleSize())}px`,
                  height: `${Math.max(50, 200 + getCircleSize())}px`,
                }}
              >
                <div className="text-2xl font-bold text-blue-800">
                  {getInstructions()}
                </div>
              </div>
            </div>

            <div className="w-full space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">
                  {currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)}
                </span>
                <span className="text-gray-700">
                  {timeRemaining.toFixed(1)}s
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            <button
              onClick={togglePlay}
              className="w-full px-4 py-2 flex items-center justify-center text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              {isPlaying ? (
                <>
                  <Pause className="mr-2 h-4 w-4" /> Pause
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />{" "}
                  {currentCycle === 1 && timeRemaining === exercise?.inhaleTime
                    ? "Start"
                    : "Resume"}
                </>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Instructions</h2>
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
              <p className="text-gray-700">
                Inhale: {exercise?.inhaleTime}s - Breathe in deeply through your
                nose
              </p>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-purple-500 mr-2"></div>
              <p className="text-gray-700">
                Hold: {exercise?.holdTime}s - Hold your breath
              </p>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
              <p className="text-gray-700">
                Exhale: {exercise?.exhaleTime}s - Breathe out slowly through
                your mouth
              </p>
            </div>
          </div>
        </div>

        {exercise?.benefits && exercise.benefits.length > 0 && (
          <div className="mt-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Benefits</h2>
            <ul className="list-disc pl-5 space-y-1">
              {exercise.benefits.map((benefit, index) => (
                <li key={index} className="text-gray-700">
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        )}

        {exercise?.affirmations && exercise.affirmations.length > 0 && (
          <div className="mt-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Affirmations
            </h2>
            <div className="bg-blue-50 p-4 rounded-lg">
              {exercise.affirmations.map((affirmation, index) => (
                <p key={index} className="text-blue-700 italic mb-2">
                  "{affirmation}"
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
