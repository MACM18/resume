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
        avatar_size: 320,
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

    const profile = await db.profile.findFirst({ where: { domain: normalizedDomain } });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Transform to frontend format
    const p = profile as unknown as Record<string, unknown>;

    return NextResponse.json({
      full_name: (p["fullName"] as string) || "",
      tagline: (p["tagline"] as string) || "",
      home_page_data: p["homePageData"],
      about_page_data: p["aboutPageData"],
      avatar_url: p["avatarUrl"] as string | null,
      avatar_position: p["avatarPosition"],
      avatar_zoom: (p["avatarZoom"] as number) || undefined,
      avatar_size: (p["avatarSize"] as number) || undefined,
      background_image_url: p["backgroundImageUrl"] as string | null,
      favicon_url: p["faviconUrl"] as string | null,
      contact_numbers: p["contactNumbers"],
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
