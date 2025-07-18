import { useState, useEffect } from "react";

export function usePageVisibility() {
  const [isVisible, setIsVisible] = useState(!document.hidden);
  const [lastHiddenTime, setLastHiddenTime] = useState<number | null>(null);
  const [lastVisibleTime, setLastVisibleTime] = useState<number | null>(null);

  useEffect(() => {
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
