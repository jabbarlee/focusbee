import { useState, useEffect } from "react";

export function usePageVisibility() {
  const [isVisible, setIsVisible] = useState(() => {
    // Check if we're in browser environment
    if (typeof document !== "undefined") {
      return !document.hidden;
    }
    // Default to visible during SSR
    return true;
  });
  const [lastHiddenTime, setLastHiddenTime] = useState<number | null>(null);
  const [lastVisibleTime, setLastVisibleTime] = useState<number | null>(null);

  useEffect(() => {
    // Only run in browser environment
    if (typeof document === "undefined") {
      return;
    }

    const handleVisibilityChange = () => {
      const now = Date.now();

      if (document.hidden) {
        setIsVisible(false);
        setLastHiddenTime(now);
      } else {
        setIsVisible(true);
        setLastVisibleTime(now);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Also listen for focus/blur events as backup
    window.addEventListener("focus", handleVisibilityChange);
    window.addEventListener("blur", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibilityChange);
      window.removeEventListener("blur", handleVisibilityChange);
    };
  }, []);

  const getAwayTime = () => {
    if (lastHiddenTime && lastVisibleTime && lastVisibleTime > lastHiddenTime) {
      return lastVisibleTime - lastHiddenTime;
    }
    return 0;
  };

  return {
    isVisible,
    lastHiddenTime,
    lastVisibleTime,
    getAwayTime,
  };
}
