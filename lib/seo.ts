import { Metadata } from "next";
import { Profile, Project } from "@/types/portfolio";

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
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  defaultTitle: "Portfolio - Software Developer",
  defaultDescription:
    "Professional portfolio showcasing projects, experience, and technical expertise in software development.",
  defaultImage: "/og-image.svg",
  // twitterHandle intentionally blank; derived dynamically from social links (X)
};

function buildTitle(profile: ProfileLike, hostname?: string, origin?: string) {
  if (!profile) return DEFAULT_SEO.defaultTitle;
  const name = profile.full_name || DEFAULT_SEO.siteName;
  try {
    return `${name} | ${new URL(getConfiguredSiteUrl(origin, hostname)).hostname}`;
  } catch {
    return name;
  }
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function getConfiguredSiteUrl(
  origin?: string,
  hostname?: string
): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    try {
      return new URL(configured).origin.replace(/\/$/, "");
    } catch {
      return configured.replace(/\/$/, "");
    }
  }

  if (process.env.NODE_ENV !== "production") {
    if (origin) {
      try {
        return new URL(origin).origin.replace(/\/$/, "");
      } catch {
        return origin.replace(/\/$/, "");
      }
    }

    if (hostname) {
      const rawHost = hostname.trim();
      const hostOnly = rawHost.split("/")[0];
      const normalizedHost = hostOnly.split(":")[0].toLowerCase();
      const isLocalHost =
        normalizedHost === "localhost" ||
        normalizedHost === "127.0.0.1" ||
        normalizedHost === "::1";
      return `${isLocalHost ? "http" : "https"}://${hostOnly}`;
    }
  }

  return DEFAULT_SEO.siteUrl;
}

function canonicalUrl(path: string, hostname?: string, origin?: string): string {
  const base = getConfiguredSiteUrl(origin, hostname);
  return `${base.replace(/\/$/, "")}${path}`;
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
  hostname?: string,
  origin?: string
): SEOConfig {
  const siteUrl = getConfiguredSiteUrl(origin, hostname);

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
    defaultTitle: profile?.full_name ? buildTitle(profile, hostname, origin) : DEFAULT_SEO.defaultTitle,
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
  const config = getBaseMetadata(profile, hostname, origin);

  const title = profile ? `Home — ${buildTitle(profile, hostname, origin)}` : config.defaultTitle;
  const description = buildMetaDescription(profile);

  // Generate OG image URL if we have an avatar and origin
  const ogImageUrl = profile?.id
    ? `${config.siteUrl}/api/og/avatar?profileId=${encodeURIComponent(profile.id)}`
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
    alternates: { canonical: canonicalUrl("/", hostname, origin) },
    metadataBase: new URL(config.siteUrl),
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
  const config = getBaseMetadata(profile, hostname, origin);

  const title = profile?.full_name ? `About — ${buildTitle(profile, hostname, origin)}` : "About Me";
  const description =
    profile?.home_page_data?.about_card_description ||
    profile?.about_page_data?.subtitle ||
    profile?.tagline ||
    config.defaultDescription;

  // Generate OG image URL if we have an avatar and origin
  const ogImageUrl = profile?.id
    ? `${config.siteUrl}/api/og/avatar?profileId=${encodeURIComponent(profile.id)}`
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
    alternates: { canonical: canonicalUrl("/about", hostname, origin) },
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
  const config = getBaseMetadata(profile, hostname, origin);

  const title = profile?.full_name
    ? `Projects — ${buildTitle(profile, hostname, origin)}`
    : "Projects";
  const description = buildProjectsDescription(profile, projectTitles, currentRole);
  // Generate OG image URL if we have an avatar and origin
  const ogImageUrl = profile?.id
    ? `${config.siteUrl}/api/og/avatar?profileId=${encodeURIComponent(profile.id)}`
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
    alternates: { canonical: canonicalUrl("/projects", hostname, origin) },
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
  const config = getBaseMetadata(profile, hostname, origin);

  if (!project) {
    return {
      title: "Project Not Found",
      description: "The requested project could not be found.",
    };
  }

  const title = `${project.title} — ${buildTitle(profile, hostname, origin)}`;
  const description =
    project.description ||
    project.long_description;

  // Generate OG image URL if we have an avatar and origin (for fallback)
  const fallbackImageUrl = profile?.id
    ? `${config.siteUrl}/api/og/avatar?profileId=${encodeURIComponent(profile.id)}`
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
    alternates: { canonical: canonicalUrl(`/projects/${project.id}`, hostname, origin) },
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
  const config = getBaseMetadata(profile, hostname, origin);

  const title = profile?.full_name ? `Resume — ${buildTitle(profile, hostname, origin)}` : "Resume";
  const description =
    profile?.home_page_data?.about_card_description ||
    profile?.tagline ||
    "Professional resume showcasing experience, skills, and qualifications.";

  // Generate OG image URL if we have an avatar and origin
  const ogImageUrl = profile?.id
    ? `${config.siteUrl}/api/og/avatar?profileId=${encodeURIComponent(profile.id)}`
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
    alternates: { canonical: canonicalUrl("/resume", hostname, origin) },
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
  hostname?: string,
  origin?: string
) {
  const config = getBaseMetadata(profile, hostname, origin);

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

  const profilePageData = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: `${profile?.full_name || config.siteName} portfolio`,
    url: config.siteUrl,
    mainEntity: personData,
  };

  return {
    person: personData,
    website: websiteData,
    profilePage: profilePageData,
  };
}

export function generateProjectStructuredData(
  project: Project,
  profile: ProfileLike,
  hostname?: string,
  origin?: string,
) {
  const url = canonicalUrl(`/projects/${project.id}`, hostname, origin);
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.description || project.long_description,
    url,
    image: project.image ? [project.image] : undefined,
    keywords: project.tech,
    author: {
      "@type": "Person",
      name: profile?.full_name || "Developer",
      url: canonicalUrl("/", hostname, origin),
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: canonicalUrl("/", hostname, origin) },
        { "@type": "ListItem", position: 2, name: "Projects", item: canonicalUrl("/projects", hostname, origin) },
        { "@type": "ListItem", position: 3, name: project.title, item: url },
      ],
    },
  };
}
