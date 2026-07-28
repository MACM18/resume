import { db } from "./db";
import { getEffectiveDomain } from "./utils";
import { AboutPageData, HomePageData, Profile, Theme } from "@/types/portfolio";
import { z } from "zod";
import { safeAssetUrl } from "./remote-assets";

const socialLinkSchema = z.object({
  platform: z.string().default(""),
  icon: z.string().default(""),
  href: z.string().default(""),
  label: z.string().default(""),
  display_label: z.string().optional(),
}).passthrough();

const homePageSchema = z.object({
  name: z.string().default(""),
  tagline: z.string().default(""),
  socialLinks: z.array(socialLinkSchema).default([]),
  experienceHighlights: z.array(z.record(z.string(), z.unknown())).default([]),
  technicalExpertise: z.array(z.object({ name: z.string().default(""), skills: z.array(z.string()).default([]) }).passthrough()).default([]),
  achievements: z.array(z.record(z.string(), z.unknown())).default([]),
  callToAction: z.object({
    title: z.string().default("Let's Connect"),
    description: z.string().default("I'm always open to discussing new opportunities."),
    email: z.string().default(""),
  }).passthrough().default({}),
  availability_status: z.object({ show: z.boolean().default(false), message: z.string().default("") }).optional(),
  about_card_description: z.string().optional(),
  projects_card_description: z.string().optional(),
  experience_card_description: z.string().optional(),
}).passthrough();

const aboutPageSchema = z.object({
  title: z.string().default("About Me"),
  subtitle: z.string().default("My Journey"),
  story: z.array(z.string()).default([]),
  skills: z.array(z.object({
    category: z.string().default(""),
    icon: z.string().default(""),
    items: z.array(z.string()).default([]),
  }).passthrough()).default([]),
  callToAction: z.object({
    title: z.string().default("Get in Touch"),
    description: z.string().default("Let's work together!"),
    email: z.string().default(""),
  }).passthrough().default({}),
}).passthrough();

function normalizedHomePageData(value: unknown, fallbackName: string): HomePageData {
  const result = homePageSchema.safeParse(value);
  if (result.success) return { ...result.data, name: result.data.name || fallbackName } as HomePageData;
  return {
    name: fallbackName,
    tagline: "Welcome to my portfolio",
    socialLinks: [],
    experienceHighlights: [],
    technicalExpertise: [],
    achievements: [],
    callToAction: { title: "Let's Connect", description: "I'm always open to discussing new opportunities.", email: "" },
  };
}

function normalizedAboutPageData(value: unknown): AboutPageData {
  const result = aboutPageSchema.safeParse(value);
  if (result.success) return result.data as AboutPageData;
  return {
    title: "About Me",
    subtitle: "My Journey",
    story: [],
    skills: [],
    callToAction: { title: "Get in Touch", description: "Let's work together!", email: "" },
  };
}

function normalizedTheme(value: unknown): Theme | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
  );
}

// Transform Prisma profile to frontend Profile type
function transformProfile(prismaProfile: {
  id: string;
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  avatarPosition: unknown;
  avatarZoom: number | null;
  tagline: string;
  domains?: { domain: string; isPrimary: boolean }[];
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
    avatar_url: safeAssetUrl(prismaProfile.avatarUrl) || null,
    avatar_position: prismaProfile.avatarPosition as
      | { x: number; y: number }
      | undefined,
    avatar_zoom: prismaProfile.avatarZoom || undefined,
    avatar_size:
      ((prismaProfile as unknown) as Record<string, unknown>)["avatarSize"] as
        | number
        | undefined || undefined,
    tagline: prismaProfile.tagline,
    domain: prismaProfile.domains?.find((d) => d.isPrimary)?.domain || prismaProfile.domains?.[0]?.domain || null,
    home_page_data: normalizedHomePageData(prismaProfile.homePageData, prismaProfile.fullName),
    about_page_data: normalizedAboutPageData(prismaProfile.aboutPageData),
    active_resume_role: prismaProfile.activeResumeRole,
    theme: normalizedTheme(prismaProfile.theme),
    background_image_url: safeAssetUrl(prismaProfile.backgroundImageUrl) || null,
    favicon_url: safeAssetUrl(prismaProfile.faviconUrl) || null,
    contact_numbers: prismaProfile.contactNumbers as Profile["contact_numbers"],
    updated_at: prismaProfile.updatedAt.toISOString(),
  };
}

export async function getProfileDataServer(domain?: string) {
  const effectiveDomain = getEffectiveDomain(domain || "");
  if (!effectiveDomain) return null;

  try {
    const profile = await db.profile.findFirst({
      where: { domains: { some: { domain: effectiveDomain } } },
      include: { domains: true },
    });

    if (!profile) {
      return null;
    }

    return transformProfile(profile);
  } catch (error) {
    console.error("Error fetching profile data (server):", error);
    return null;
  }
}

export async function getProfileByUserId(
  userId: string,
): Promise<Profile | null> {
  try {
    const profile = await db.profile.findUnique({
      where: { userId },
      include: { domains: true },
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
      where: { domains: { some: { domain: effectiveDomain } } },
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
export function getDefaultProfileData(
  email: string,
  fullName: string = "New User",
) {
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
