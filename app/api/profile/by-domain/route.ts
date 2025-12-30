import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { normalizeDomain } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * GET /api/profile/by-domain?domain=example.com
 * Get profile data for a specific domain (public)
 */
export async function GET(request: NextRequest) {
  // If DATABASE_URL is missing, avoid calling Prisma and return a helpful message
  if (!process.env.DATABASE_URL) {
    // In development, return a lightweight mock profile so the UI can render without a DB
    if (process.env.NODE_ENV !== "production") {
      const mockProfile = {
        full_name: "Dev User",
        tagline: "Local development",
        home_page_data: {
          name: "Dev User",
          tagline: "Local development",
          socialLinks: [],
          experienceHighlights: [],
          technicalExpertise: [],
          achievements: [],
          callToAction: { title: "Get in Touch", description: "Configure DATABASE_URL to enable real data", email: "" },
        },
        about_page_data: { title: "About", subtitle: "Local", story: ["No DB configured"], skills: [], callToAction: { title: "Contact", description: "Set DATABASE_URL to see real data", email: "" } },
        avatar_url: null,
        avatar_position: { x: 50, y: 50 },
        avatar_zoom: 100,
        background_image_url: null,
        favicon_url: null,
        contact_numbers: [],
      };
      return NextResponse.json(mockProfile);
    }

    return NextResponse.json(
      { error: "Database not configured. Set DATABASE_URL in your environment." },
      { status: 500 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get("domain");

    if (!domain) {
      return NextResponse.json({ error: "Domain is required" }, { status: 400 });
    }

    const normalizedDomain = normalizeDomain(domain);

    const profile = await db.profile.findFirst({
      where: { domain: normalizedDomain },
      select: {
        fullName: true,
        tagline: true,
        homePageData: true,
        aboutPageData: true,
        avatarUrl: true,
        avatarPosition: true,
        avatarZoom: true,
        backgroundImageUrl: true,
        faviconUrl: true,
        contactNumbers: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Transform to frontend format
    return NextResponse.json({
      full_name: profile.fullName,
      tagline: profile.tagline,
      home_page_data: profile.homePageData,
      about_page_data: profile.aboutPageData,
      avatar_url: profile.avatarUrl,
      avatar_position: profile.avatarPosition,
      avatar_zoom: profile.avatarZoom,
      background_image_url: profile.backgroundImageUrl,
      favicon_url: profile.faviconUrl,
      contact_numbers: profile.contactNumbers,
    });
  } catch (error: unknown) {
    console.error("Error fetching profile by domain:", error);

    const message = typeof error === "object" && error !== null && "message" in error ? String((error as { message?: unknown }).message) : String(error);
    const name = typeof error === "object" && error !== null && "name" in error ? String((error as { name?: unknown }).name) : "";

    // Common Prisma init message when DATABASE_URL is missing
    if (message.includes("Environment variable not found: DATABASE_URL") || name === "PrismaClientInitializationError") {
      return NextResponse.json(
        {
          error:
            "Database not configured. Set DATABASE_URL in your environment (e.g., .env.local) and apply migrations.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
