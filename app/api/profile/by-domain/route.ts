import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { normalizeDomain } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * GET /api/profile/by-domain?domain=example.com
 * Get profile data for a specific domain (public)
 */
export async function GET(request: NextRequest) {
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
  } catch (error) {
    console.error("Error fetching profile by domain:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
