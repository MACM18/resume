import { Metadata } from "next";
import { Profile, Project } from "@/types/portfolio";
import { hostname } from "os";

// Flexible profile type that works with both full Profile and client ProfileData
type ProfileLike =
  | Pick<
      Profile,
      | "id"
      | "full_name"
      | "tagline"
      | "avatar_url"
      | "home_page_data"
      | "about_page_data"
    >
  | Profile
  | null;

export interface SEOConfig {
  siteName: string;
  siteUrl: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultImage: string;
  twitterHandle?: string;
}

const DEFAULT_SEO: SEOConfig = {
  siteName: "Professional Portfolio",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://yoursite.com",
  defaultTitle: "Portfolio - Software Developer",
  defaultDescription:
    "Professional portfolio showcasing projects, experience, and technical expertise in software development.",
  defaultImage: "/og-image.png",
  // twitterHandle intentionally blank; derived dynamically from social links (X)
};

function buildTitle(profile: ProfileLike, hostname?: string) {
  if (!profile) return DEFAULT_SEO.defaultTitle;
  const name = profile.full_name || DEFAULT_SEO.siteName;
  const hostnameTag = hostname ? ` (${hostname})` : "";
  return `${name} | ${hostnameTag}`;
}

export function buildMetaDescription(profile: ProfileLike, maxLen = 255) {
  const name = profile?.full_name?.trim();
  const tagline = profile?.tagline?.trim();
  const about = profile?.home_page_data?.about_card_description?.trim();

  const namePart = name ? (tagline ? `${name} - ${tagline}` : name) : "";
  const parts = [namePart, about].filter(Boolean);
  const desc = parts.join(" — ").replace(/\s+/g, " ").trim();
  if (!desc) return DEFAULT_SEO.defaultDescription;
  if (desc.length <= maxLen) return desc;
  // Truncate cleanly at word boundary
  const truncated = desc.slice(0, maxLen).replace(/\s+\S*$/, "");
  return `${truncated}…`;
}

export function getBaseMetadata(
  profile: ProfileLike,
  hostname?: string
): SEOConfig {
  const siteUrl = hostname ? `https://${hostname}` : DEFAULT_SEO.siteUrl;

  // Attempt to derive X (Twitter) handle from social links
  let derivedHandle: string | undefined;
  type SocialLink = {
    platform: string;
    icon: string;
    href: string;
    label: string;
  };
  let links: SocialLink[] | undefined;
  if (profile && typeof profile === "object" && "home_page_data" in profile) {
    const hp: unknown = (profile as { home_page_data?: unknown })
      .home_page_data;
    if (hp && typeof hp === "object" && "socialLinks" in hp) {
      const maybeLinks = (hp as { socialLinks?: unknown }).socialLinks;
      if (Array.isArray(maybeLinks)) {
        links = maybeLinks.filter(
          (l): l is SocialLink =>
            typeof l === "object" &&
            !!l &&
            "platform" in l &&
            "icon" in l &&
            "href" in l &&
            "label" in l
        ) as SocialLink[];
      }
    }
  }
  if (links && links.length) {
    const xLink = links.find((l) => {
      const token = `${l.platform} ${l.icon} ${l.label}`.toLowerCase();
      if (!/twitter|\bx\b/.test(token)) {
        return false;
      }
      try {
        const url = new URL(l.href);
        const host = url.hostname.toLowerCase();
        const allowedHosts = [
          "twitter.com",
          "www.twitter.com",
          "x.com",
          "www.x.com",
        ];
        return allowedHosts.includes(host);
      } catch {
        // If the URL cannot be parsed, do not treat it as a valid X/Twitter link
        return false;
      }
    });
    if (xLink) {
      try {
        const url = new URL(xLink.href);
        // handle is first path segment
        const seg = url.pathname.replace(/^\//, "").split("/")[0];
        if (seg) derivedHandle = `@${seg}`;
      } catch {
        /* ignore URL parse errors */
      }
    }
  }

  return {
    siteName: profile?.full_name || DEFAULT_SEO.siteName,
    siteUrl,
    defaultTitle: profile?.full_name ? buildTitle(profile, hostname) : DEFAULT_SEO.defaultTitle,
    defaultDescription: profile?.tagline || DEFAULT_SEO.defaultDescription,
    defaultImage: profile?.avatar_url || DEFAULT_SEO.defaultImage,
    twitterHandle: derivedHandle,
  };
}

export function generateHomeMetadata(
  profile: ProfileLike,
  hostname?: string,
  origin?: string
): Metadata {
  const config = getBaseMetadata(profile, hostname);

  const title = profile ? `Home — ${buildTitle(profile, hostname)}` : config.defaultTitle;
  const description = buildMetaDescription(profile);

  // Generate OG image URL if we have an avatar and origin
  const ogImageUrl = profile?.id && origin
    ? `${origin}/api/og/avatar?profileId=${encodeURIComponent(profile.id)}`
    : config.defaultImage;

  const base: Metadata = {
    title,
    description,
    keywords: Array.from(
      new Set(
        [
          ...(profile?.full_name ? profile.full_name.split(/\s+/) : []),
          ...(profile?.home_page_data?.technicalExpertise?.flatMap(
            (cat) => cat.skills
          ) || []),
          ...(profile?.tagline ? profile.tagline.split("|").map((s) => s.trim()) : []),
        ].filter(Boolean)
      )
    ).join(", "),
    authors: [{ name: profile?.full_name || "Developer" }],
    creator: profile?.full_name || "Developer",
    openGraph: {
      type: "website",
      locale: "en_US",
      url: config.siteUrl,
      siteName: config.siteName,
      title,
      description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
  if (config.twitterHandle) {
    base.twitter = {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
      creator: config.twitterHandle,
    };
  }
  return base;
}

export function generateAboutMetadata(
  profile: ProfileLike,
  hostname?: string,
  origin?: string
): Metadata {
  const config = getBaseMetadata(profile, hostname);

  const title = profile?.full_name ? `About — ${buildTitle(profile, hostname)}` : "About Me";
  const description =
    profile?.home_page_data?.about_card_description ||
    profile?.about_page_data?.subtitle ||
    profile?.tagline ||
    config.defaultDescription;

  // Generate OG image URL if we have an avatar and origin
  const ogImageUrl = profile?.id && origin
    ? `${origin}/api/og/avatar?profileId=${encodeURIComponent(profile.id)}`
    : config.defaultImage;

  const meta: Metadata = {
    title,
    description,
    openGraph: {
      type: "profile",
      url: `${config.siteUrl}/about`,
      title,
      description,
      images: [ogImageUrl],
    },
  };
  if (config.twitterHandle) {
    meta.twitter = {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    };
  }
  return meta;
}

export function buildProjectsDescription(
  profile: ProfileLike,
  projectTitles: string[] = [],
  currentRole?: string,
  maxLen = 255
) {
  const name = profile?.full_name?.trim();

  const projectsPart = projectTitles.length
    ? `Projects: ${projectTitles.slice(0, 6).join(", ")}${projectTitles.length > 6 ? ` +${projectTitles.length - 6} more` : ""}`
    : "";
  const rolePart = currentRole ? `Role: ${currentRole}` : "";

  const parts = [name, projectsPart, rolePart].filter(Boolean);
  const desc = parts.join(" — ").replace(/\s+/g, " ").trim();
  if (!desc) return DEFAULT_SEO.defaultDescription;
  if (desc.length <= maxLen) return desc;
  const truncated = desc.slice(0, maxLen).replace(/\s+\S*$/, "");
  return `${truncated}…`;
}

export function generateProjectsMetadata(
  profile: ProfileLike,
  hostname?: string,
  origin?: string,
  projectTitles: string[] = [],
  currentRole?: string
): Metadata {
  const config = getBaseMetadata(profile, hostname);

  const title = profile?.full_name
    ? `Projects — ${buildTitle(profile, hostname)}`
    : "Projects";
  const description = buildProjectsDescription(profile, projectTitles, currentRole);
  // Generate OG image URL if we have an avatar and origin
  const ogImageUrl = profile?.id && origin
    ? `${origin}/api/og/avatar?profileId=${encodeURIComponent(profile.id)}`
    : config.defaultImage;

  const meta: Metadata = {
    title,
    description,
    openGraph: {
      type: "website",
      url: `${config.siteUrl}/projects`,
      title,
      description,
      images: [ogImageUrl],
    },
  };
  if (config.twitterHandle) {
    meta.twitter = {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    };
  }
  return meta;
}

export function generateProjectMetadata(
  project: Project | null,
  profile: ProfileLike,
  hostname?: string,
  origin?: string
): Metadata {
  const config = getBaseMetadata(profile, hostname);

  if (!project) {
    return {
      title: "Project Not Found",
      description: "The requested project could not be found.",
    };
  }

  const title = `${project.title} — ${buildTitle(profile, hostname)}`;
  const description =
    project.description ||
    project.long_description;

  // Generate OG image URL if we have an avatar and origin (for fallback)
  const fallbackImageUrl = profile?.id && origin
    ? `${origin}/api/og/avatar?profileId=${encodeURIComponent(profile.id)}`
    : config.defaultImage;

  const meta: Metadata = {
    title,
    description,
    keywords: [...project.tech, "project", "portfolio"].join(", "),
    openGraph: {
      type: "article",
      url: `${config.siteUrl}/projects/${project.id}`,
      title: project.title,
      description,
      images: project.image
        ? [
            {
              url: project.image,
              width: 1200,
              height: 630,
              alt: project.title,
            },
          ]
        : [fallbackImageUrl],
      publishedTime: project.created_at,
    },
  };
  if (config.twitterHandle) {
    meta.twitter = {
      card: "summary_large_image",
      title: project.title,
      description,
      images: [project.image || fallbackImageUrl],
    };
  }
  return meta;
}

export function generateResumeMetadata(
  profile: ProfileLike,
  hostname?: string,
  origin?: string
): Metadata {
  const config = getBaseMetadata(profile, hostname);

  const title = profile?.full_name ? `Resume — ${buildTitle(profile, hostname)}` : "Resume";
  const description =
    profile?.home_page_data?.about_card_description ||
    profile?.tagline ||
    "Professional resume showcasing experience, skills, and qualifications.";

  // Generate OG image URL if we have an avatar and origin
  const ogImageUrl = profile?.id && origin
    ? `${origin}/api/og/avatar?profileId=${encodeURIComponent(profile.id)}`
    : config.defaultImage;

  const meta: Metadata = {
    title,
    description,
    openGraph: {
      type: "profile",
      url: `${config.siteUrl}/resume`,
      title,
      description,
      images: [ogImageUrl],
    },
  };
  if (config.twitterHandle) {
    meta.twitter = {
      card: "summary",
      title,
      description,
    };
  }
  return meta;
}

export function generateStructuredData(
  profile: ProfileLike,
  hostname?: string
) {
  const config = getBaseMetadata(profile, hostname);

  const personData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile?.full_name || config.siteName,
    jobTitle: profile?.tagline || "Software Developer",
    url: config.siteUrl,
    image: config.defaultImage,
    sameAs:
      profile?.home_page_data?.socialLinks?.map((link) => link.href) || [],
    description: profile?.about_page_data?.subtitle || profile?.tagline,
  };

  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: config.siteName,
    url: config.siteUrl,
    description: config.defaultDescription,
    author: {
      "@type": "Person",
      name: profile?.full_name || config.siteName,
    },
  };

  return {
    person: personData,
    website: websiteData,
  };
}
