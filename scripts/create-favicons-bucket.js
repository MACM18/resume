/**
 * Script to create a 'favicons' storage bucket in Supabase.
 *
 * Usage:
 * 1. Install dependency: npm install @supabase/supabase-js
 * 2. Set environment variables in your shell:
 *    export SUPABASE_URL=https://<project>.supabase.co
 *    export SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
 * 3. Run: node scripts/create-favicons-bucket.js
 *
 * This script requires a Service Role key because bucket creation is an admin action.
 */

const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables."
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

async function main() {
  const bucketName = "favicons";
  try {
    const { data, error } = await supabase.storage.createBucket(bucketName, {
      public: true,
    });
    if (error) {
      // If bucket already exists, the API may return an error
      console.error("Error creating bucket:", error.message || error);
      process.exit(1);
    }
    console.log("Bucket created:", data);
  } catch (err) {
    console.error("Unexpected error creating bucket:", err);
    process.exit(1);
  }
}

main();
