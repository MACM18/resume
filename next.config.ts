import type { NextConfig } from "next";

// For S3-compatible storage (MinIO, AWS S3, etc.), extract hostname from env var
const storageUrl = process.env.STORAGE_PUBLIC_URL || process.env.STORAGE_ENDPOINT || "";
let storageHostname = "";
try {
  if (storageUrl) {
    storageHostname = new URL(storageUrl).hostname;
  }
} catch {
  // Fallback if URL parsing fails
  storageHostname = storageUrl.replace(/^https?:\/\//, "").split("/")[0];
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
      // Dynamic storage hostname from env (supports S3, MinIO, etc.)
      ...(storageHostname
        ? [
            {
              protocol: "https" as const,
              hostname: storageHostname,
              port: "",
              pathname: "**",
            },
          ]
        : []),
      // Also support HTTP for local development
      ...(storageHostname
        ? [
            {
              protocol: "http" as const,
              hostname: storageHostname,
              port: "",
              pathname: "**",
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;