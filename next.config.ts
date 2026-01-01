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
  output: "standalone",
  images: {
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
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
    minimumCacheTTL: 60 * 60 * 24 * 365, // Cache images for 1 year
  },
};

export default nextConfig;