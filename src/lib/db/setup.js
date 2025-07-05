#!/usr/bin/env node

/**
 * Database migration script for FocusBee
 * This script helps set up the database schema in Supabase
 */

const fs = require("fs");
const path = require("path");

function readSchemaFile() {
  const schemaPath = path.join(__dirname, "schema.sql");

  if (!fs.existsSync(schemaPath)) {
    console.error("❌ Schema file not found:", schemaPath);
    process.exit(1);
  }

  return fs.readFileSync(schemaPath, "utf8");
}

function displayInstructions() {
  const schema = readSchemaFile();

  console.log("🐝 FocusBee Database Setup Instructions");
  console.log("=====================================\n");

  console.log("1. Go to your Supabase project dashboard");
  console.log("2. Navigate to the SQL Editor");
  console.log("3. Copy and paste the following SQL schema:\n");

  console.log("--- COPY FROM HERE ---");
  console.log(schema);
  console.log("--- COPY TO HERE ---\n");

  console.log('4. Click "Run" to execute the schema');
  console.log("5. Verify the tables were created in the Table Editor");
  console.log("6. Set up your environment variables in .env.local\n");

  console.log("Environment variables needed:");
  console.log("- NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co");
  console.log("- NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key");
  console.log(
    "\n✅ You can find these in your Supabase project settings under API"
  );
}

if (require.main === module) {
  displayInstructions();
}
