import { useState, useEffect, useRef } from "react";

interface UseAccurateTimerProps {
  initialDuration: number; // in seconds
  onComplete: () => void;
  onTick?: (timeRemaining: number) => void;
  resumeFromFocusedTime?: number; // in seconds - how much time was already focused
}

export function useAccurateTimer({
  initialDuration,
  onComplete,
  onTick,
  resumeFromFocusedTime = 0,
}: UseAccurateTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(
    Math.max(0, initialDuration - resumeFromFocusedTime)
  );
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [completedNaturally, setCompletedNaturally] = useState(false);

  const startTimeRef = useRef<number | null>(null);
  const totalPausedTimeRef = useRef<number>(0);
  const pauseStartTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const actualFocusTimeRef = useRef<number>(resumeFromFocusedTime);
  // Store the time remaining when paused to preserve it exactly
  const pausedTimeRemainingRef = useRef<number | null>(null);

  const calculateTimeRemaining = () => {
    // If paused, return the preserved time remaining
    if (isPaused && pausedTimeRemainingRef.current !== null) {
      return pausedTimeRemainingRef.current;
    }

    if (!startTimeRef.current) return timeRemaining;

    const now = Date.now();
    const elapsed = Math.floor(
      (now - startTimeRef.current - totalPausedTimeRef.current) / 1000
    );
    const totalElapsed = resumeFromFocusedTime + elapsed;
    const remaining = Math.max(0, initialDuration - totalElapsed);

    return remaining;
  };

  const getActualFocusedTime = () => {
    // If paused, calculate focused time up to the pause point
    if (isPaused && pausedTimeRemainingRef.current !== null) {
      return initialDuration - pausedTimeRemainingRef.current;
    }

    // If currently running, calculate real-time focused time
    if (isRunning && !isPaused && startTimeRef.current) {
      const currentSessionTime = Math.floor(
        (Date.now() - startTimeRef.current - totalPausedTimeRef.current) / 1000
      );
      return resumeFromFocusedTime + currentSessionTime;
    }

    // Fallback to stored value
    return actualFocusTimeRef.current;
  };

  const getActualFocusedMinutes = () => {
    return Math.floor(getActualFocusedTime() / 60);
  };

  const start = () => {
    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
      totalPausedTimeRef.current = 0;
    }
    setIsRunning(true);
    setIsPaused(false);
    setCompletedNaturally(false);
  };

  const pause = () => {
    if (isRunning && !isPaused && startTimeRef.current) {
      // Calculate and preserve the exact time remaining at pause
      const now = Date.now();
      const elapsed = Math.floor(
        (now - startTimeRef.current - totalPausedTimeRef.current) / 1000
      );
      const totalElapsed = resumeFromFocusedTime + elapsed;
      const remaining = Math.max(0, initialDuration - totalElapsed);

      // Store the exact time remaining when paused
      pausedTimeRemainingRef.current = remaining;
      setTimeRemaining(remaining);

      // Record when pause started for tracking pause duration
      pauseStartTimeRef.current = Date.now();
    }
    setIsPaused(true);
  };

  const resume = () => {
    if (isPaused && pauseStartTimeRef.current) {
      // Add the pause duration to total paused time
      const pauseDuration = Date.now() - pauseStartTimeRef.current;
      totalPausedTimeRef.current += pauseDuration;
      pauseStartTimeRef.current = null;

      // Clear the preserved paused state
      pausedTimeRemainingRef.current = null;
    }
    setIsPaused(false);
    setIsRunning(true);
  };

  const reset = (newDuration?: number) => {
    const duration = newDuration || initialDuration;
    setIsRunning(false);
    setIsPaused(false);
    setCompletedNaturally(false);
    setTimeRemaining(Math.max(0, duration - resumeFromFocusedTime));
    startTimeRef.current = null;
    totalPausedTimeRef.current = 0;
    pauseStartTimeRef.current = null;
    pausedTimeRemainingRef.current = null;
    actualFocusTimeRef.current = resumeFromFocusedTime; // Reset to resumed time
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  // Main timer effect
  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        const remaining = calculateTimeRemaining();
        setTimeRemaining(remaining);

        if (onTick) {
          onTick(remaining);
        }

        if (remaining <= 0) {
          // Timer completed naturally - ensure we report the full duration
          actualFocusTimeRef.current = initialDuration;
          setIsRunning(false);
          setCompletedNaturally(true);
          onComplete();
        }
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, onComplete, onTick]);

  // Handle visibility change to recalculate when tab becomes active
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isRunning && !isPaused) {
        const remaining = calculateTimeRemaining();
        setTimeRemaining(remaining);

        if (remaining <= 0) {
          // Timer completed naturally - ensure we report the full duration
          actualFocusTimeRef.current = initialDuration;
          setIsRunning(false);
          setCompletedNaturally(true);
          onComplete();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isRunning, isPaused, onComplete]);

  return {
    timeRemaining,
    isRunning,
    isPaused,
    start,
    pause,
    resume,
    reset,
    getActualFocusedTime,
    getActualFocusedMinutes,
    progress: (getActualFocusedTime() / initialDuration) * 100,
    completedNaturally,
  };
}
