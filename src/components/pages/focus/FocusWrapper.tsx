"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSounds } from "@/hooks/useSounds";
import { useAuth } from "@/hooks/useAuth";
import { focusModes, FocusMode } from "@/lib/data";
import {
  getSessionById,
  completeSession,
  cancelSession,
} from "@/actions/db/sessions";
import { Session } from "@/types/dbSchema";
import { LoadingSpinner } from "./LoadingSpinner";
import { FocusHeader } from "./FocusHeader";
import { TimerDisplay } from "./TimerDisplay";
import { ControlButtons } from "./ControlButtons";
import { SessionStats } from "./SessionStats";
import { SignupSection } from "./SignupSection";
import { CompletionScreen } from "./CompletionScreen";
import { ConfirmationModal } from "./ConfirmationModal";

interface FocusWrapperProps {
  sessionId: string;
}

export function FocusWrapper({ sessionId }: FocusWrapperProps) {
  const router = useRouter();
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
  const [showConfirmModal, setShowConfirmModal] = useState(false);
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

  const handleJoinHive = () => {
    router.push("/signup");
  };

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

  if (isLoadingSession || !selectedTimer) {
    return (
      <LoadingSpinner
        message={
          isLoadingSession
            ? "Loading your focus session..."
            : "Preparing your focus zone..."
        }
      />
    );
  }

  if (isCompleted) {
    const wasAlreadyCompleted = sessionData?.status === "completed";

    return (
      <CompletionScreen
        selectedTimer={selectedTimer}
        wasAlreadyCompleted={wasAlreadyCompleted}
        isAuthenticated={isAuthenticated}
        loading={loading}
        onReset={handleReset}
        onGoToDashboard={confirmGoToDashboard}
      />
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
        <FocusHeader
          sessionId={sessionId}
          isAuthenticated={isAuthenticated}
          loading={loading}
          onJoinHive={handleJoinHive}
          onGoToDashboard={handleGoToDashboard}
        />

        {/* Main timer area */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          <TimerDisplay
            selectedTimer={selectedTimer}
            timeRemaining={timeRemaining}
            progress={progress}
            isPaused={isPaused}
            isOnBreak={isOnBreak}
            breakTimeRemaining={breakTimeRemaining}
            onPause={handlePause}
            onReset={handleReset}
          />

          <ControlButtons
            isOnBreak={isOnBreak}
            breakCount={breakCount}
            maxBreaks={maxBreaks}
            onCompleteSession={handleCompleteSession}
            onCancelSession={handleCancelSession}
            onBreak={handleBreak}
          />

          <SessionStats
            selectedTimer={selectedTimer}
            progress={progress}
            timeRemaining={timeRemaining}
            totalBreakTime={totalBreakTime}
          />

          {/* Signup section - only show for unauthenticated users */}
          {!loading && !isAuthenticated && (
            <SignupSection onJoinHive={handleJoinHive} />
          )}
        </div>

        <ConfirmationModal
          isOpen={showConfirmModal}
          onConfirm={confirmGoToDashboard}
          onCancel={cancelGoToDashboard}
        />
      </div>
    </div>
  );
}
