"use client";

import { useState, useEffect } from "react";
import { Trophy, Clock, Flame, Target, BarChart3 } from "lucide-react";
import {
  getUserStats,
  getWeeklyStats,
  cleanupOrphanedSessions,
} from "@/actions/db/sessions";

interface StatsDisplayProps {
  user: any;
}

interface Stats {
  totalSessions: number;
  completedSessions: number;
  totalFocusTime: number;
  streakDays: number;
  favoriteMode: "quick-buzz" | "honey-flow" | "deep-nectar";
  weeklyFocus: number[];
  avgSessionLength: number;
  completionRate: number;
}

export function StatsDisplay({ user }: StatsDisplayProps) {
  const [stats, setStats] = useState<Stats>({
    totalSessions: 0,
    completedSessions: 0,
    totalFocusTime: 0,
    streakDays: 0,
    favoriteMode: "honey-flow",
    weeklyFocus: [0, 0, 0, 0, 0, 0, 0],
    avgSessionLength: 0,
    completionRate: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.uid) return;

      setIsLoadingStats(true);
      try {
        // First, cleanup any orphaned sessions
        await cleanupOrphanedSessions(user.uid);

        // Fetch basic user stats
        const statsResult = await getUserStats(user.uid);

        // Fetch weekly stats
        const weeklyResult = await getWeeklyStats(user.uid);

        if (
          statsResult.success &&
          statsResult.data &&
          weeklyResult.success &&
          weeklyResult.data
        ) {
          setStats({
            totalSessions: statsResult.data.totalSessions,
            completedSessions: statsResult.data.completedSessions,
            totalFocusTime: statsResult.data.totalFocusTime,
            streakDays: statsResult.data.streakDays,
            favoriteMode: statsResult.data.favoriteMode || "honey-flow",
            weeklyFocus: weeklyResult.data.weeklyFocus,
            avgSessionLength: weeklyResult.data.avgSessionLength,
            completionRate: weeklyResult.data.completionRate,
          });
        } else {
          console.error("Failed to fetch stats:", {
            statsError: statsResult.error,
            weeklyError: weeklyResult.error,
          });
          // Set default values if data fetch fails
          setStats({
            totalSessions: 0,
            completedSessions: 0,
            totalFocusTime: 0,
            streakDays: 0,
            favoriteMode: "honey-flow",
            weeklyFocus: [0, 0, 0, 0, 0, 0, 0],
            avgSessionLength: 0,
            completionRate: 0,
          });
        }
      } catch (error) {
        console.error("Error fetching statistics:", error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchStats();
  }, [user?.uid]);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-amber-200 text-center hover:shadow-xl transition-shadow duration-300">
          <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <Trophy size={24} className="text-white" />
          </div>
          <div className="text-3xl font-bold text-amber-900 mb-1">
            {isLoadingStats ? (
              <div className="animate-pulse bg-amber-200 h-8 w-16 rounded mx-auto"></div>
            ) : (
              stats.totalSessions
            )}
          </div>
          <p className="text-amber-700 text-sm font-medium">Total Sessions</p>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-green-200 text-center hover:shadow-xl transition-shadow duration-300">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <Clock size={24} className="text-white" />
          </div>
          <div className="text-3xl font-bold text-green-800 mb-1">
            {isLoadingStats ? (
              <div className="animate-pulse bg-green-200 h-8 w-20 rounded mx-auto"></div>
            ) : (
              formatTime(stats.totalFocusTime)
            )}
          </div>
          <p className="text-green-700 text-sm font-medium">Total Focus Time</p>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-orange-200 text-center hover:shadow-xl transition-shadow duration-300">
          <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <Flame size={24} className="text-white" />
          </div>
          <div className="text-3xl font-bold text-orange-800 mb-1">
            {isLoadingStats ? (
              <div className="animate-pulse bg-orange-200 h-8 w-12 rounded mx-auto"></div>
            ) : (
              stats.streakDays
            )}
          </div>
          <p className="text-orange-700 text-sm font-medium">Day Streak</p>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-purple-200 text-center hover:shadow-xl transition-shadow duration-300">
          <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <Target size={24} className="text-white" />
          </div>
          <div className="text-3xl font-bold text-purple-800 mb-1">
            {isLoadingStats ? (
              <div className="animate-pulse bg-purple-200 h-8 w-16 rounded mx-auto"></div>
            ) : (
              `${stats.completionRate}%`
            )}
          </div>
          <p className="text-purple-700 text-sm font-medium">Success Rate</p>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-amber-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <BarChart3 size={20} className="text-white" />
          </div>
          <h3 className="text-xl font-bold text-amber-900">Weekly Focus</h3>
        </div>
        <div className="flex items-end gap-2 h-32 mb-4">
          {isLoadingStats
            ? // Loading skeleton for weekly chart
              Array.from({ length: 7 }).map((_, index) => (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <div className="w-full bg-amber-100 rounded-t-xl relative">
                    <div
                      className="w-full bg-amber-200 rounded-t-xl animate-pulse"
                      style={{
                        height: `${Math.random() * 60 + 20}%`,
                      }}
                    />
                  </div>
                  <span className="text-amber-700 text-xs font-bold">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}
                  </span>
                </div>
              ))
            : stats.weeklyFocus.map((minutes, index) => {
                const maxMinutes = Math.max(...stats.weeklyFocus);
                const height =
                  maxMinutes > 0 ? (minutes / maxMinutes) * 100 : 0;
                const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
                return (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    <div className="w-full bg-amber-100 rounded-t-xl relative">
                      <div
                        className="w-full bg-gradient-to-t from-amber-400 to-amber-500 rounded-t-xl flex items-end justify-center"
                        style={{ height: `${height}%` }}
                      >
                        {minutes > 0 && (
                          <span className="text-white text-xs font-bold mb-1">
                            {minutes}m
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-amber-700 text-xs font-bold">
                      {days[index]}
                    </span>
                  </div>
                );
              })}
        </div>
        <div className="bg-amber-50 rounded-xl p-4 text-center">
          <p className="text-amber-800 font-semibold">
            Total this week:{" "}
            {isLoadingStats ? (
              <span className="inline-block animate-pulse bg-amber-200 h-4 w-16 rounded"></span>
            ) : (
              formatTime(stats.weeklyFocus.reduce((a, b) => a + b, 0))
            )}{" "}
            🎉
          </p>
        </div>
      </div>
    </div>
  );
}
