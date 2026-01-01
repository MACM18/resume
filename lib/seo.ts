import { Metadata } from "next";
import { Profile, Project } from "@/types/portfolio";

// Flexible profile type that works with both full Profile and client ProfileData
type ProfileLike =
  | Pick<
      Profile,
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
      return (
        /twitter|\bx\b/.test(token) &&
        (l.href.includes("twitter.com") || l.href.includes("x.com"))
      );
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
    defaultTitle: profile?.full_name
      ? `${profile.full_name} - ${profile.tagline}`
      : DEFAULT_SEO.defaultTitle,
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

  const title = profile?.full_name || config.defaultTitle;
  const description =
    profile?.tagline ||
    profile?.home_page_data?.callToAction?.description ||
    config.defaultDescription;

  // Generate OG image URL if we have an avatar and origin
  const ogImageUrl = profile?.avatar_url && origin
    ? `${origin}/api/og/avatar?url=${encodeURIComponent(profile.avatar_url)}`
    : config.defaultImage;

  const base: Metadata = {
    title,
    description,
    keywords: [
      "software developer",
      "portfolio",
      "web development",
      "full stack",
      profile?.full_name,
      ...(profile?.home_page_data?.technicalExpertise?.flatMap(
        (cat) => cat.skills
      ) || []),
    ]
      .filter(Boolean)
      .join(", "),
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

  const title = profile?.full_name ? `About ${profile.full_name}` : "About Me";
  const description =
    profile?.about_page_data?.subtitle ||
    profile?.tagline ||
    config.defaultDescription;

  // Generate OG image URL if we have an avatar and origin
  const ogImageUrl = profile?.avatar_url && origin
    ? `${origin}/api/og/avatar?url=${encodeURIComponent(profile.avatar_url)}`
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

export function generateProjectsMetadata(
  profile: ProfileLike,
  hostname?: string,
  origin?: string
): Metadata {
  const config = getBaseMetadata(profile, hostname);

  const title = profile?.full_name
    ? `Projects by ${profile.full_name}`
    : "Projects";
  const description = `Explore the portfolio of projects showcasing expertise in modern web development, software engineering, and innovative solutions.`;

  // Generate OG image URL if we have an avatar and origin
  const ogImageUrl = profile?.avatar_url && origin
    ? `${origin}/api/og/avatar?url=${encodeURIComponent(profile.avatar_url)}`
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

  const title = `${project.title} - ${config.siteName}`;
  const description = project.description || project.long_description;

  // Generate OG image URL if we have an avatar and origin (for fallback)
  const fallbackImageUrl = profile?.avatar_url && origin
    ? `${origin}/api/og/avatar?url=${encodeURIComponent(profile.avatar_url)}`
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

  const title = profile?.full_name ? `Resume - ${profile.full_name}` : "Resume";
  const description =
    profile?.tagline ||
    "Professional resume showcasing experience, skills, and qualifications.";

  // Generate OG image URL if we have an avatar and origin
  const ogImageUrl = profile?.avatar_url && origin
    ? `${origin}/api/og/avatar?url=${encodeURIComponent(profile.avatar_url)}`
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
