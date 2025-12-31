import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/profile/me
 * Get current user's profile
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await db.profile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Transform to frontend format
    return NextResponse.json({
      id: profile.id,
      user_id: profile.userId,
      full_name: profile.fullName,
      avatar_url: profile.avatarUrl,
      avatar_position: profile.avatarPosition,
      avatar_zoom: profile.avatarZoom,
      avatar_size: ((profile as unknown) as Record<string, unknown>)["avatarSize"] as number | undefined,
      tagline: profile.tagline,
      domain: profile.domain,
      home_page_data: profile.homePageData,
      about_page_data: profile.aboutPageData,
      active_resume_role: profile.activeResumeRole,
      theme: profile.theme,
      background_image_url: profile.backgroundImageUrl,
      favicon_url: profile.faviconUrl,
      contact_numbers: profile.contactNumbers,
      updated_at: profile.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("Error fetching current user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/profile/me
 * Update current user's profile
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Map frontend field names to Prisma field names
    const updateData: Record<string, unknown> = {};
    
    if (body.full_name !== undefined) updateData.fullName = body.full_name;
    if (body.tagline !== undefined) updateData.tagline = body.tagline;
    if (body.avatar_url !== undefined) updateData.avatarUrl = body.avatar_url;
    if (body.avatar_position !== undefined) updateData.avatarPosition = body.avatar_position;
    if (body.avatar_zoom !== undefined) updateData.avatarZoom = body.avatar_zoom;
    if (body.avatar_size !== undefined) updateData.avatarSize = body.avatar_size;
    if (body.domain !== undefined) updateData.domain = body.domain;
    if (body.home_page_data !== undefined) updateData.homePageData = body.home_page_data;
    if (body.about_page_data !== undefined) updateData.aboutPageData = body.about_page_data;
    if (body.active_resume_role !== undefined) updateData.activeResumeRole = body.active_resume_role;
    if (body.theme !== undefined) updateData.theme = body.theme;
    if (body.background_image_url !== undefined) updateData.backgroundImageUrl = body.background_image_url;
    if (body.favicon_url !== undefined) updateData.faviconUrl = body.favicon_url;
    if (body.contact_numbers !== undefined) updateData.contactNumbers = body.contact_numbers;

    const profile = await db.profile.update({
      where: { userId: session.user.id },
      data: updateData,
    });

    console.log("Profile updated successfully");

    // Transform to frontend format
    return NextResponse.json({
      id: profile.id,
      user_id: profile.userId,
      full_name: profile.fullName,
      avatar_url: profile.avatarUrl,
      avatar_position: profile.avatarPosition,
      avatar_zoom: profile.avatarZoom,
      avatar_size: ((profile as unknown) as Record<string, unknown>)["avatarSize"] as number | undefined,
      tagline: profile.tagline,
      domain: profile.domain,
      home_page_data: profile.homePageData,
      about_page_data: profile.aboutPageData,
      active_resume_role: profile.activeResumeRole,
      theme: profile.theme,
      background_image_url: profile.backgroundImageUrl,
      favicon_url: profile.faviconUrl,
      contact_numbers: profile.contactNumbers,
      updated_at: profile.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
