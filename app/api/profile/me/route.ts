import { getOwnerSession } from "@/lib/site-owner";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { extractStoragePath, resolveStorageUrl } from "@/lib/storage-urls";

export const dynamic = "force-dynamic";

/**
 * GET /api/profile/me
 * Get current user's profile
 */
export async function GET() {
  try {
    const session = await getOwnerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await db.profile.findUnique({
      where: { userId: session.user.id },
      include: { domains: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Transform to frontend format
    const p = profile as unknown as Record<string, unknown>;
    const sel = (p["selectedGradient"] as Record<string, unknown> | undefined) || undefined;

    return NextResponse.json({
      id: (p["id"] as string),
      user_id: (p["userId"] as string),
      full_name: (p["fullName"] as string),
      avatar_url: resolveStorageUrl(p["avatarUrl"] as string | null),
      avatar_position: p["avatarPosition"],
      avatar_zoom: (p["avatarZoom"] as number) || undefined,
      selected_gradient_id: (p["selectedGradientId"] as string) || undefined,
      selected_gradient_use_theme: (p["selectedGradientUseTheme"] as boolean) || undefined,
      selected_gradient: sel ? { id: String(sel["id"]), name: String(sel["name"]), preview_css: (sel["previewCss"] as string | null) } : undefined,
      avatar_size: (p["avatarSize"] as number) || undefined,
      tagline: (p["tagline"] as string),
      domain: (p["domains"] as {domain: string, isPrimary: boolean}[] | undefined)?.find(d => d.isPrimary)?.domain || (p["domains"] as {domain: string}[] | undefined)?.[0]?.domain || null,
      domains: p["domains"],
      home_page_data: p["homePageData"],
      about_page_data: p["aboutPageData"],
      active_resume_role: (p["activeResumeRole"] as string | null),
      theme: p["theme"],
      background_image_url: resolveStorageUrl(p["backgroundImageUrl"] as string | null),
      favicon_url: resolveStorageUrl(p["faviconUrl"] as string | null),
      contact_numbers: p["contactNumbers"],
      updated_at: (p["updatedAt"] as Date).toISOString(),
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
    const session = await getOwnerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Map frontend field names to Prisma field names
    const updateData: Record<string, unknown> = {};
    
    if (body.full_name !== undefined) updateData.fullName = body.full_name;
    if (body.tagline !== undefined) updateData.tagline = body.tagline;
    if (body.avatar_url !== undefined) updateData.avatarUrl = extractStoragePath(body.avatar_url);
    if (body.avatar_position !== undefined) updateData.avatarPosition = body.avatar_position;
    if (body.avatar_zoom !== undefined) updateData.avatarZoom = body.avatar_zoom;
    if (body.avatar_size !== undefined) updateData.avatarSize = body.avatar_size;
    if (body.domain !== undefined) {
      return NextResponse.json({ error: "Domain management is disabled" }, { status: 410 });
    }
    if (body.home_page_data !== undefined) updateData.homePageData = body.home_page_data;
    if (body.about_page_data !== undefined) updateData.aboutPageData = body.about_page_data;
    if (body.home_page_data_patch !== undefined || body.about_page_data_patch !== undefined) {
      const current = await db.profile.findUnique({
        where: { userId: session.user.id },
        select: { homePageData: true, aboutPageData: true },
      });
      if (!current) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
      const allowedHome = new Set(["socialLinks", "experienceHighlights", "technicalExpertise", "achievements", "availability_status", "about_card_description", "projects_card_description", "experience_card_description", "callToAction"]);
      const allowedAbout = new Set(["title", "subtitle", "story", "skills", "callToAction"]);
      const validPatch = (value: unknown, allowed: Set<string>) =>
        typeof value === "object" && value !== null && !Array.isArray(value) &&
        Object.keys(value).every((key) => allowed.has(key));
      if (body.home_page_data_patch !== undefined) {
        if (!validPatch(body.home_page_data_patch, allowedHome)) return NextResponse.json({ error: "Invalid home page section" }, { status: 400 });
        const existing = current.homePageData && typeof current.homePageData === "object" && !Array.isArray(current.homePageData) ? current.homePageData : {};
        updateData.homePageData = { ...existing, ...body.home_page_data_patch };
      }
      if (body.about_page_data_patch !== undefined) {
        if (!validPatch(body.about_page_data_patch, allowedAbout)) return NextResponse.json({ error: "Invalid about page section" }, { status: 400 });
        const existing = current.aboutPageData && typeof current.aboutPageData === "object" && !Array.isArray(current.aboutPageData) ? current.aboutPageData : {};
        updateData.aboutPageData = { ...existing, ...body.about_page_data_patch };
      }
    }
    if (body.active_resume_role !== undefined) updateData.activeResumeRole = body.active_resume_role;
    if (body.theme !== undefined) updateData.theme = body.theme;
    if (body.selected_gradient_id !== undefined) updateData.selectedGradientId = body.selected_gradient_id;
    if (body.selected_gradient_use_theme !== undefined) updateData.selectedGradientUseTheme = body.selected_gradient_use_theme;
    if (body.background_image_url !== undefined) updateData.backgroundImageUrl = extractStoragePath(body.background_image_url);
    if (body.favicon_url !== undefined) updateData.faviconUrl = extractStoragePath(body.favicon_url);
    if (body.contact_numbers !== undefined) updateData.contactNumbers = body.contact_numbers;

    const profile = await db.profile.update({
      where: { userId: session.user.id },
      data: updateData,
      include: { domains: true },
    });

    console.log("Profile updated successfully");

    // Transform to frontend format
    return NextResponse.json({
      id: profile.id,
      user_id: profile.userId,
      full_name: profile.fullName,
      avatar_url: resolveStorageUrl(profile.avatarUrl),
      avatar_position: profile.avatarPosition,
      avatar_zoom: profile.avatarZoom,
      avatar_size: ((profile as unknown) as Record<string, unknown>)["avatarSize"] as number | undefined,
      tagline: profile.tagline,
      domain: (profile as unknown as { domains: {domain: string, isPrimary: boolean}[] }).domains?.find(d => d.isPrimary)?.domain || (profile as unknown as { domains: {domain: string}[] }).domains?.[0]?.domain || null,
      domains: (profile as unknown as { domains: {domain: string, isPrimary: boolean}[] }).domains,
      home_page_data: profile.homePageData,
      about_page_data: profile.aboutPageData,
      active_resume_role: profile.activeResumeRole,
      theme: profile.theme,
      background_image_url: resolveStorageUrl(profile.backgroundImageUrl),
      favicon_url: resolveStorageUrl(profile.faviconUrl),
      contact_numbers: profile.contactNumbers,
      updated_at: profile.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "That domain is already claimed by another user" }, { status: 409 });
    }
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
