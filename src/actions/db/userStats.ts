"use server";

/**
 * User Statistics Management for FocusBee
 *
 * CRITICAL DATA INTEGRITY RULE:
 * - Focus time must ONLY be calculated from the actual_focus_minutes field
 * - NEVER calculate time from start_time/end_time difference
 * - Only sessions with actual_focus_minutes > 0 count as completed
 * - The user_stats table is the single source of truth for dashboard data
 * - Dashboard should ONLY read from user_stats, never from sessions directly
 */

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
 * Get user stats for dashboard display
 * This function reads directly from user_stats table and formats it for the dashboard
 */
export async function getUserStatsForDashboard(uid: string): Promise<
  DatabaseResult<{
    totalSessions: number;
    completedSessions: number;
    totalFocusTime: number; // in minutes
    streakDays: number;
    favoriteMode: string | null;
    avgSessionLength: number;
    completionRate: number;
  }>
> {
  try {
    // First ensure suser stats record exists
    const statsResult = await getUserStatsRecord(uid);

    if (!statsResult.success) {
      return {
        success: false,
        error: statsResult.error,
      };
    }

    if (!statsResult.data) {
      // Create initial stats record if it doesn't exist
      const createResult = await createUserStats(uid);
      if (!createResult.success) {
        return {
          success: false,
          error: createResult.error,
        };
      }

      // Return initial stats
      return {
        success: true,
        data: {
          totalSessions: 0,
          completedSessions: 0,
          totalFocusTime: 0,
          streakDays: 0,
          favoriteMode: null,
          avgSessionLength: 0,
          completionRate: 0,
        },
      };
    }

    const stats = statsResult.data;

    // Calculate completion rate
    const completionRate =
      stats.total_sessions > 0
        ? Math.round((stats.completed_sessions / stats.total_sessions) * 100)
        : 0;

    // Calculate streak days (simplified - we'll enhance this later if needed)
    const streakDays = 0; // TODO: Implement streak calculation

    // Get favorite mode from recent sessions
    const { data: recentSessions } = await supabase
      .from("sessions")
      .select("focus_mode")
      .eq("uid", uid)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(10);

    let favoriteMode: string | null = null;
    if (recentSessions && recentSessions.length > 0) {
      const modeCount: Record<string, number> = {};
      recentSessions.forEach((session) => {
        if (session.focus_mode) {
          modeCount[session.focus_mode] =
            (modeCount[session.focus_mode] || 0) + 1;
        }
      });

      let maxCount = 0;
      Object.entries(modeCount).forEach(([mode, count]) => {
        if (count > maxCount) {
          maxCount = count;
          favoriteMode = mode;
        }
      });
    }

    return {
      success: true,
      data: {
        totalSessions: stats.total_sessions,
        completedSessions: stats.completed_sessions,
        totalFocusTime: stats.total_focus_minutes,
        streakDays,
        favoriteMode,
        avgSessionLength: stats.average_session_minutes,
        completionRate,
      },
    };
  } catch (error) {
    console.error("Unexpected error fetching user stats for dashboard:", error);
    return {
      success: false,
      error: "Failed to fetch user stats for dashboard",
    };
  }
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
 * STRICT RULE: Only use actual_focus_minutes, never calculate from start_time/end_time
 */
export async function updateStatsOnSessionComplete(
  session: Session
): Promise<DatabaseResult<UserStats>> {
  try {
    const { uid, actual_focus_minutes } = session;

    // Validate that actual_focus_minutes is set
    if (actual_focus_minutes === undefined || actual_focus_minutes === null) {
      console.error("Session completed without actual_focus_minutes set");
      return {
        success: false,
        error: "Session completed without actual_focus_minutes set",
      };
    }

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

    // Only count sessions with actual focus time > 0 as completed
    // Sessions with 0 focus time are technically completed but don't count toward stats
    if (actual_focus_minutes > 0) {
      // Calculate new stats
      const newCompletedSessions = currentStats.completed_sessions + 1;
      const newTotalFocusMinutes =
        currentStats.total_focus_minutes + actual_focus_minutes;
      const newLongestSession = Math.max(
        currentStats.longest_session_minutes,
        actual_focus_minutes
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
        `Updated stats for user ${uid}: +${actual_focus_minutes} minutes, ${newCompletedSessions} completed sessions`
      );

      return {
        success: true,
        data: data as UserStats,
      };
    } else {
      // Session completed but with 0 focus time - don't increment completed_sessions
      console.log(
        `Session completed with 0 focus time for user ${uid}: not counting toward completion stats`
      );

      // Just update the last_session_at timestamp only if we have a valid end_time
      if (session.end_time) {
        const { data, error } = await supabase
          .from("user_stats")
          .update({
            last_session_at: session.end_time,
            updated_at: new Date().toISOString(),
          })
          .eq("uid", uid)
          .select()
          .single();

        if (error) {
          console.error("Error updating last session timestamp:", error);
          return {
            success: false,
            error: error.message,
          };
        }

        return {
          success: true,
          data: data as UserStats,
        };
      } else {
        // No end_time, just return current stats
        return {
          success: true,
          data: currentStats,
        };
      }
    }
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
 * STRICT RULE: Only use actual_focus_minutes, never calculate from start_time/end_time
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

    // Calculate stats using ONLY actual_focus_minutes
    // Only count sessions with actual focus time > 0 as truly completed
    let totalFocusMinutes = 0;
    let longestSessionMinutes = 0;
    let lastSessionAt: string | null = null;
    let actuallyCompletedSessions = 0;

    completedSessions.forEach((session) => {
      // STRICT RULE: Only use actual_focus_minutes, never calculate from timestamps
      if (session.actual_focus_minutes > 0) {
        totalFocusMinutes += session.actual_focus_minutes;
        longestSessionMinutes = Math.max(
          longestSessionMinutes,
          session.actual_focus_minutes
        );
        actuallyCompletedSessions++;

        // Update last session time for sessions with actual focus time
        if (
          session.end_time &&
          (!lastSessionAt ||
            new Date(session.end_time) > new Date(lastSessionAt))
        ) {
          lastSessionAt = session.end_time;
        }
      }
    });

    const averageSessionMinutes =
      actuallyCompletedSessions > 0
        ? Math.round(totalFocusMinutes / actuallyCompletedSessions)
        : 0;

    // Update or create stats
    const { data, error } = await supabase
      .from("user_stats")
      .upsert({
        uid,
        total_focus_minutes: totalFocusMinutes,
        total_sessions: allSessions.length,
        completed_sessions: actuallyCompletedSessions,
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
      `Recalculated stats for user ${uid}: ${totalFocusMinutes} total minutes, ${actuallyCompletedSessions}/${allSessions.length} completed sessions (${completedSessions.length} marked as completed, only ${actuallyCompletedSessions} with actual focus time)`
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

/**
 * Get weekly focus statistics for the last 7 days
 * This function reads session data for weekly chart but uses user_stats for averages
 */
export async function getWeeklyStatsFromUserStats(uid: string): Promise<
  DatabaseResult<{
    weeklyFocus: number[]; // Array of 7 numbers (minutes per day, Mon-Sun)
    avgSessionLength: number;
    completionRate: number;
  }>
> {
  try {
    // Get user stats for averages
    const statsResult = await getUserStatsRecord(uid);

    if (!statsResult.success) {
      return {
        success: false,
        error: statsResult.error,
      };
    }

    const stats = statsResult.data;

    // Calculate completion rate and average from user_stats
    const completionRate =
      stats && stats.total_sessions > 0
        ? Math.round((stats.completed_sessions / stats.total_sessions) * 100)
        : 0;

    const avgSessionLength = stats ? stats.average_session_minutes : 0;

    // Get sessions from the last 7 days for the weekly chart
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // Include today, so -6 for 7 days total
    sevenDaysAgo.setHours(0, 0, 0, 0); // Start of day

    const { data: sessions, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("uid", uid)
      .eq("status", "completed")
      .gte("created_at", sevenDaysAgo.toISOString());

    if (error) {
      console.error("Error fetching weekly sessions:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    // Initialize weekly focus array (Mon-Sun)
    const weeklyFocus = [0, 0, 0, 0, 0, 0, 0];

    sessions.forEach((session) => {
      const sessionDate = new Date(session.created_at);
      // Convert to Monday=0, Tuesday=1, ..., Sunday=6
      const dayOfWeek = (sessionDate.getDay() + 6) % 7;

      // Use actual_focus_minutes for completed sessions only
      const duration = session.actual_focus_minutes || 0;

      // Only count positive durations
      if (duration > 0) {
        weeklyFocus[dayOfWeek] += duration;
      }
    });

    return {
      success: true,
      data: {
        weeklyFocus,
        avgSessionLength,
        completionRate,
      },
    };
  } catch (error) {
    console.error("Unexpected error calculating weekly stats:", error);
    return {
      success: false,
      error: "Failed to calculate weekly statistics",
    };
  }
}

/**
 * Set actual_focus_minutes for a session before completion
 * This ensures the session has the proper focus time recorded
 */
export async function setSessionActualFocusMinutes(
  sessionId: string,
  actualFocusMinutes: number
): Promise<DatabaseResult<Session>> {
  try {
    if (actualFocusMinutes < 0) {
      return {
        success: false,
        error: "Actual focus minutes cannot be negative",
      };
    }

    const { data, error } = await supabase
      .from("sessions")
      .update({
        actual_focus_minutes: actualFocusMinutes,
      })
      .eq("id", sessionId)
      .select()
      .single();

    if (error) {
      console.error("Error setting actual focus minutes:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log(
      `Set actual_focus_minutes to ${actualFocusMinutes} for session ${sessionId}`
    );

    return {
      success: true,
      data: data as Session,
    };
  } catch (error) {
    console.error("Unexpected error setting actual focus minutes:", error);
    return {
      success: false,
      error: "Failed to set actual focus minutes",
    };
  }
}

/**
 * Validate data integrity for user stats
 * Checks if user_stats accurately reflects the sessions data
 */
export async function validateUserStatsIntegrity(uid: string): Promise<
  DatabaseResult<{
    isValid: boolean;
    issues: string[];
    expectedStats: {
      totalSessions: number;
      completedSessions: number;
      totalFocusMinutes: number;
      longestSession: number;
      averageSession: number;
    };
    actualStats: UserStats;
  }>
> {
  try {
    // Get current user stats
    const statsResult = await getUserStatsRecord(uid);
    if (!statsResult.success || !statsResult.data) {
      return {
        success: false,
        error: "User stats not found",
      };
    }

    const actualStats = statsResult.data;

    // Get all sessions for validation
    const { data: sessions, error: sessionsError } = await supabase
      .from("sessions")
      .select("*")
      .eq("uid", uid);

    if (sessionsError) {
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

    // Calculate expected stats using ONLY actual_focus_minutes
    let expectedTotalFocusMinutes = 0;
    let expectedCompletedSessions = 0;
    let expectedLongestSession = 0;

    completedSessions.forEach((session) => {
      if (session.actual_focus_minutes > 0) {
        expectedTotalFocusMinutes += session.actual_focus_minutes;
        expectedCompletedSessions++;
        expectedLongestSession = Math.max(
          expectedLongestSession,
          session.actual_focus_minutes
        );
      }
    });

    const expectedAverageSession =
      expectedCompletedSessions > 0
        ? Math.round(expectedTotalFocusMinutes / expectedCompletedSessions)
        : 0;

    const expectedStats = {
      totalSessions: allSessions.length,
      completedSessions: expectedCompletedSessions,
      totalFocusMinutes: expectedTotalFocusMinutes,
      longestSession: expectedLongestSession,
      averageSession: expectedAverageSession,
    };

    // Check for discrepancies
    const issues: string[] = [];

    if (actualStats.total_sessions !== expectedStats.totalSessions) {
      issues.push(
        `Total sessions mismatch: expected ${expectedStats.totalSessions}, got ${actualStats.total_sessions}`
      );
    }

    if (actualStats.completed_sessions !== expectedStats.completedSessions) {
      issues.push(
        `Completed sessions mismatch: expected ${expectedStats.completedSessions}, got ${actualStats.completed_sessions}`
      );
    }

    if (actualStats.total_focus_minutes !== expectedStats.totalFocusMinutes) {
      issues.push(
        `Total focus minutes mismatch: expected ${expectedStats.totalFocusMinutes}, got ${actualStats.total_focus_minutes}`
      );
    }

    if (actualStats.longest_session_minutes !== expectedStats.longestSession) {
      issues.push(
        `Longest session mismatch: expected ${expectedStats.longestSession}, got ${actualStats.longest_session_minutes}`
      );
    }

    if (actualStats.average_session_minutes !== expectedStats.averageSession) {
      issues.push(
        `Average session mismatch: expected ${expectedStats.averageSession}, got ${actualStats.average_session_minutes}`
      );
    }

    if (actualStats.cancelled_sessions !== cancelledSessions.length) {
      issues.push(
        `Cancelled sessions mismatch: expected ${cancelledSessions.length}, got ${actualStats.cancelled_sessions}`
      );
    }

    return {
      success: true,
      data: {
        isValid: issues.length === 0,
        issues,
        expectedStats,
        actualStats,
      },
    };
  } catch (error) {
    console.error("Unexpected error validating user stats integrity:", error);
    return {
      success: false,
      error: "Failed to validate user stats integrity",
    };
  }
}
