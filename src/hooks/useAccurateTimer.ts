import { useState, useEffect, useRef } from "react";

interface UseAccurateTimerProps {
  initialDuration: number; // in seconds
  onComplete: () => void;
  onTick?: (timeRemaining: number) => void;
}

export function useAccurateTimer({
  initialDuration,
  onComplete,
  onTick,
}: UseAccurateTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(initialDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const actualFocusTimeRef = useRef<number>(0); // Track actual focused time in seconds

  const calculateTimeRemaining = () => {
    if (!startTimeRef.current || isPaused) return timeRemaining;

    const now = Date.now();
    const elapsed = Math.floor(
      (now - startTimeRef.current - pausedTimeRef.current) / 1000
    );
    const remaining = Math.max(0, initialDuration - elapsed);

    return remaining;
  };

  const getActualFocusedTime = () => {
    let totalFocusedSeconds = actualFocusTimeRef.current;

    // If currently running and not paused, add the current session time
    if (isRunning && !isPaused && startTimeRef.current) {
      const currentSessionTime = Math.floor(
        (Date.now() - startTimeRef.current - pausedTimeRef.current) / 1000
      );
      totalFocusedSeconds += currentSessionTime;
    }

    return totalFocusedSeconds;
  };

  const getActualFocusedMinutes = () => {
    return Math.floor(getActualFocusedTime() / 60);
  };

  const start = () => {
    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
      pausedTimeRef.current = 0;
    }
    setIsRunning(true);
    setIsPaused(false);
  };

  const pause = () => {
    // Record the focused time up to this point
    if (isRunning && !isPaused && startTimeRef.current) {
      const focusedTime = Math.floor(
        (Date.now() - startTimeRef.current - pausedTimeRef.current) / 1000
      );
      actualFocusTimeRef.current += focusedTime;
    }
    setIsPaused(true);
    setIsRunning(false);
  };

  const resume = () => {
    if (startTimeRef.current && isPaused) {
      // Reset the start time to now and clear paused time for the new session
      startTimeRef.current = Date.now();
      pausedTimeRef.current = 0;
    }
    setIsPaused(false);
    setIsRunning(true);
  };

  const reset = (newDuration?: number) => {
    const duration = newDuration || initialDuration;
    setIsRunning(false);
    setIsPaused(false);
    setTimeRemaining(duration);
    startTimeRef.current = null;
    pausedTimeRef.current = 0;
    actualFocusTimeRef.current = 0; // Reset actual focus time
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
          // Add the final focused time before completing
          if (startTimeRef.current) {
            const finalFocusedTime = Math.floor(
              (Date.now() - startTimeRef.current - pausedTimeRef.current) / 1000
            );
            actualFocusTimeRef.current += finalFocusedTime;
          }
          setIsRunning(false);
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
          // Add the final focused time before completing
          if (startTimeRef.current) {
            const finalFocusedTime = Math.floor(
              (Date.now() - startTimeRef.current - pausedTimeRef.current) / 1000
            );
            actualFocusTimeRef.current += finalFocusedTime;
          }
          setIsRunning(false);
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
    progress: ((initialDuration - timeRemaining) / initialDuration) * 100,
  };
}
