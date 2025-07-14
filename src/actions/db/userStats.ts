"use server";

import { supabase } from "@/lib/config/supabase";
import { UserStats, Session } from "@/types/dbSchema";
import { DatabaseResult } from "./users";

/**
 * Create initial user stats record for a new user
 */
export async function createUserStats(
  uid: string
): Promise<DatabaseResult<UserStats>> {
  try {
    const { data, error } = await supabase
      .from("user_stats")
      .insert([
        {
          uid,
          total_focus_minutes: 0,
          total_sessions: 0,
          completed_sessions: 0,
          cancelled_sessions: 0,
          last_session_at: null,
          longest_session_minutes: 0,
          average_session_minutes: 0,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating user stats:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: data as UserStats,
    };
  } catch (error) {
    console.error("Unexpected error creating user stats:", error);
    return {
      success: false,
      error: "Failed to create user stats",
    };
  }
}

/**
 * Get user stats record by uid
 */
export async function getUserStatsRecord(
  uid: string
): Promise<DatabaseResult<UserStats | null>> {
  try {
    const { data, error } = await supabase
      .from("user_stats")
      .select("*")
      .eq("uid", uid)
      .single();

    if (error) {
      // User stats not found
      if (error.code === "PGRST116") {
        return {
          success: true,
          data: null,
        };
      }

      console.error("Error fetching user stats:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: data as UserStats,
    };
  } catch (error) {
    console.error("Unexpected error fetching user stats:", error);
    return {
      success: false,
      error: "Failed to fetch user stats",
    };
  }
}

/**
 * Calculate session duration in minutes
 */
function calculateSessionDuration(
  startTime: string,
  endTime: string | null
): number {
  if (!endTime) return 0;

  const start = new Date(startTime);
  const end = new Date(endTime);
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
}

/**
 * Update user stats when a session is created
 */
export async function updateStatsOnSessionCreate(
  uid: string
): Promise<DatabaseResult<UserStats>> {
  try {
    // Ensure user stats record exists
    const statsResult = await getUserStatsRecord(uid);

    if (!statsResult.success) {
      return {
        success: false,
        error: statsResult.error,
      };
    }

    if (!statsResult.data) {
      // Create initial stats record if it doesn't exist
      return await createUserStats(uid);
    }

    // Increment total sessions count
    const { data, error } = await supabase
      .from("user_stats")
      .update({
        total_sessions: statsResult.data.total_sessions + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("uid", uid)
      .select()
      .single();

    if (error) {
      console.error("Error updating stats on session create:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: data as UserStats,
    };
  } catch (error) {
    console.error("Unexpected error updating stats on session create:", error);
    return {
      success: false,
      error: "Failed to update user stats",
    };
  }
}

/**
 * Update user stats when a session is completed
 */
export async function updateStatsOnSessionComplete(
  session: Session
): Promise<DatabaseResult<UserStats>> {
  try {
    const { uid, actual_focus_minutes } = session;

    // Get current stats
    const statsResult = await getUserStatsRecord(uid);

    if (!statsResult.success || !statsResult.data) {
      console.error("User stats not found for completed session");
      return {
        success: false,
        error: "User stats not found",
      };
    }

    const currentStats = statsResult.data;
    const sessionDuration = actual_focus_minutes || 0; // Use actual focus time, not elapsed time

    // Calculate new stats
    const newCompletedSessions = currentStats.completed_sessions + 1;
    const newTotalFocusMinutes =
      currentStats.total_focus_minutes + sessionDuration;
    const newLongestSession = Math.max(
      currentStats.longest_session_minutes,
      sessionDuration
    );
    const newAverageSessionMinutes = Math.round(
      newTotalFocusMinutes / newCompletedSessions
    );

    const { data, error } = await supabase
      .from("user_stats")
      .update({
        completed_sessions: newCompletedSessions,
        total_focus_minutes: newTotalFocusMinutes,
        longest_session_minutes: newLongestSession,
        average_session_minutes: newAverageSessionMinutes,
        last_session_at: session.end_time,
        updated_at: new Date().toISOString(),
      })
      .eq("uid", uid)
      .select()
      .single();

    if (error) {
      console.error("Error updating stats on session complete:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log(
      `Updated stats for user ${uid}: +${sessionDuration} minutes, ${newCompletedSessions} completed sessions`
    );

    return {
      success: true,
      data: data as UserStats,
    };
  } catch (error) {
    console.error(
      "Unexpected error updating stats on session complete:",
      error
    );
    return {
      success: false,
      error: "Failed to update user stats",
    };
  }
}

/**
 * Update user stats when a session is cancelled
 */
export async function updateStatsOnSessionCancel(
  uid: string
): Promise<DatabaseResult<UserStats>> {
  try {
    // Get current stats
    const statsResult = await getUserStatsRecord(uid);

    if (!statsResult.success || !statsResult.data) {
      console.error("User stats not found for cancelled session");
      return {
        success: false,
        error: "User stats not found",
      };
    }

    const currentStats = statsResult.data;

    // Increment cancelled sessions count
    const { data, error } = await supabase
      .from("user_stats")
      .update({
        cancelled_sessions: currentStats.cancelled_sessions + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("uid", uid)
      .select()
      .single();

    if (error) {
      console.error("Error updating stats on session cancel:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log(
      `Updated stats for user ${uid}: cancelled session count increased`
    );

    return {
      success: true,
      data: data as UserStats,
    };
  } catch (error) {
    console.error("Unexpected error updating stats on session cancel:", error);
    return {
      success: false,
      error: "Failed to update user stats",
    };
  }
}

/**
 * Recalculate user stats from scratch based on all their sessions
 * Useful for data migrations or fixing inconsistencies
 */
export async function recalculateUserStats(
  uid: string
): Promise<DatabaseResult<UserStats>> {
  try {
    // Get all sessions for the user
    const { data: sessions, error: sessionsError } = await supabase
      .from("sessions")
      .select("*")
      .eq("uid", uid);

    if (sessionsError) {
      console.error(
        "Error fetching sessions for recalculation:",
        sessionsError
      );
      return {
        success: false,
        error: sessionsError.message,
      };
    }

    const allSessions = sessions as Session[];
    const completedSessions = allSessions.filter(
      (s) => s.status === "completed"
    );
    const cancelledSessions = allSessions.filter(
      (s) => s.status === "cancelled"
    );

    // Calculate stats using actual focus time
    let totalFocusMinutes = 0;
    let longestSessionMinutes = 0;
    let lastSessionAt: string | null = null;

    completedSessions.forEach((session) => {
      if (session.end_time) {
        // Use actual_focus_minutes if available, otherwise fallback to elapsed time
        const duration =
          session.actual_focus_minutes > 0
            ? session.actual_focus_minutes
            : calculateSessionDuration(session.start_time, session.end_time);

        totalFocusMinutes += duration;
        longestSessionMinutes = Math.max(longestSessionMinutes, duration);

        if (
          !lastSessionAt ||
          new Date(session.end_time) > new Date(lastSessionAt)
        ) {
          lastSessionAt = session.end_time;
        }
      }
    });

    const averageSessionMinutes =
      completedSessions.length > 0
        ? Math.round(totalFocusMinutes / completedSessions.length)
        : 0;

    // Update or create stats
    const { data, error } = await supabase
      .from("user_stats")
      .upsert({
        uid,
        total_focus_minutes: totalFocusMinutes,
        total_sessions: allSessions.length,
        completed_sessions: completedSessions.length,
        cancelled_sessions: cancelledSessions.length,
        last_session_at: lastSessionAt,
        longest_session_minutes: longestSessionMinutes,
        average_session_minutes: averageSessionMinutes,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error recalculating user stats:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log(
      `Recalculated stats for user ${uid}: ${totalFocusMinutes} total minutes, ${completedSessions.length}/${allSessions.length} completed sessions`
    );

    return {
      success: true,
      data: data as UserStats,
    };
  } catch (error) {
    console.error("Unexpected error recalculating user stats:", error);
    return {
      success: false,
      error: "Failed to recalculate user stats",
    };
  }
}
