"use client";

import { useState, useEffect } from "react";
import { getUserStats, cleanupOrphanedSessions } from "@/actions/db/sessions";

interface MotivationMessageProps {
  user: any;
}

export function MotivationMessage({ user }: MotivationMessageProps) {
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserStats = async () => {
      if (!user?.uid) return;

      setIsLoading(true);
      try {
        // First, cleanup any orphaned sessions
        await cleanupOrphanedSessions(user.uid);

        // Fetch basic user stats
        const statsResult = await getUserStats(user.uid);

        if (statsResult.success && statsResult.data) {
          setIsFirstTimeUser(statsResult.data.totalSessions === 0);
        } else {
          setIsFirstTimeUser(true); // Default to first time user if stats fetch fails
        }
      } catch (error) {
        console.error("Error checking user stats:", error);
        setIsFirstTimeUser(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserStats();
  }, [user?.uid]);

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-3xl p-8 shadow-lg">
        <div className="animate-pulse">
          <div className="h-8 bg-amber-200 rounded w-3/4 mx-auto mb-4"></div>
          <div className="h-6 bg-amber-100 rounded w-full mb-2"></div>
          <div className="h-6 bg-amber-100 rounded w-5/6 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (isFirstTimeUser) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-3xl p-8 shadow-lg text-center">
        <h3 className="text-xl md:text-2xl font-bold text-blue-900 mb-6">
          Welcome to your FocusBee Hive! 🎉
        </h3>
        <p className="text-lg md:text-xl text-blue-700 leading-relaxed mb-4">
          "Buzz buzz! I'm so excited to help you on your focus journey! Your
          hive is ready and waiting. Scan the QR code above to start your very
          first focus session and let's build some amazing productivity habits
          together! 🐝✨"
        </p>
        <p className="text-md text-blue-600">
          Once you complete your first session, I'll start tracking your
          progress and showing you beautiful statistics right here!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-3xl p-8 shadow-lg text-center">
      <h3 className="text-xl md:text-2xl font-bold text-amber-900 mb-6">
        Your Daily Bee Wisdom 🌻
      </h3>
      <p className="text-lg md:text-xl text-amber-700 leading-relaxed">
        "Remember, even the busiest bees take time to rest between flights!
        You're doing incredible work building these focus habits. I'm so proud
        of how far you've come, and I can't wait to see what amazing things
        you'll accomplish next! Keep being awesome! 🌟"
      </p>
    </div>
  );
}
