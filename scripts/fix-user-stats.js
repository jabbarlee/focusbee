#!/usr/bin/env node

/**
 * Admin script to fix corrupted user stats data
 * This script will recalculate all user stats based on actual session data
 */

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Read the .env.local file to get Supabase credentials
const envPath = path.join(__dirname, "..", ".env.local");
if (!fs.existsSync(envPath)) {
  console.error("Error: .env.local file not found");
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, "utf8");
const envLines = envContent.split("\n");

let supabaseUrl = "";
let supabaseKey = "";

envLines.forEach((line) => {
  if (line.startsWith("NEXT_PUBLIC_SUPABASE_URL=")) {
    supabaseUrl = line.split("=")[1];
  } else if (line.startsWith("NEXT_PUBLIC_SUPABASE_ANON_KEY=")) {
    supabaseKey = line.split("=")[1];
  }
});

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: Missing Supabase URL or key in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function calculateSessionDuration(startTime, endTime) {
  if (!endTime) return 0;

  const start = new Date(startTime);
  const end = new Date(endTime);
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
}

async function recalculateUserStats(uid) {
  try {
    console.log(`\n=== Recalculating stats for user ${uid} ===`);

    // Get all sessions for the user
    const { data: sessions, error: sessionsError } = await supabase
      .from("sessions")
      .select("*")
      .eq("uid", uid);

    if (sessionsError) {
      console.error("Error fetching sessions:", sessionsError);
      return false;
    }

    const allSessions = sessions || [];
    const completedSessions = allSessions.filter(
      (s) => s.status === "completed"
    );
    const cancelledSessions = allSessions.filter(
      (s) => s.status === "cancelled"
    );

    console.log(
      `Found ${allSessions.length} total sessions, ${completedSessions.length} completed, ${cancelledSessions.length} cancelled`
    );

    // Calculate stats using actual focus time
    let totalFocusMinutes = 0;
    let longestSessionMinutes = 0;
    let lastSessionAt = null;
    let actuallyCompletedSessions = 0;

    completedSessions.forEach((session, index) => {
      console.log(
        `Session ${index + 1}: ID=${session.id}, actual_focus_minutes=${
          session.actual_focus_minutes
        }, start=${session.start_time}, end=${session.end_time}`
      );

      if (session.end_time) {
        // Use actual_focus_minutes if available, otherwise fallback to elapsed time
        const duration =
          session.actual_focus_minutes > 0
            ? session.actual_focus_minutes
            : calculateSessionDuration(session.start_time, session.end_time);

        console.log(`  - Duration: ${duration} minutes`);

        // Only count sessions with actual focus time > 0
        if (duration > 0) {
          totalFocusMinutes += duration;
          longestSessionMinutes = Math.max(longestSessionMinutes, duration);
          actuallyCompletedSessions++;
          console.log(`  - ✓ Counted toward stats`);
        } else {
          console.log(`  - ✗ Not counted (0 focus time)`);
        }

        if (
          !lastSessionAt ||
          new Date(session.end_time) > new Date(lastSessionAt)
        ) {
          lastSessionAt = session.end_time;
        }
      }
    });

    const averageSessionMinutes =
      actuallyCompletedSessions > 0
        ? Math.round(totalFocusMinutes / actuallyCompletedSessions)
        : 0;

    console.log(`\nCalculated stats:`);
    console.log(`- Total sessions: ${allSessions.length}`);
    console.log(`- Actually completed sessions: ${actuallyCompletedSessions}`);
    console.log(`- Total focus minutes: ${totalFocusMinutes}`);
    console.log(`- Longest session: ${longestSessionMinutes} minutes`);
    console.log(`- Average session: ${averageSessionMinutes} minutes`);
    console.log(`- Last session at: ${lastSessionAt}`);

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
      console.error("Error updating user stats:", error);
      return false;
    }

    console.log("✓ User stats updated successfully");
    return true;
  } catch (error) {
    console.error("Unexpected error recalculating user stats:", error);
    return false;
  }
}

async function main() {
  console.log("🔧 Starting user stats recalculation...");

  try {
    // Get all users with stats
    const { data: users, error: usersError } = await supabase
      .from("user_stats")
      .select("uid");

    if (usersError) {
      console.error("Error fetching users:", usersError);
      process.exit(1);
    }

    if (!users || users.length === 0) {
      console.log("No users found with stats records");
      process.exit(0);
    }

    console.log(`Found ${users.length} users with stats records`);

    let successCount = 0;
    let errorCount = 0;

    for (const user of users) {
      const success = await recalculateUserStats(user.uid);
      if (success) {
        successCount++;
      } else {
        errorCount++;
      }
    }

    console.log(`\n🎉 Recalculation complete!`);
    console.log(`✓ Successfully updated: ${successCount} users`);
    console.log(`✗ Errors: ${errorCount} users`);
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
