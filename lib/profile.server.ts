import { db } from "./db";
import { getEffectiveDomain } from "./utils";
import { Profile, HomePageData, AboutPageData, Theme } from "@/types/portfolio";

// Transform Prisma profile to frontend Profile type
function transformProfile(prismaProfile: {
  id: string;
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  avatarPosition: unknown;
  avatarZoom: number | null;
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
    avatar_position: prismaProfile.avatarPosition as { x: number; y: number } | undefined,
    avatar_zoom: prismaProfile.avatarZoom || undefined,
    avatar_size: ((prismaProfile as unknown) as Record<string, unknown>)["avatarSize"] as number | undefined || undefined,
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
      include: { selectedGradient: true }
    });

    if (!profile) {
      return null;
    }

    // Transform to match frontend expectations
    const p = profile as unknown as Record<string, unknown>;
    const sel = (p["selectedGradient"] as Record<string, unknown> | undefined) || undefined;

    return {
      full_name: (p["fullName"] as string) || "",
      tagline: (p["tagline"] as string) || "",
      home_page_data: p["homePageData"] as unknown as HomePageData,
      about_page_data: p["aboutPageData"] as unknown as AboutPageData,
      avatar_url: p["avatarUrl"] as string | null,
      avatar_position: p["avatarPosition"] as { x: number; y: number } | undefined,
      avatar_zoom: (p["avatarZoom"] as number) || undefined,
      selected_gradient_id: (p["selectedGradientId"] as string) || undefined,
      selected_gradient: sel ? { 
        id: String(sel["id"]), 
        name: String(sel["name"]), 
        angle: (sel["angle"] as number) || 135,
        intensity: String(sel["intensity"] || "subtle"),
        pattern: String(sel["pattern"] || "primary-accent"),
      } : undefined,
      avatar_size: (p["avatarSize"] as number) || undefined,
      background_image_url: p["backgroundImageUrl"] as string | null,
      favicon_url: p["faviconUrl"] as string | null,
      contact_numbers: p["contactNumbers"],
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

/**
 * Default profile data for new users (server-safe version)
 */
export function getDefaultProfileData(email: string, fullName: string = "New User") {
  return {
    fullName,
    tagline: "Welcome to my portfolio",
    homePageData: {
      name: fullName,
      tagline: "Welcome to my portfolio",
      socialLinks: [],
      experienceHighlights: [],
      technicalExpertise: [],
      achievements: [],
      callToAction: {
        title: "Let's Connect",
        description: "I'm always open to discussing new opportunities.",
        email: email,
      },
    } as HomePageData,
    aboutPageData: {
      title: "About Me",
      subtitle: "My Journey",
      story: ["Tell your story here..."],
      skills: [],
      callToAction: {
        title: "Get in Touch",
        description: "Let's work together!",
        email: email,
      },
    } as AboutPageData,
    theme: {
      primary: "221 83% 53%",
      "primary-glow": "221 83% 63%",
      "primary-muted": "221 83% 23%",
      "primary-foreground": "0 0% 100%",
      accent: "280 80% 50%",
      "accent-glow": "280 80% 60%",
    } as Theme,
    avatarSize: 320,
  };
}
