#!/usr/bin/env node

/**
 * Data integrity migration script for FocusBee
 * This script fixes the data integrity issues by:
 * 1. Ensuring all sessions have proper actual_focus_minutes values
 * 2. Recalculating user_stats based on ONLY actual_focus_minutes
 * 3. Validating the integrity of the data
 */

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function migrateDataIntegrity() {
  console.log("🔧 Starting data integrity migration...");

  try {
    // Step 1: Get all sessions that need fixing
    const { data: sessions, error: sessionsError } = await supabase
      .from("sessions")
      .select("*")
      .eq("status", "completed")
      .is("actual_focus_minutes", null);

    if (sessionsError) {
      console.error("Error fetching sessions:", sessionsError);
      return;
    }

    console.log(
      `Found ${sessions.length} completed sessions without actual_focus_minutes`
    );

    // Step 2: Fix sessions with missing actual_focus_minutes
    // For this migration, we'll set actual_focus_minutes to 0 for these sessions
    // This ensures they don't count toward completion stats, which is the correct behavior
    for (const session of sessions) {
      const { error: updateError } = await supabase
        .from("sessions")
        .update({ actual_focus_minutes: 0 })
        .eq("id", session.id);

      if (updateError) {
        console.error(`Error updating session ${session.id}:`, updateError);
      } else {
        console.log(
          `✅ Set actual_focus_minutes to 0 for session ${session.id}`
        );
      }
    }

    // Step 3: Get all users and recalculate their stats
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("uid");

    if (usersError) {
      console.error("Error fetching users:", usersError);
      return;
    }

    console.log(`Recalculating stats for ${users.length} users...`);

    // Step 4: Recalculate stats for each user
    for (const user of users) {
      await recalculateUserStats(user.uid);
    }

    console.log("✅ Data integrity migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
  }
}

async function recalculateUserStats(uid) {
  try {
    // Get all sessions for the user
    const { data: sessions, error: sessionsError } = await supabase
      .from("sessions")
      .select("*")
      .eq("uid", uid);

    if (sessionsError) {
      console.error(`Error fetching sessions for user ${uid}:`, sessionsError);
      return;
    }

    const allSessions = sessions;
    const completedSessions = allSessions.filter(
      (s) => s.status === "completed"
    );
    const cancelledSessions = allSessions.filter(
      (s) => s.status === "cancelled"
    );

    // Calculate stats using ONLY actual_focus_minutes
    let totalFocusMinutes = 0;
    let longestSessionMinutes = 0;
    let lastSessionAt = null;
    let actuallyCompletedSessions = 0;

    completedSessions.forEach((session) => {
      if (session.actual_focus_minutes > 0) {
        totalFocusMinutes += session.actual_focus_minutes;
        longestSessionMinutes = Math.max(
          longestSessionMinutes,
          session.actual_focus_minutes
        );
        actuallyCompletedSessions++;

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

    // Update user stats
    const { error: updateError } = await supabase.from("user_stats").upsert({
      uid,
      total_focus_minutes: totalFocusMinutes,
      total_sessions: allSessions.length,
      completed_sessions: actuallyCompletedSessions,
      cancelled_sessions: cancelledSessions.length,
      last_session_at: lastSessionAt,
      longest_session_minutes: longestSessionMinutes,
      average_session_minutes: averageSessionMinutes,
      updated_at: new Date().toISOString(),
    });

    if (updateError) {
      console.error(`Error updating stats for user ${uid}:`, updateError);
    } else {
      console.log(
        `✅ Recalculated stats for user ${uid}: ${totalFocusMinutes} total minutes, ${actuallyCompletedSessions}/${allSessions.length} completed sessions`
      );
    }
  } catch (error) {
    console.error(`Error recalculating stats for user ${uid}:`, error);
  }
}

// Run the migration
migrateDataIntegrity();
