// Example: Using User Stats in a React Component
// This is an example file showing how to integrate user stats into your app

"use client";

import { useEffect, useState } from "react";
import { getUserStatsRecord } from "@/actions/db/userStats";
import { UserStats } from "@/types/dbSchema";
import { useAuth } from "@/hooks/useAuth";

export function UserStatsDisplay() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.uid) return;

      setLoading(true);
      setError(null);

      try {
        const result = await getUserStatsRecord(user.uid);

        if (result.success) {
          setStats(result.data || null);
        } else {
          setError(result.error || "Failed to load stats");
        }
      } catch (err) {
        setError("Failed to load user stats");
        console.error("Error loading user stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user?.uid]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-sm">Error loading stats: {error}</div>
    );
  }

  if (!stats) {
    return (
      <div className="text-gray-500 text-sm">
        No stats available yet. Complete your first session!
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Your Focus Journey
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Focus Time"
          value={`${stats.total_focus_minutes} min`}
          subtext={`${Math.round(stats.total_focus_minutes / 60)} hours`}
        />

        <StatCard
          label="Sessions Completed"
          value={stats.completed_sessions.toString()}
          subtext={`${stats.total_sessions} total`}
        />

        <StatCard
          label="Longest Session"
          value={`${stats.longest_session_minutes} min`}
          subtext={
            stats.longest_session_minutes > 60
              ? `${Math.round(stats.longest_session_minutes / 60)}h ${
                  stats.longest_session_minutes % 60
                }m`
              : ""
          }
        />

        <StatCard
          label="Average Session"
          value={`${stats.average_session_minutes} min`}
          subtext={stats.completed_sessions > 0 ? "per session" : ""}
        />
      </div>

      {stats.last_session_at && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Last session: {new Date(stats.last_session_at).toLocaleDateString()}
          </p>
        </div>
      )}

      {stats.cancelled_sessions > 0 && (
        <div className="mt-2">
          <p className="text-xs text-gray-500">
            {stats.cancelled_sessions} cancelled session
            {stats.cancelled_sessions !== 1 ? "s" : ""}
          </p>
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  subtext?: string;
}

function StatCard({ label, value, subtext }: StatCardProps) {
  return (
    <div className="text-center">
      <p className="text-2xl font-bold text-amber-600">{value}</p>
      <p className="text-sm font-medium text-gray-900">{label}</p>
      {subtext && <p className="text-xs text-gray-500">{subtext}</p>}
    </div>
  );
}

// Example: Real-time stats updates after session completion
export function useStatsUpdates() {
  const { user } = useAuth();

  const refreshStats = async () => {
    if (!user?.uid) return null;

    const result = await getUserStatsRecord(user.uid);
    return result.success ? result.data : null;
  };

  // Call this after completing a session to get updated stats
  return { refreshStats };
}
