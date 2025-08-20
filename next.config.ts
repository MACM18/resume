import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        port: "",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "dxahjapyammwtsdmoeah.supabase.co", // Added Supabase storage domain
        port: "",
        pathname: "**",
      },
    ],
  },
};

export default nextConfig;