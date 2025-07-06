"use server";

import { supabase } from "@/lib/config/supabase";
import { Session, FocusMode, SessionStatus } from "@/types/dbSchema";
import { DatabaseResult } from "./users";

export interface CreateSessionData {
  uid: string;
  focus_mode: FocusMode;
  start_time?: string; // Optional, defaults to now() in database
}

export interface UpdateSessionData {
  end_time?: string;
  status?: SessionStatus;
  focus_mode?: FocusMode;
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
    const insertData: any = {
      uid: sessionData.uid,
      focus_mode: sessionData.focus_mode,
      status: "active" as SessionStatus,
    };

    // Only add start_time if provided, otherwise let database default to now()
    if (sessionData.start_time) {
      insertData.start_time = sessionData.start_time;
    }

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

        if (session.end_time && session.start_time) {
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
  endTime?: string
): Promise<DatabaseResult<Session>> {
  return updateSession(sessionId, {
    status: "completed",
    end_time: endTime || new Date().toISOString(),
  });
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

    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(
      (s) => s.status === "completed"
    ).length;

    // Calculate total focus time (only for completed sessions)
    let totalFocusTime = 0;
    const modeCount: Record<FocusMode, number> = {
      "quick-buzz": 0,
      "honey-flow": 0,
      "deep-nectar": 0,
    };

    sessions.forEach((session) => {
      if (
        session.status === "completed" &&
        session.start_time &&
        session.end_time
      ) {
        const startTime = new Date(session.start_time);
        const endTime = new Date(session.end_time);
        const duration = Math.round(
          (endTime.getTime() - startTime.getTime()) / (1000 * 60)
        );
        totalFocusTime += duration;
      }

      // Count focus modes
      if (session.focus_mode && session.focus_mode in modeCount) {
        modeCount[session.focus_mode as FocusMode]++;
      }
    });

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
