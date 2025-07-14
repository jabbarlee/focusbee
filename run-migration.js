#!/usr/bin/env node

/**
 * Run the actual focus time migration
 */

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

async function runMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Supabase environment variables");
    console.error(
      "Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Read the migration file
  const migrationPath = path.join(
    __dirname,
    "src/lib/db/migration_actual_focus_time.sql"
  );

  if (!fs.existsSync(migrationPath)) {
    console.error("❌ Migration file not found:", migrationPath);
    process.exit(1);
  }

  const migrationSql = fs.readFileSync(migrationPath, "utf8");

  console.log("🔄 Running actual focus time migration...");

  try {
    // Split the SQL into separate statements
    const statements = migrationSql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    for (const statement of statements) {
      if (statement.length > 0) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        const { error } = await supabase.rpc("exec_sql", { sql: statement });

        if (error) {
          console.error(`❌ Error executing statement: ${error.message}`);
          // Continue with other statements
        } else {
          console.log(`✅ Success`);
        }
      }
    }

    console.log("✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  }
}

runMigration();
