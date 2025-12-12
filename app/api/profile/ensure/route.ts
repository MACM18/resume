import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getDefaultProfileData } from "@/lib/profile";

export const dynamic = "force-dynamic";

/**
 * POST /api/profile/ensure
 * Ensures the current user has a profile, creating one if needed
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const email = session.user.email || "";

    // Check if profile exists
    const existingProfile = await db.profile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      // Transform to frontend format
      return NextResponse.json({
        id: existingProfile.id,
        user_id: existingProfile.userId,
        full_name: existingProfile.fullName,
        avatar_url: existingProfile.avatarUrl,
        tagline: existingProfile.tagline,
        domain: existingProfile.domain,
        home_page_data: existingProfile.homePageData,
        about_page_data: existingProfile.aboutPageData,
        active_resume_role: existingProfile.activeResumeRole,
        theme: existingProfile.theme,
        background_image_url: existingProfile.backgroundImageUrl,
        favicon_url: existingProfile.faviconUrl,
        contact_numbers: existingProfile.contactNumbers,
        updated_at: existingProfile.updatedAt.toISOString(),
      });
    }

    // Create new profile
    const defaults = getDefaultProfileData(email);
    const newProfile = await db.profile.create({
      data: {
        userId,
        fullName: defaults.fullName,
        tagline: defaults.tagline,
        // Cast to JSON compatible type for Prisma
        homePageData: JSON.parse(JSON.stringify(defaults.homePageData)),
        aboutPageData: JSON.parse(JSON.stringify(defaults.aboutPageData)),
        theme: JSON.parse(JSON.stringify(defaults.theme)),
      },
    });

    console.log("Created new profile for user:", userId);

    return NextResponse.json({
      id: newProfile.id,
      user_id: newProfile.userId,
      full_name: newProfile.fullName,
      avatar_url: newProfile.avatarUrl,
      tagline: newProfile.tagline,
      domain: newProfile.domain,
      home_page_data: newProfile.homePageData,
      about_page_data: newProfile.aboutPageData,
      active_resume_role: newProfile.activeResumeRole,
      theme: newProfile.theme,
      background_image_url: newProfile.backgroundImageUrl,
      favicon_url: newProfile.faviconUrl,
      contact_numbers: newProfile.contactNumbers,
      updated_at: newProfile.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("Error ensuring user profile:", error);
    return NextResponse.json(
      { error: "Failed to ensure profile" },
      { status: 500 }
    );
  }
}
