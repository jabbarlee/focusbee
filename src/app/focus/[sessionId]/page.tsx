"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSounds } from "@/hooks/useSounds";
import { useAuth } from "@/hooks/useAuth";
import { focusModes, FocusMode } from "@/lib/data";
import { Button } from "@/components/ui";
import {
  getSessionById,
  completeSession,
  cancelSession,
} from "@/actions/db/sessions";
import { Session } from "@/types/dbSchema";
import {
  Play,
  Pause,
  RotateCcw,
  Coffee,
  CheckCircle,
  ArrowLeft,
  Star,
  Home,
  X,
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
  const [sessionData, setSessionData] = useState<Session | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [breakTimeRemaining, setBreakTimeRemaining] = useState(0);
  const [isBreakRunning, setIsBreakRunning] = useState(false);
  const [totalBreakTime, setTotalBreakTime] = useState(0);
  const [breakCount, setBreakCount] = useState(0);
  const maxBreaks = 2;
  const { playSuccess, playNotification, playBuzz } = useSounds();
  const { user, loading, isAuthenticated } = useAuth();

  // Use centralized focus modes data
  const timerOptions: FocusMode[] = focusModes;

  // Fetch session data from database
  useEffect(() => {
    const fetchSessionData = async () => {
      if (!sessionId) return;

      // Check if this is a temporary session ID (not from database)
      if (sessionId.startsWith("temp_")) {
        console.log("Temporary session ID detected, redirecting to dashboard");
        router.push("/dashboard");
        return;
      }

      setIsLoadingSession(true);
      try {
        const result = await getSessionById(sessionId);

        if (result.success && result.data) {
          const session = result.data;
          setSessionData(session);

          // Check if session is already completed
          if (session.status === "completed") {
            // Still need to set selectedTimer for the completed UI
            const timer = timerOptions.find((t) => t.id === session.focus_mode);
            if (timer) {
              setSelectedTimer(timer);
            } else {
              // Use default timer if not found
              const defaultTimer = timerOptions.find(
                (t) => t.id === "honey-flow"
              );
              if (defaultTimer) {
                setSelectedTimer(defaultTimer);
              }
            }
            setIsCompleted(true);
            setIsLoadingSession(false);
            return;
          }

          // Find the corresponding timer from focus modes
          const timer = timerOptions.find((t) => t.id === session.focus_mode);
          if (timer) {
            setSelectedTimer(timer);
            setTimeRemaining(timer.duration * 60); // Convert minutes to seconds
            setIsRunning(true);
            playBuzz();
          } else {
            console.error(
              "Timer not found for focus mode:",
              session.focus_mode
            );
            // Use default timer if not found
            const defaultTimer = timerOptions.find(
              (t) => t.id === "honey-flow"
            );
            if (defaultTimer) {
              setSelectedTimer(defaultTimer);
              setTimeRemaining(defaultTimer.duration * 60);
              setIsRunning(true);
              playBuzz();
            }
          }
        } else {
          console.error("Session not found:", result.error);
          // Redirect to dashboard if session not found
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Error fetching session:", error);
        router.push("/dashboard");
      } finally {
        setIsLoadingSession(false);
      }
    };

    fetchSessionData();
  }, [sessionId, playBuzz, router]);

  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && !isPaused && timeRemaining > 0 && !isOnBreak) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsCompleted(true);
            // Mark session as completed in database
            if (sessionData) {
              completeSession(sessionData.id).catch(console.error);
            }
            playSuccess();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, isPaused, timeRemaining, playSuccess, sessionData, isOnBreak]);

  // Break timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isBreakRunning && breakTimeRemaining > 0) {
      interval = setInterval(() => {
        setBreakTimeRemaining((prev) => {
          if (prev <= 1) {
            // Break completed naturally - add full 5 minutes to total
            setTotalBreakTime((prevTotal) => prevTotal + 5 * 60);
            setIsBreakRunning(false);
            setIsOnBreak(false);
            setIsPaused(false); // Resume main timer
            playNotification();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isBreakRunning, breakTimeRemaining, playNotification]);

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
    if (!isOnBreak) {
      setIsPaused(!isPaused);
      playNotification();
    }
  };

  const handleReset = () => {
    if (selectedTimer && !isOnBreak) {
      setTimeRemaining(selectedTimer.duration * 60);
      setIsRunning(true);
      setIsPaused(false);
      setIsCompleted(false);
      playBuzz();
    }
  };

  const handleBreak = () => {
    if (!isOnBreak && breakCount < maxBreaks) {
      // Start break
      setIsOnBreak(true);
      setBreakTimeRemaining(5 * 60); // 5 minutes break
      setIsBreakRunning(true);
      setIsPaused(true); // Pause main timer
      setBreakCount((prev) => prev + 1); // Increment break count
      playNotification();
    } else if (isOnBreak) {
      // Finish break early - calculate actual time spent on break
      const timeSpentOnBreak = 5 * 60 - breakTimeRemaining;
      setTotalBreakTime((prev) => prev + timeSpentOnBreak);
      setIsOnBreak(false);
      setIsBreakRunning(false);
      setBreakTimeRemaining(0);
      setIsPaused(false); // Resume main timer
      playNotification();
    }
  };

  const handleBackToSession = () => {
    router.push(`/session/${sessionId}`);
  };

  const handleJoinHive = () => {
    router.push("/signup");
  };

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleGoToDashboard = async () => {
    // Pause the timer and show confirmation modal
    if (isRunning && !isPaused) {
      setIsPaused(true);
    }
    setShowConfirmModal(true);
  };

  const confirmGoToDashboard = async () => {
    // Complete the session before navigating to dashboard
    if (sessionData && sessionData.status === "active") {
      try {
        const result = await completeSession(sessionData.id);
        if (result.success) {
          console.log("Session completed before navigating to dashboard");
        } else {
          console.error("Failed to complete session:", result.error);
        }
      } catch (error) {
        console.error("Error completing session:", error);
      }
    }
    setShowConfirmModal(false);
    router.push("/dashboard");
  };

  const cancelGoToDashboard = () => {
    // Resume the timer if it was running before
    if (isRunning) {
      setIsPaused(false);
    }
    setShowConfirmModal(false);
  };

  const handleCompleteSession = async () => {
    // Mark session as completed and navigate to dashboard
    if (sessionData && sessionData.status === "active") {
      try {
        const result = await completeSession(sessionData.id);
        if (result.success) {
          console.log("Session completed successfully");
          playSuccess();
          setIsCompleted(true);
        } else {
          console.error("Failed to complete session:", result.error);
        }
      } catch (error) {
        console.error("Error completing session:", error);
      }
    }
  };

  const handleCancelSession = async () => {
    // Cancel the session and navigate to dashboard
    if (sessionData && sessionData.status === "active") {
      try {
        const result = await cancelSession(sessionData.id);
        if (result.success) {
          console.log("Session cancelled successfully");
          playNotification();
          router.push("/dashboard");
        } else {
          console.error("Failed to cancel session:", result.error);
        }
      } catch (error) {
        console.error("Error cancelling session:", error);
      }
    } else {
      // If no active session, just navigate to dashboard
      router.push("/dashboard");
    }
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

  if (isLoadingSession || !selectedTimer) {
    return (
      <div className="min-h-screen bg-bee-soft flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-amber-800">
            {isLoadingSession
              ? "Loading your focus session..."
              : "Preparing your focus zone..."}
          </p>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    // Check if this was a session that was already completed vs just completed now
    const wasAlreadyCompleted = sessionData?.status === "completed";

    return (
      <div className="min-h-screen bg-bee-soft relative overflow-hidden">
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
            <div
              className={`w-32 h-32 ${
                wasAlreadyCompleted ? "bg-amber-500" : "bg-green-500"
              } rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl`}
            >
              <CheckCircle size={64} className="text-white" />
            </div>

            <h1 className="text-5xl font-bold text-amber-900 mb-4">
              {wasAlreadyCompleted
                ? "Session Already Complete! ✨"
                : "Focus Complete! 🎉"}
            </h1>

            <p className="text-xl text-amber-800 mb-8 leading-relaxed">
              {wasAlreadyCompleted
                ? "This focus session has already been completed. Great work on staying consistent with your focus journey!"
                : `Congratulations! You've completed your ${selectedTimer?.name} session. Time to celebrate your focused work!`}
            </p>

            {selectedTimer && (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-amber-200 mb-8">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div
                    className={`w-10 h-10 bg-gradient-to-r ${selectedTimer.color} rounded-full flex items-center justify-center`}
                  >
                    <selectedTimer.icon size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-amber-900">
                      {selectedTimer.name}
                    </h3>
                    <p className="text-amber-700 text-sm">
                      {selectedTimer.duration} minutes{" "}
                      {wasAlreadyCompleted ? "session" : "completed"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col items-center gap-4">
              {!wasAlreadyCompleted && (
                <Button
                  variant="default"
                  size="md"
                  onClick={handleReset}
                  className="min-w-48"
                >
                  Start Another Session
                </Button>
              )}

              <Button
                variant="secondary"
                size="md"
                onClick={() => router.push("/dashboard")}
                className="bg-amber-100 hover:bg-amber-200 text-amber-800 min-w-48"
              >
                <ArrowLeft size={20} />
                Back to Dashboard
              </Button>

              {/* Conditional dashboard button for authenticated users - only show if not already completed */}
              {!loading && isAuthenticated && !wasAlreadyCompleted && (
                <Button
                  variant="warning"
                  size="md"
                  onClick={confirmGoToDashboard}
                  className="min-w-48"
                >
                  <Home
                    size={16}
                    className="transition-transform group-hover:scale-110"
                  />
                  <span className="text-sm">Dashboard</span>
                </Button>
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
    <div className="min-h-screen bg-bee-soft relative overflow-hidden">
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
        <header className="flex items-center p-6 relative">
          <div className="flex-1">
            <Button variant="outline" size="md" onClick={handleBackToSession}>
              <ArrowLeft size={20} />
              Back to Session
            </Button>
          </div>

          <div className="text-center absolute left-1/2 transform -translate-x-1/2">
            <h1 className="text-2xl font-bold text-amber-900">
              Focus<span className="text-amber-600">Bee</span>
            </h1>
            <p className="text-sm text-amber-700">
              Session: {sessionId?.slice(-8)}
            </p>
          </div>

          <div className="flex-1 flex justify-end">
            {/* Conditional navigation */}
            {!loading && (
              <>
                {isAuthenticated ? (
                  <Button
                    variant="default"
                    size="md"
                    onClick={handleGoToDashboard}
                  >
                    <Home size={20} />
                    Dashboard
                  </Button>
                ) : (
                  <Button variant="default" size="md" onClick={handleJoinHive}>
                    <Star size={20} />
                    Join Hive
                  </Button>
                )}
              </>
            )}
          </div>
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

            {/* Main and Break Timers Container */}
            <div className="relative flex items-center justify-center mb-8">
              {/* Main Timer */}
              <div
                className={`transition-all duration-500 ${
                  isOnBreak
                    ? "opacity-60 scale-95 transform -translate-x-16"
                    : "opacity-100 scale-100 transform translate-x-0"
                }`}
              >
                <div className="relative w-96 h-96 rounded-full bg-white shadow-lg border-2 border-amber-200">
                  {/* Simple circular progress ring */}
                  <svg
                    className="absolute inset-4 w-88 h-88 transform -rotate-90"
                    viewBox="0 0 100 100"
                  >
                    {/* Background track */}
                    <circle
                      cx="50"
                      cy="50"
                      r="46"
                      fill="none"
                      stroke="#f3f4f6"
                      strokeWidth="4"
                    />

                    {/* Progress track */}
                    <circle
                      cx="50"
                      cy="50"
                      r="46"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={`${progress * 2.89} ${
                        (100 - progress) * 2.89
                      }`}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>

                  {/* Central content - Time display and button centered together */}
                  <div className="absolute inset-0 flex items-center justify-center mt-8">
                    <div className="flex flex-col items-center">
                      {/* Time display */}
                      <div className="text-7xl font-bold text-amber-900 tracking-tight text-center">
                        {formatTime(timeRemaining)}
                      </div>

                      {/* Pause/Resume and Reset buttons */}
                      <div className="mt-4 flex gap-3">
                        <button
                          onClick={handlePause}
                          disabled={isOnBreak}
                          className={`group flex items-center justify-center w-12 h-12 bg-white/90 backdrop-blur-sm hover:bg-white border transition-all duration-200 shadow-sm hover:shadow-md font-semibold rounded-xl ${
                            isOnBreak
                              ? "border-gray-200 text-gray-400 cursor-not-allowed"
                              : isPaused
                              ? "border-green-200 hover:border-green-300 text-green-700 hover:text-green-800"
                              : "border-amber-200 hover:border-amber-300 text-amber-700 hover:text-amber-800"
                          }`}
                        >
                          {isPaused ? (
                            <Play
                              size={16}
                              className="transition-transform group-hover:scale-110"
                            />
                          ) : (
                            <Pause
                              size={16}
                              className="transition-transform group-hover:scale-110"
                            />
                          )}
                        </button>

                        <button
                          onClick={handleReset}
                          disabled={isOnBreak}
                          className={`group flex items-center justify-center w-12 h-12 bg-white/90 backdrop-blur-sm hover:bg-white border transition-all duration-200 shadow-sm hover:shadow-md font-semibold rounded-xl ${
                            isOnBreak
                              ? "border-gray-200 text-gray-400 cursor-not-allowed"
                              : "border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-800"
                          }`}
                        >
                          <RotateCcw
                            size={16}
                            className="transition-transform group-hover:rotate-180"
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Break Timer */}
              {isOnBreak && (
                <div className="animate-fade-in-scale ml-8">
                  <div className="relative w-80 h-80 rounded-full bg-white shadow-lg border-2 border-emerald-200">
                    {/* Break timer progress ring */}
                    <svg
                      className="absolute inset-4 w-72 h-72 transform -rotate-90"
                      viewBox="0 0 100 100"
                    >
                      {/* Background track */}
                      <circle
                        cx="50"
                        cy="50"
                        r="46"
                        fill="none"
                        stroke="#f3f4f6"
                        strokeWidth="4"
                      />

                      {/* Progress track */}
                      <circle
                        cx="50"
                        cy="50"
                        r="46"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={`${
                          ((5 * 60 - breakTimeRemaining) / (5 * 60)) * 289
                        } ${(breakTimeRemaining / (5 * 60)) * 289}`}
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>

                    {/* Break timer central content */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex flex-col items-center">
                        {/* Break label */}
                        <div className="text-lg font-semibold text-emerald-700 mb-2">
                          Break Time
                        </div>

                        {/* Break time display */}
                        <div className="text-5xl font-bold text-emerald-900 tracking-tight text-center">
                          {formatTime(breakTimeRemaining)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Refined control buttons */}
            <div className="w-full flex justify-center mb-8">
              <div className="flex items-center gap-4">
                <Button
                  variant="success"
                  size="sm"
                  onClick={handleCompleteSession}
                >
                  <CheckCircle
                    size={16}
                    className="transition-transform group-hover:scale-110"
                  />
                  <span className="text-sm">Complete</span>
                </Button>

                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleCancelSession}
                >
                  <X
                    size={16}
                    className="transition-transform group-hover:rotate-90"
                  />
                  <span className="text-sm">Cancel</span>
                </Button>

                <Button
                  variant="warning"
                  size="sm"
                  onClick={handleBreak}
                  disabled={!isOnBreak && breakCount >= maxBreaks}
                  className={`${
                    !isOnBreak && breakCount >= maxBreaks
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <Coffee
                    size={16}
                    className="transition-transform group-hover:scale-110"
                  />
                  <span className="text-sm">
                    {isOnBreak ? "Finish Break" : "Break"}
                  </span>
                  {!isOnBreak && (
                    <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-xs font-medium">
                      {maxBreaks - breakCount}
                    </span>
                  )}
                </Button>
              </div>
            </div>
            {/* Session stats */}
            <div className="mt-12 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-amber-200">
              <div className="grid grid-cols-4 gap-6 text-center">
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
                <div>
                  <div className="text-2xl font-bold text-emerald-700">
                    {Math.floor(totalBreakTime / 60)}m
                  </div>
                  <div className="text-sm text-emerald-600">Break Time</div>
                </div>
              </div>
            </div>
            {/* Friendly signup section - only show for unauthenticated users */}
            {!loading && !isAuthenticated && <SignupSection />}
          </div>
        </div>

        {/* Confirmation modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 shadow-2xl border border-amber-200 max-w-lg w-full mx-4">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-amber-900 mb-3">
                  Complete this session?
                </h3>
                <p className="text-amber-800 leading-relaxed">
                  Your focus session is still active. If you go to the dashboard
                  now, this session will be marked as complete.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="default"
                  size="md"
                  onClick={confirmGoToDashboard}
                  className="shadow-lg hover:shadow-xl flex-1 sm:flex-initial min-w-0"
                >
                  <Home size={18} />
                  Go to Dashboard
                </Button>

                <Button
                  variant="secondary"
                  size="md"
                  onClick={cancelGoToDashboard}
                  className="bg-gray-500 hover:bg-gray-600 text-white border-gray-500 hover:border-gray-600 shadow-lg hover:shadow-xl flex-1 sm:flex-initial min-w-0"
                >
                  <Play size={18} />
                  Continue Session
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
