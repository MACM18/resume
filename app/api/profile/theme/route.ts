import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSiteOwnerId } from "@/lib/site-owner";

export const dynamic = "force-dynamic";

/**
 * GET /api/profile/theme?domain=example.com
 * Get the site owner's theme and background image
 */
export async function GET(request: NextRequest) {
  try {
    void request;
    const ownerId = await getSiteOwnerId();

    const profile = await db.profile.findFirst({
      where: { userId: ownerId ?? "" },
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
