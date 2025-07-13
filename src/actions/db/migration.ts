"use server";

import { supabase } from "@/lib/config/supabase";
import { recalculateUserStats } from "./userStats";

/**
 * Initialize user stats for all existing users who don't have stats records
 * This is useful for migrating existing users to the new stats system
 */
export async function initializeAllUserStats(): Promise<{
  success: boolean;
  processed: number;
  errors: string[];
}> {
  try {
    console.log("Starting user stats initialization...");

    // Get all users
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("uid");

    if (usersError) {
      console.error("Error fetching users:", usersError);
      return {
        success: false,
        processed: 0,
        errors: [usersError.message],
      };
    }

    // Get existing user stats
    const { data: existingStats, error: statsError } = await supabase
      .from("user_stats")
      .select("uid");

    if (statsError) {
      console.error("Error fetching existing stats:", statsError);
      return {
        success: false,
        processed: 0,
        errors: [statsError.message],
      };
    }

    const existingStatsUids = new Set(existingStats?.map((s) => s.uid) || []);
    const usersNeedingStats =
      users?.filter((user) => !existingStatsUids.has(user.uid)) || [];

    console.log(`Found ${users?.length || 0} total users`);
    console.log(`Found ${existingStats?.length || 0} existing stats records`);
    console.log(
      `Need to initialize stats for ${usersNeedingStats.length} users`
    );

    const errors: string[] = [];
    let processed = 0;

    // Process each user that needs stats
    for (const user of usersNeedingStats) {
      try {
        console.log(`Initializing stats for user: ${user.uid}`);
        const result = await recalculateUserStats(user.uid);

        if (result.success) {
          processed++;
          console.log(`✓ Initialized stats for user: ${user.uid}`);
        } else {
          errors.push(
            `Failed to initialize stats for ${user.uid}: ${result.error}`
          );
          console.error(
            `✗ Failed to initialize stats for user: ${user.uid}`,
            result.error
          );
        }
      } catch (error) {
        const errorMessage = `Unexpected error initializing stats for ${user.uid}: ${error}`;
        errors.push(errorMessage);
        console.error(errorMessage);
      }
    }

    const success = errors.length === 0;

    console.log(
      `Stats initialization complete: ${processed}/${usersNeedingStats.length} successful`
    );
    if (errors.length > 0) {
      console.log(`Errors encountered: ${errors.length}`);
      errors.forEach((error) => console.error(error));
    }

    return {
      success,
      processed,
      errors,
    };
  } catch (error) {
    console.error("Unexpected error during stats initialization:", error);
    return {
      success: false,
      processed: 0,
      errors: [`Unexpected error: ${error}`],
    };
  }
}

/**
 * Recalculate stats for all users
 * This is useful for fixing any inconsistencies in the stats data
 */
export async function recalculateAllUserStats(): Promise<{
  success: boolean;
  processed: number;
  errors: string[];
}> {
  try {
    console.log("Starting stats recalculation for all users...");

    // Get all users with stats
    const { data: userStats, error } = await supabase
      .from("user_stats")
      .select("uid");

    if (error) {
      console.error("Error fetching user stats:", error);
      return {
        success: false,
        processed: 0,
        errors: [error.message],
      };
    }

    const errors: string[] = [];
    let processed = 0;

    // Recalculate stats for each user
    for (const stats of userStats || []) {
      try {
        console.log(`Recalculating stats for user: ${stats.uid}`);
        const result = await recalculateUserStats(stats.uid);

        if (result.success) {
          processed++;
          console.log(`✓ Recalculated stats for user: ${stats.uid}`);
        } else {
          errors.push(
            `Failed to recalculate stats for ${stats.uid}: ${result.error}`
          );
          console.error(
            `✗ Failed to recalculate stats for user: ${stats.uid}`,
            result.error
          );
        }
      } catch (error) {
        const errorMessage = `Unexpected error recalculating stats for ${stats.uid}: ${error}`;
        errors.push(errorMessage);
        console.error(errorMessage);
      }
    }

    const success = errors.length === 0;

    console.log(
      `Stats recalculation complete: ${processed}/${
        userStats?.length || 0
      } successful`
    );
    if (errors.length > 0) {
      console.log(`Errors encountered: ${errors.length}`);
      errors.forEach((error) => console.error(error));
    }

    return {
      success,
      processed,
      errors,
    };
  } catch (error) {
    console.error("Unexpected error during stats recalculation:", error);
    return {
      success: false,
      processed: 0,
      errors: [`Unexpected error: ${error}`],
    };
  }
}
