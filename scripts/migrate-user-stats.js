#!/usr/bin/env node

/**
 * Database Migration Script for User Stats
 *
 * This script helps initialize the user stats system for existing users.
 * Run this after deploying the new user stats feature.
 *
 * Usage:
 *   node scripts/migrate-user-stats.js
 *
 * Or add to package.json scripts:
 *   "migrate:user-stats": "node scripts/migrate-user-stats.js"
 */

const {
  initializeAllUserStats,
  recalculateAllUserStats,
} = require("../src/actions/db/migration");

async function main() {
  console.log("🐝 FocusBee User Stats Migration");
  console.log("================================");

  const args = process.argv.slice(2);
  const command = args[0] || "init";

  try {
    switch (command) {
      case "init":
      case "initialize":
        console.log(
          "Initializing user stats for users without stats records...\n"
        );
        const initResult = await initializeAllUserStats();

        if (initResult.success) {
          console.log(
            `\n✅ Successfully initialized stats for ${initResult.processed} users`
          );
        } else {
          console.log(`\n❌ Initialization completed with errors:`);
          console.log(`   - Processed: ${initResult.processed} users`);
          console.log(`   - Errors: ${initResult.errors.length}`);
          initResult.errors.forEach((error) => console.log(`     • ${error}`));
        }
        break;

      case "recalculate":
      case "fix":
        console.log("Recalculating stats for all users...\n");
        const recalcResult = await recalculateAllUserStats();

        if (recalcResult.success) {
          console.log(
            `\n✅ Successfully recalculated stats for ${recalcResult.processed} users`
          );
        } else {
          console.log(`\n❌ Recalculation completed with errors:`);
          console.log(`   - Processed: ${recalcResult.processed} users`);
          console.log(`   - Errors: ${recalcResult.errors.length}`);
          recalcResult.errors.forEach((error) =>
            console.log(`     • ${error}`)
          );
        }
        break;

      default:
        console.log("Available commands:");
        console.log(
          "  init, initialize  - Initialize stats for users without stats records"
        );
        console.log("  recalculate, fix  - Recalculate stats for all users");
        console.log("\nUsage:");
        console.log("  node scripts/migrate-user-stats.js [command]");
        process.exit(1);
    }

    console.log("\n🎉 Migration completed!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Migration failed with error:", error);
    process.exit(1);
  }
}

// Run the migration
main();
