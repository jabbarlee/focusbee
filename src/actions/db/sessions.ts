"use server";

import { supabase } from "@/lib/config/supabase";
import { Session, FocusMode, SessionStatus } from "@/types/dbSchema";
import { DatabaseResult } from "./users";
import {
  updateStatsOnSessionCreate,
  updateStatsOnSessionComplete,
  updateStatsOnSessionCancel,
} from "./userStats";

export interface CreateSessionData {
  uid: string;
  focus_mode: FocusMode;
  start_time?: string; // Optional, defaults to now() in database
}

export interface UpdateSessionData {
  end_time?: string;
  status?: SessionStatus;
  focus_mode?: FocusMode;
  actual_focus_minutes?: number;
}

export interface SessionWithDuration extends Session {
  duration_minutes?: number;
}

/**
 * Create a new focus session
 */
export async function createSession(
  sessionData: CreateSessionData
): Promise<DatabaseResult<Session>> {
  try {
    console.log("Creating session with data:", sessionData); // Debug log

    const insertData: any = {
      uid: sessionData.uid,
      focus_mode: sessionData.focus_mode,
      status: "active" as SessionStatus,
    };

    // Only add start_time if provided, otherwise let database default to now()
    if (sessionData.start_time) {
      insertData.start_time = sessionData.start_time;
    }

    console.log("Inserting data into database:", insertData); // Debug log

    const { data, error } = await supabase
      .from("sessions")
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error("Error creating session:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log("Session created successfully:", data); // Debug log

    // Update user statistics
    await updateStatsOnSessionCreate(data.uid);

    return {
      success: true,
      data: data as Session,
    };
  } catch (error) {
    console.error("Unexpected error creating session:", error);
    return {
      success: false,
      error: "Failed to create session in database",
    };
  }
}

/**
 * Get session by ID
 */
export async function getSessionById(
  sessionId: string
): Promise<DatabaseResult<Session | null>> {
  try {
    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (error) {
      // Session not found
      if (error.code === "PGRST116") {
        return {
          success: true,
          data: null,
        };
      }

      console.error("Error fetching session:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: data as Session,
    };
  } catch (error) {
    console.error("Unexpected error fetching session:", error);
    return {
      success: false,
      error: "Failed to fetch session from database",
    };
  }
}

/**
 * Get all sessions for a user
 */
export async function getUserSessions(
  uid: string,
  options?: {
    limit?: number;
    status?: SessionStatus;
    orderBy?: "created_at" | "start_time";
    order?: "asc" | "desc";
  }
): Promise<DatabaseResult<SessionWithDuration[]>> {
  try {
    let query = supabase.from("sessions").select("*").eq("uid", uid);

    // Apply filters
    if (options?.status) {
      query = query.eq("status", options.status);
    }

    // Apply ordering
    const orderBy = options?.orderBy || "created_at";
    const order = options?.order || "desc";
    query = query.order(orderBy, { ascending: order === "asc" });

    // Apply limit
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching user sessions:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    // Calculate duration for completed sessions
    const sessionsWithDuration: SessionWithDuration[] = (data as Session[]).map(
      (session) => {
        let duration_minutes: number | undefined;

        if (session.status === "completed") {
          // Use actual_focus_minutes if available, otherwise fallback to elapsed time
          if (session.actual_focus_minutes > 0) {
            duration_minutes = session.actual_focus_minutes;
          } else if (session.end_time && session.start_time) {
            // Fallback to elapsed time for older sessions
            const startTime = new Date(session.start_time);
            const endTime = new Date(session.end_time);
            duration_minutes = Math.round(
              (endTime.getTime() - startTime.getTime()) / (1000 * 60)
            );
          }
        } else if (session.end_time && session.start_time) {
          // For non-completed sessions, still use elapsed time
          const startTime = new Date(session.start_time);
          const endTime = new Date(session.end_time);
          duration_minutes = Math.round(
            (endTime.getTime() - startTime.getTime()) / (1000 * 60)
          );
        }

        return {
          ...session,
          duration_minutes,
        };
      }
    );

    return {
      success: true,
      data: sessionsWithDuration,
    };
  } catch (error) {
    console.error("Unexpected error fetching user sessions:", error);
    return {
      success: false,
      error: "Failed to fetch user sessions from database",
    };
  }
}

/**
 * Update session (typically to mark as completed or cancelled)
 */
export async function updateSession(
  sessionId: string,
  updates: UpdateSessionData
): Promise<DatabaseResult<Session>> {
  try {
    const updateData: any = { ...updates };

    // If ending the session without explicit end_time, set it to now
    if (
      updates.status &&
      ["completed", "cancelled"].includes(updates.status) &&
      !updates.end_time
    ) {
      updateData.end_time = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("sessions")
      .update(updateData)
      .eq("id", sessionId)
      .select()
      .single();

    if (error) {
      console.error("Error updating session:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    // Update user statistics based on status change
    if (updates.status === "completed") {
      await updateStatsOnSessionComplete(data as Session);
    } else if (updates.status === "cancelled") {
      await updateStatsOnSessionCancel(data.uid);
    }

    return {
      success: true,
      data: data as Session,
    };
  } catch (error) {
    console.error("Unexpected error updating session:", error);
    return {
      success: false,
      error: "Failed to update session in database",
    };
  }
}

/**
 * Complete a session
 */
export async function completeSession(
  sessionId: string,
  endTime?: string,
  actualFocusMinutes?: number
): Promise<DatabaseResult<Session>> {
  console.log("=== completeSession Debug ===");
  console.log("Completing session:", sessionId);
  console.log("End time:", endTime || "current time");
  console.log("Actual focus minutes:", actualFocusMinutes);

  const updateData: UpdateSessionData = {
    status: "completed",
    end_time: endTime || new Date().toISOString(),
  };

  if (actualFocusMinutes !== undefined) {
    updateData.actual_focus_minutes = actualFocusMinutes;
  }

  const result = await updateSession(sessionId, updateData);

  console.log("Complete session result:", result);
  console.log("=== End completeSession Debug ===");

  return result;
}

/**
 * Cancel a session
 */
export async function cancelSession(
  sessionId: string
): Promise<DatabaseResult<Session>> {
  return updateSession(sessionId, {
    status: "cancelled",
    end_time: new Date().toISOString(),
  });
}

/**
 * Get active session for a user (if any)
 */
export async function getActiveSession(
  uid: string
): Promise<DatabaseResult<Session | null>> {
  try {
    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("uid", uid)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // No active session found
      if (error.code === "PGRST116") {
        return {
          success: true,
          data: null,
        };
      }

      console.error("Error fetching active session:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: data as Session,
    };
  } catch (error) {
    console.error("Unexpected error fetching active session:", error);
    return {
      success: false,
      error: "Failed to fetch active session from database",
    };
  }
}

/**
 * Get user statistics
 */
export async function getUserStats(uid: string): Promise<
  DatabaseResult<{
    totalSessions: number;
    completedSessions: number;
    totalFocusTime: number; // in minutes
    streakDays: number;
    favoriteMode: FocusMode | null;
  }>
> {
  try {
    console.log("=== getUserStats Debug ===");
    console.log("Fetching stats for UID:", uid);

    // Get all sessions
    const { data: sessions, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("uid", uid);

    if (error) {
      console.error("Error fetching user stats:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log("Total sessions found:", sessions.length);
    console.log("Sessions data:", sessions);

    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(
      (s) => s.status === "completed"
    ).length;

    console.log("Completed sessions count:", completedSessions);

    // Calculate total focus time (only for completed sessions)
    let totalFocusTime = 0;
    const modeCount: Record<FocusMode, number> = {
      "quick-buzz": 0,
      "honey-flow": 0,
      "deep-nectar": 0,
    };

    sessions.forEach((session, index) => {
      console.log(`Session ${index + 1}:`, {
        id: session.id,
        status: session.status,
        start_time: session.start_time,
        end_time: session.end_time,
        focus_mode: session.focus_mode,
        actual_focus_minutes: session.actual_focus_minutes,
      });

      if (session.status === "completed") {
        // Use actual_focus_minutes if available, otherwise fallback to elapsed time calculation
        let duration = 0;
        if (session.actual_focus_minutes > 0) {
          duration = session.actual_focus_minutes;
          console.log(
            `Session ${session.id} actual focus time: ${duration} minutes`
          );
        } else if (session.start_time && session.end_time) {
          // Fallback to elapsed time for older sessions
          const startTime = new Date(session.start_time);
          const endTime = new Date(session.end_time);
          duration = Math.round(
            (endTime.getTime() - startTime.getTime()) / (1000 * 60)
          );
          console.log(
            `Session ${session.id} elapsed time (fallback): ${duration} minutes`
          );
        }

        totalFocusTime += duration;
      } else {
        console.log(`Session ${session.id} skipped - not completed`);
      }

      // Count focus modes
      if (session.focus_mode && session.focus_mode in modeCount) {
        modeCount[session.focus_mode as FocusMode]++;
      }
    });

    console.log("Total focus time calculated:", totalFocusTime, "minutes");

    // Find favorite mode
    let favoriteMode: FocusMode | null = null;
    let maxCount = 0;
    Object.entries(modeCount).forEach(([mode, count]) => {
      if (count > maxCount) {
        maxCount = count;
        favoriteMode = mode as FocusMode;
      }
    });

    // Calculate streak (simplified - consecutive days with sessions)
    const today = new Date();
    let streakDays = 0;
    const sessionDates = sessions
      .filter((s) => s.status === "completed")
      .map((s) => new Date(s.created_at).toDateString())
      .filter((date, index, arr) => arr.indexOf(date) === index)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    for (let i = 0; i < sessionDates.length; i++) {
      const sessionDate = new Date(sessionDates[i]);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);

      if (sessionDate.toDateString() === expectedDate.toDateString()) {
        streakDays++;
      } else {
        break;
      }
    }

    console.log("Final stats:", {
      totalSessions,
      completedSessions,
      totalFocusTime,
      streakDays,
      favoriteMode,
    });
    console.log("=== End getUserStats Debug ===");

    return {
      success: true,
      data: {
        totalSessions,
        completedSessions,
        totalFocusTime,
        streakDays,
        favoriteMode,
      },
    };
  } catch (error) {
    console.error("Unexpected error calculating user stats:", error);
    return {
      success: false,
      error: "Failed to calculate user statistics",
    };
  }
}

/**
 * Get weekly focus statistics for the last 7 days
 */
export async function getWeeklyStats(uid: string): Promise<
  DatabaseResult<{
    weeklyFocus: number[]; // Array of 7 numbers (minutes per day, Mon-Sun)
    avgSessionLength: number;
    completionRate: number;
  }>
> {
  try {
    // Get sessions from the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // Include today, so -6 for 7 days total
    sevenDaysAgo.setHours(0, 0, 0, 0); // Start of day

    const { data: sessions, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("uid", uid)
      .gte("created_at", sevenDaysAgo.toISOString());

    if (error) {
      console.error("Error fetching weekly stats:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    // Initialize weekly focus array (Mon-Sun)
    const weeklyFocus = [0, 0, 0, 0, 0, 0, 0];
    let totalSessionTime = 0;
    let completedSessionsCount = 0;
    const totalSessionsCount = sessions.length;

    sessions.forEach((session) => {
      const sessionDate = new Date(session.created_at);
      // Convert to Monday=0, Tuesday=1, ..., Sunday=6
      const dayOfWeek = (sessionDate.getDay() + 6) % 7;

      if (session.status === "completed") {
        // Use actual_focus_minutes if available, otherwise fallback to elapsed time calculation
        let duration = 0;
        if (session.actual_focus_minutes > 0) {
          duration = session.actual_focus_minutes;
        } else if (session.start_time && session.end_time) {
          // Fallback to elapsed time for older sessions
          const startTime = new Date(session.start_time);
          const endTime = new Date(session.end_time);
          duration = Math.round(
            (endTime.getTime() - startTime.getTime()) / (1000 * 60)
          );
        }

        // Only count positive durations
        if (duration > 0) {
          weeklyFocus[dayOfWeek] += duration;
          totalSessionTime += duration;
          completedSessionsCount++;
        }
      }
    });

    const avgSessionLength =
      completedSessionsCount > 0
        ? Math.round(totalSessionTime / completedSessionsCount)
        : 0;

    const completionRate =
      totalSessionsCount > 0
        ? Math.round((completedSessionsCount / totalSessionsCount) * 100)
        : 0;

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
 * Clean up orphaned active sessions for a user
 * This should be called when dashboard loads to ensure data integrity
 */
export async function cleanupOrphanedSessions(
  uid: string
): Promise<DatabaseResult<number>> {
  try {
    // Find active sessions older than 1 hour that are likely orphaned
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const { data, error } = await supabase
      .from("sessions")
      .update({
        status: "cancelled",
        end_time: new Date().toISOString(),
      })
      .eq("uid", uid)
      .eq("status", "active")
      .lt("created_at", oneHourAgo.toISOString())
      .select();

    if (error) {
      console.error("Error cleaning up orphaned sessions:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    const cleanedCount = data ? data.length : 0;
    if (cleanedCount > 0) {
      console.log(
        `Cleaned up ${cleanedCount} orphaned sessions for user ${uid}`
      );
    }

    return {
      success: true,
      data: cleanedCount,
    };
  } catch (error) {
    console.error("Unexpected error cleaning up orphaned sessions:", error);
    return {
      success: false,
      error: "Failed to cleanup orphaned sessions",
    };
  }
}
