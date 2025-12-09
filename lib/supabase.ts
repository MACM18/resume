import { createClient } from "@supabase/supabase-js";

// Read from env vars to avoid hardcoding credentials.
// Next.js exposes variables prefixed with NEXT_PUBLIC_* to the browser.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Throwing here surfaces a clear error during startup/build
  throw new Error(
    "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Construct a public URL for a file in a Supabase storage bucket.
 * This is a manual implementation since getPublicUrl may not work 
 * correctly with self-hosted Supabase instances.
 * 
 * @param bucket - The storage bucket name
 * @param filePath - The path to the file within the bucket
 * @returns The full public URL to access the file
 */
export function getStoragePublicUrl(bucket: string, filePath: string): string {
  // Supabase storage public URL format: {supabaseUrl}/storage/v1/object/public/{bucket}/{filePath}
  const cleanUrl = (supabaseUrl || '').replace(/\/$/, ''); // Remove trailing slash if present
  return `${cleanUrl}/storage/v1/object/public/${bucket}/${filePath}`;
}
