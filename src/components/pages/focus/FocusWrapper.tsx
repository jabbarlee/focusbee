"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSounds } from "@/hooks/useSounds";
import { useAuth } from "@/hooks/useAuth";
import { useAccurateTimer } from "@/hooks/useAccurateTimer";
import { usePageVisibility } from "@/hooks/usePageVisibility";
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
import { SessionCancelledScreen } from "./SessionCancelledScreen";
import { SessionCompletedView } from "./SessionCompletedView";

interface FocusWrapperProps {
  sessionId: string;
}

export function FocusWrapper({ sessionId }: FocusWrapperProps) {
  const router = useRouter();
  const [selectedTimer, setSelectedTimer] = useState<FocusMode | null>(null);
  const [sessionData, setSessionData] = useState<Session | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<
    "active" | "completed" | "cancelled" | null
  >(null);

  // Break timer state
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [breakStartTime, setBreakStartTime] = useState<number | null>(null);
  const [totalBreakTime, setTotalBreakTime] = useState(0);
  const [breakCount, setBreakCount] = useState(0);
  const maxBreaks = 2;

  const { playSuccess, playNotification, playBuzz } = useSounds();
  const { user, loading, isAuthenticated } = useAuth();
  const { isVisible } = usePageVisibility();

  // Main timer using accurate timer hook
  const mainTimer = useAccurateTimer({
    initialDuration: selectedTimer ? selectedTimer.duration * 60 : 0,
    resumeFromFocusedTime: sessionData?.actual_focus_minutes
      ? sessionData.actual_focus_minutes * 60
      : 0,
    onComplete: () => {
      setIsCompleted(true);
      if (sessionData) {
        const actualFocusedMinutes = mainTimer.getActualFocusedMinutes();
        console.log(
          "Session completed with actual focused minutes:",
          actualFocusedMinutes
        );
        completeSession(sessionData.id, undefined, actualFocusedMinutes).catch(
          console.error
        );
      }
      playSuccess();
    },
    onTick: (timeRemaining) => {
      // Optional: Add any per-tick logic here
    },
  });

  // Break timer using accurate timer hook
  const breakTimer = useAccurateTimer({
    initialDuration: 5 * 60, // 5 minutes
    onComplete: () => {
      // Break completed naturally
      setTotalBreakTime((prev) => prev + 5 * 60);
      setIsOnBreak(false);
      setBreakStartTime(null);
      mainTimer.resume();
      playNotification();
    },
  });

  // Update main timer duration when selectedTimer changes
  useEffect(() => {
    if (selectedTimer && !mainTimer.isRunning) {
      mainTimer.reset(selectedTimer.duration * 60);
    }
  }, [selectedTimer]);

  // Effect to handle session data changes and timer resumption
  useEffect(() => {
    if (sessionData && selectedTimer && sessionStatus === "active") {
      const focusedMinutes = sessionData.actual_focus_minutes || 0;
      const totalDurationMinutes = selectedTimer.duration;

      // Only reset and start if the timer isn't already running
      if (!mainTimer.isRunning && focusedMinutes < totalDurationMinutes) {
        mainTimer.reset(selectedTimer.duration * 60);
        // The timer will automatically account for resumeFromFocusedTime
      }
    }
  }, [sessionData, selectedTimer, sessionStatus]);

  // Handle page visibility changes
  useEffect(() => {
    if (isVisible && (mainTimer.isRunning || breakTimer.isRunning)) {
      // Page became visible again, timers will auto-recalculate
      console.log("Page became visible, timers will recalculate");
    }
  }, [isVisible, mainTimer.isRunning, breakTimer.isRunning]);

  // Use centralized focus modes data
  const timerOptions: FocusMode[] = focusModes;

  // Existing session fetch logic...
  useEffect(() => {
    const fetchSessionData = async () => {
      if (!sessionId) return;

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
          setSessionStatus(session.status);

          const timer = timerOptions.find((t) => t.id === session.focus_mode);
          if (timer) {
            setSelectedTimer(timer);
          }

          if (session.status === "completed") {
            setIsCompleted(true);
            setIsLoadingSession(false);
            return;
          }

          if (session.status === "cancelled") {
            setIsLoadingSession(false);
            return;
          }

          if (session.status === "active") {
            // Resume the timer from where it left off
            if (timer) {
              const focusedMinutes = session.actual_focus_minutes || 0;
              const totalDurationMinutes = timer.duration;

              // Check if session is already completed based on focused time
              if (focusedMinutes >= totalDurationMinutes) {
                setIsCompleted(true);
              } else {
                // Start the timer from the resumed point
                mainTimer.start();
                playBuzz();
              }
            }
          }
        } else {
          console.error("Session not found:", result.error);
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

  const handlePause = () => {
    if (!isOnBreak) {
      if (mainTimer.isPaused) {
        mainTimer.resume();
      } else {
        mainTimer.pause();
      }
      playNotification();
    }
  };

  const handleReset = () => {
    if (selectedTimer && !isOnBreak) {
      mainTimer.reset(selectedTimer.duration * 60);
      mainTimer.start();
      playBuzz();
    }
  };

  const handleBreak = () => {
    if (!isOnBreak && breakCount < maxBreaks) {
      // Start break
      setIsOnBreak(true);
      setBreakStartTime(Date.now());
      setBreakCount((prev) => prev + 1);
      mainTimer.pause();
      breakTimer.reset();
      breakTimer.start();
      playNotification();
    } else if (isOnBreak) {
      // Finish break early
      const timeSpentOnBreak = breakStartTime
        ? Math.floor((Date.now() - breakStartTime) / 1000)
        : 0;
      setTotalBreakTime((prev) => prev + timeSpentOnBreak);
      setIsOnBreak(false);
      setBreakStartTime(null);
      breakTimer.reset();
      mainTimer.resume();
      playNotification();
    }
  };

  const handleJoinHive = () => {
    router.push("/signup");
  };

  const handleGoToDashboard = async () => {
    // Pause the timer and show confirmation modal
    if (mainTimer.isRunning && !mainTimer.isPaused) {
      mainTimer.pause();
    }
    setShowConfirmModal(true);
  };

  const confirmGoToDashboard = async () => {
    // Complete the session before navigating to dashboard
    if (sessionData && sessionData.status === "active") {
      try {
        const actualFocusedMinutes = mainTimer.getActualFocusedMinutes();
        console.log(
          "Completing session before dashboard navigation with actual focused minutes:",
          actualFocusedMinutes
        );
        const result = await completeSession(
          sessionData.id,
          undefined,
          actualFocusedMinutes
        );
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
    if (mainTimer.isRunning) {
      mainTimer.resume();
    }
    setShowConfirmModal(false);
  };

  const handleCompleteSession = async () => {
    // Mark session as completed and navigate to dashboard
    if (sessionData && sessionData.status === "active") {
      try {
        const actualFocusedMinutes = mainTimer.getActualFocusedMinutes();
        console.log(
          "Completing session with actual focused minutes:",
          actualFocusedMinutes
        );
        const result = await completeSession(
          sessionData.id,
          undefined,
          actualFocusedMinutes
        );
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

  // Show cancelled session screen
  if (sessionStatus === "cancelled") {
    return (
      <SessionCancelledScreen
        selectedTimer={selectedTimer}
        onGoToDashboard={() => router.push("/dashboard")}
      />
    );
  }

  // Show completed session view (for accessing old completed sessions)
  if (sessionStatus === "completed" && !isCompleted) {
    return (
      <SessionCompletedView
        selectedTimer={selectedTimer}
        actualFocusMinutes={sessionData?.actual_focus_minutes}
        completedAt={sessionData?.end_time || undefined}
        onGoToDashboard={() => router.push("/dashboard")}
      />
    );
  }

  // Show completion screen (for just completed sessions)
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

  const progress = selectedTimer ? mainTimer.progress : 0;

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
          {/* Show resumption message if applicable */}
          {(sessionData?.actual_focus_minutes || 0) > 0 &&
            sessionStatus === "active" && (
              <div className="mb-6 p-3 bg-blue-100 rounded-lg text-center">
                <p className="text-blue-800 font-medium">Session Resumed</p>
                <p className="text-blue-600 text-sm">
                  You've already focused for {sessionData?.actual_focus_minutes}{" "}
                  minutes
                </p>
              </div>
            )}

          <TimerDisplay
            selectedTimer={selectedTimer}
            timeRemaining={mainTimer.timeRemaining}
            progress={progress}
            isPaused={mainTimer.isPaused}
            isOnBreak={isOnBreak}
            breakTimeRemaining={breakTimer.timeRemaining}
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
            timeRemaining={mainTimer.timeRemaining}
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
