import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { normalizeDomain } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * GET /api/profile/theme?domain=example.com
 * Get theme and background image for a domain
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
        theme: true,
        backgroundImageUrl: true,
      },
    });

    if (!profile) {
      return NextResponse.json({
        theme: null,
        background_image_url: null,
      });
    }

    return NextResponse.json({
      theme: profile.theme,
      background_image_url: profile.backgroundImageUrl,
    });
  } catch (error) {
    console.error("Error fetching theme:", error);
    return NextResponse.json(
      { error: "Failed to fetch theme" },
      { status: 500 }
    );
  }
}
