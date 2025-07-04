"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSounds } from "@/hooks/useSounds";
import { useAuth } from "@/hooks/useAuth";
import { focusModes, FocusMode } from "@/lib/data";
import {
  Play,
  Pause,
  RotateCcw,
  Coffee,
  CheckCircle,
  ArrowLeft,
  Star,
  Home,
} from "lucide-react";

interface TimerOption {
  id: string;
  name: string;
  duration: number;
  description: string;
  icon: any;
  color: string;
  textColor: string;
}

export default function FocusZonePage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [selectedTimer, setSelectedTimer] = useState<FocusMode | null>(null);
  const { playSuccess, playNotification, playBuzz } = useSounds();
  const { user, loading, isAuthenticated } = useAuth();

  // Use centralized focus modes data
  const timerOptions: FocusMode[] = focusModes;

  // Get timer info from URL params or localStorage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const timerId = urlParams.get("timer");

    if (timerId) {
      const timer = timerOptions.find((t) => t.id === timerId);
      if (timer) {
        setSelectedTimer(timer);
        setTimeRemaining(timer.duration * 60); // Convert minutes to seconds
        setIsRunning(true);
        playBuzz();
      }
    }
  }, [playBuzz]);

  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && !isPaused && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsCompleted(true);
            playSuccess();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, isPaused, timeRemaining, playSuccess]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
    playNotification();
  };

  const handleReset = () => {
    if (selectedTimer) {
      setTimeRemaining(selectedTimer.duration * 60);
      setIsRunning(true);
      setIsPaused(false);
      setIsCompleted(false);
      playBuzz();
    }
  };

  const handleBreak = () => {
    setIsPaused(true);
    playNotification();
    // You could add a break timer here
  };

  const handleBackToSession = () => {
    router.push(`/session/${sessionId}`);
  };

  const handleJoinHive = () => {
    router.push("/signup");
  };

  const handleGoToDashboard = () => {
    router.push("/dashboard");
  };

  // Friendly signup section component
  const SignupSection = () => (
    <div className="mt-8 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-3xl p-6 shadow-lg">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-lg font-semibold text-amber-800">
            Your bee companion says:
          </span>
        </div>

        <h3 className="text-xl font-bold text-amber-900 mb-2">
          "Buzz buzz! Want to keep track of your amazing focus journey? 🐝"
        </h3>

        <p className="text-amber-700 mb-4 leading-relaxed">
          Join the hive and save your focus sessions! I'd love to help you see
          how much you've grown. It's free, simple, and I promise to keep
          cheering you on! ✨
        </p>

        <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
          <button
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3 rounded-xl shadow-md hover:shadow-lg flex items-center gap-2 group"
            onClick={handleJoinHive}
          >
            <Star size={18} className="group-hover:animate-spin" />
            Join the Hive (Free!)
          </button>

          <button className="text-amber-700 hover:text-amber-800 font-medium underline transition-colors duration-200">
            Maybe later, busy bee! 🍯
          </button>
        </div>
      </div>
    </div>
  );

  if (!selectedTimer) {
    return (
      <div className="min-h-screen bg-bee-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-amber-800">Loading your focus session...</p>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-bee-gradient relative overflow-hidden">
        {/* Background honeycomb pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="grid grid-cols-8 gap-4 p-8 transform rotate-12 scale-150">
            {Array.from({ length: 64 }).map((_, i) => (
              <div
                key={i}
                className="w-8 h-8 border-2 border-amber-400/60 transform rotate-45"
              />
            ))}
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8">
          <div className="text-center max-w-lg">
            <div className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <CheckCircle size={64} className="text-white" />
            </div>

            <h1 className="text-5xl font-bold text-amber-900 mb-4">
              Focus Complete! 🎉
            </h1>

            <p className="text-xl text-amber-800 mb-8 leading-relaxed">
              Congratulations! You've completed your {selectedTimer.name}{" "}
              session. Time to celebrate your focused work!
            </p>

            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-amber-200 mb-8">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div
                  className={`w-12 h-12 bg-gradient-to-r ${selectedTimer.color} rounded-full flex items-center justify-center`}
                >
                  <selectedTimer.icon size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-amber-900">
                    {selectedTimer.name}
                  </h3>
                  <p className="text-amber-700">
                    {selectedTimer.duration} minutes completed
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleReset}
                className="flex-1 bg-amber-500 hover:bg-amber-600 hover:shadow-xl text-white font-bold px-8 py-4 rounded-2xl text-lg transition-all duration-200 shadow-lg h-16 flex items-center justify-center"
              >
                Start Another Session
              </button>

              <button
                onClick={handleBackToSession}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-amber-100 hover:bg-amber-200 hover:shadow-lg text-amber-800 font-bold rounded-2xl transition-all duration-200 h-16"
              >
                <ArrowLeft size={20} />
                Back to Session
              </button>

              {/* Conditional dashboard button for authenticated users */}
              {!loading && isAuthenticated && (
                <button
                  onClick={handleGoToDashboard}
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-green-500 hover:bg-green-600 hover:shadow-lg text-white font-bold rounded-2xl transition-all duration-200 h-16"
                >
                  <Home size={20} />
                  Dashboard
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const progress = selectedTimer
    ? ((selectedTimer.duration * 60 - timeRemaining) /
        (selectedTimer.duration * 60)) *
      100
    : 0;

  return (
    <div className="min-h-screen bg-bee-gradient relative overflow-hidden">
      {/* Background honeycomb pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="grid grid-cols-8 gap-4 p-8 transform rotate-12 scale-150">
          {Array.from({ length: 64 }).map((_, i) => (
            <div
              key={i}
              className="w-8 h-8 border-2 border-amber-400/60 transform rotate-45"
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="flex items-center justify-between p-6 relative">
          <button
            onClick={handleBackToSession}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white/80 hover:bg-white text-amber-800 font-bold rounded-xl transition-colors duration-200 h-12"
          >
            <ArrowLeft size={20} />
            Back to Session
          </button>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-amber-900">
              Focus<span className="text-amber-600">Bee</span>
            </h1>
            <p className="text-sm text-amber-700">
              Session: {sessionId?.slice(-8)}
            </p>
          </div>

          {/* Conditional navigation */}
          {!loading && (
            <>
              {isAuthenticated ? (
                <button
                  onClick={handleGoToDashboard}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors duration-200 h-12 shadow-md hover:shadow-lg"
                >
                  <Home size={20} />
                  Dashboard
                </button>
              ) : (
                <button
                  onClick={handleJoinHive}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors duration-200 h-12 shadow-md hover:shadow-lg"
                >
                  <Star size={20} />
                  Join Hive
                </button>
              )}
            </>
          )}
        </header>

        {/* Main timer area */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          <div className="text-center max-w-2xl w-full">
            {/* Timer mode info */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div
                className={`w-16 h-16 bg-gradient-to-r ${selectedTimer.color} rounded-full flex items-center justify-center shadow-lg`}
              >
                <selectedTimer.icon size={32} className="text-white" />
              </div>
              <div className="text-left">
                <h2 className="text-3xl font-bold text-amber-900">
                  {selectedTimer.name}
                </h2>
                <p className="text-lg text-amber-700">
                  {selectedTimer.description}
                </p>
              </div>
            </div>

            {/* Progress ring */}
            <div className="relative w-80 h-80 mx-auto mb-8">
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 100 100"
              >
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="rgba(251, 191, 36, 0.2)"
                  strokeWidth="4"
                  fill="none"
                />
                {/* Progress circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="url(#gradient)"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${progress * 2.827} ${
                    (100 - progress) * 2.827
                  }`}
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient
                    id="gradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#d97706" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Timer display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-6xl font-bold text-amber-900 mb-2">
                  {formatTime(timeRemaining)}
                </div>
                <div className="text-lg text-amber-700">
                  {isPaused ? "Paused" : isRunning ? "Focusing..." : "Ready"}
                </div>
              </div>
            </div>

            {/* Control buttons */}
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={handlePause}
                className={`flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl h-16 ${
                  isPaused
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-amber-500 hover:bg-amber-600 text-white"
                }`}
              >
                {isPaused ? <Play size={24} /> : <Pause size={24} />}
                {isPaused ? "Resume" : "Pause"}
              </button>

              <button
                onClick={handleReset}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-gray-500 hover:bg-gray-600 hover:shadow-xl text-white font-bold rounded-2xl transition-all duration-200 shadow-lg h-16"
              >
                <RotateCcw size={20} />
                Reset
              </button>

              <button
                onClick={handleBreak}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-blue-500 hover:bg-blue-600 hover:shadow-xl text-white font-bold rounded-2xl transition-all duration-200 shadow-lg h-16"
              >
                <Coffee size={20} />
                Take a Break
              </button>
            </div>

            {/* Session stats */}
            <div className="mt-12 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-amber-200">
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-amber-900">
                    {Math.round(progress)}%
                  </div>
                  <div className="text-sm text-amber-700">Progress</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-amber-900">
                    {Math.floor(
                      (selectedTimer.duration * 60 - timeRemaining) / 60
                    )}
                    m
                  </div>
                  <div className="text-sm text-amber-700">Time Focused</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-amber-900">
                    {Math.floor(timeRemaining / 60)}m
                  </div>
                  <div className="text-sm text-amber-700">Remaining</div>
                </div>
              </div>
            </div>

            {/* Friendly signup section - only show for unauthenticated users */}
            {!loading && !isAuthenticated && <SignupSection />}
          </div>
        </div>
      </div>
    </div>
  );
}
