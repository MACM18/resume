import type { NextConfig } from "next";

// For S3-compatible storage (MinIO, AWS S3, etc.), extract hostname from env var
const storageUrl =
  process.env.STORAGE_MAIN_DOMAIN ||
  process.env.NEXT_PUBLIC_STORAGE_MAIN_DOMAIN ||
  process.env.STORAGE_PUBLIC_URL ||
  process.env.STORAGE_ENDPOINT ||
  "";
let storageHostname = "";
try {
  if (storageUrl) {
    const parsed = storageUrl.startsWith("http://") || storageUrl.startsWith("https://")
      ? storageUrl
      : `https://${storageUrl}`;
    storageHostname = new URL(parsed).hostname;
  }
} catch {
  // Fallback if URL parsing fails
  storageHostname = storageUrl.replace(/^https?:\/\//, "").split("/")[0];
}

const nextConfig: NextConfig = {
  output: "standalone",
  // Keep rolling deployments and multiple self-hosted instances aligned.
  deploymentId: process.env.DEPLOYMENT_VERSION,
  images: {
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        port: "",
        pathname: "/**",
      },
      // Production storage & CDN domains
      {
        protocol: "https",
        hostname: "storage.macm.dev",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.macm.dev",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "storage.macm.lk",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.macm.lk",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "macm.dev",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "macm.lk",
        port: "",
        pathname: "/**",
      },
      // Cloudflare R2 bucket endpoints (e.g. <account_id>.r2.cloudflarestorage.com)
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "r2.cloudflarestorage.com",
        port: "",
        pathname: "/**",
      },
      // Dynamic storage hostname from env (supports custom S3, MinIO, etc.)
      ...(storageHostname
        ? [
            {
              protocol: "https" as const,
              hostname: storageHostname,
              port: "",
              pathname: "/**",
            },
            {
              protocol: "http" as const,
              hostname: storageHostname,
              port: "",
              pathname: "/**",
            },
          ]
        : []),
    ],
    minimumCacheTTL: 60 * 60 * 24 * 365, // Cache images for 1 year
  },
};

export default nextConfig;
