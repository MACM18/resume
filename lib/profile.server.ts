import { db } from "./db";
import { getEffectiveDomain } from "./utils";
import { Profile, HomePageData, AboutPageData, Theme } from "@/types/portfolio";

// Transform Prisma profile to frontend Profile type
function transformProfile(prismaProfile: {
  id: string;
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  tagline: string;
  domain: string | null;
  homePageData: unknown;
  aboutPageData: unknown;
  activeResumeRole: string | null;
  theme: unknown;
  backgroundImageUrl: string | null;
  faviconUrl: string | null;
  contactNumbers: unknown;
  createdAt: Date;
  updatedAt: Date;
}): Profile {
  return {
    id: prismaProfile.id,
    user_id: prismaProfile.userId,
    full_name: prismaProfile.fullName,
    avatar_url: prismaProfile.avatarUrl,
    tagline: prismaProfile.tagline,
    domain: prismaProfile.domain,
    home_page_data: prismaProfile.homePageData as HomePageData,
    about_page_data: prismaProfile.aboutPageData as AboutPageData,
    active_resume_role: prismaProfile.activeResumeRole,
    theme: prismaProfile.theme as Theme | null,
    background_image_url: prismaProfile.backgroundImageUrl,
    favicon_url: prismaProfile.faviconUrl,
    contact_numbers: prismaProfile.contactNumbers as Profile["contact_numbers"],
    updated_at: prismaProfile.updatedAt.toISOString(),
  };
}

export async function getProfileDataServer(domain?: string) {
  const effectiveDomain = getEffectiveDomain(domain || "");
  if (!effectiveDomain) return null;

  try {
    const profile = await db.profile.findFirst({
      where: { domain: effectiveDomain },
      select: {
        fullName: true,
        tagline: true,
        homePageData: true,
        aboutPageData: true,
        avatarUrl: true,
        backgroundImageUrl: true,
        faviconUrl: true,
        contactNumbers: true,
      },
    });

    if (!profile) {
      return null;
    }

    // Transform to match frontend expectations
    return {
      full_name: profile.fullName,
      tagline: profile.tagline,
      home_page_data: profile.homePageData as unknown as HomePageData,
      about_page_data: profile.aboutPageData as unknown as AboutPageData,
      avatar_url: profile.avatarUrl,
      background_image_url: profile.backgroundImageUrl,
      favicon_url: profile.faviconUrl,
      contact_numbers: profile.contactNumbers,
    };
  } catch (error) {
    console.error("Error fetching profile data (server):", error);
    return null;
  }
}

export async function getProfileByUserId(userId: string): Promise<Profile | null> {
  try {
    const profile = await db.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return null;
    }

    return transformProfile(profile);
  } catch (error) {
    console.error("Error fetching profile by user ID:", error);
    return null;
  }
}

export async function getThemeDataServer(domain?: string) {
  const effectiveDomain = getEffectiveDomain(domain || "");
  if (!effectiveDomain) return null;

  try {
    const profile = await db.profile.findFirst({
      where: { domain: effectiveDomain },
      select: {
        theme: true,
        backgroundImageUrl: true,
      },
    });

    if (!profile) {
      return null;
    }

    return {
      theme: profile.theme as Theme | null,
      background_image_url: profile.backgroundImageUrl,
    };
  } catch (error) {
    console.error("Error fetching theme data (server):", error);
    return null;
  }
}
