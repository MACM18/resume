import type { NextConfig } from "next";

// For self-hosted Supabase, extract hostname from env var
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
let supabaseHostname = "";
try {
  if (supabaseUrl) {
    supabaseHostname = new URL(supabaseUrl).hostname;
  }
} catch {
  // Fallback if URL parsing fails
  supabaseHostname = supabaseUrl.replace(/^https?:\/\//, "").split("/")[0];
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        port: "",
        pathname: "**",
      },
      // Dynamic Supabase hostname from env (supports self-hosted)
      ...(supabaseHostname
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHostname,
              port: "",
              pathname: "**",
            },
          ]
        : []),
      // Also support HTTP for local development
      ...(supabaseHostname
        ? [
            {
              protocol: "http" as const,
              hostname: supabaseHostname,
              port: "",
              pathname: "**",
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;