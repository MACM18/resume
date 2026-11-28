import { getProjectsServer } from "@/lib/projects.server";
import { getProfileDataServer } from "@/lib/profile.server";
import { getConfiguredSiteUrl } from "@/lib/seo";
import type { Project } from "@/types/portfolio";

type PublicProject = { name: string; url: string; description: string; details?: string; technologies: string[]; featured: boolean; sourceUrl?: string; liveUrl?: string; image?: string };
export type AgentProfile = {
  name: string; title: string; summary: string; about: string[];
  skills: { category: string; items: string[] }[];
  socialLinks: { label: string; url: string }[];
  availability?: string; contact: { page: string; email?: string };
  pages: { label: string; url: string }[]; projects: PublicProject[]; updatedAt?: string;
};

function publicUrl(value: string | undefined, base?: string): string | undefined {
  if (!value) return undefined;
  try {
    const url = base ? new URL(value, base) : new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : undefined;
  } catch { return undefined; }
}
function clean(value: string | undefined, maxLength = 4000): string {
  return (value ?? "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}
function mapProject(project: Project, siteUrl: string): PublicProject {
  return {
    name: clean(project.title, 240), url: siteUrl + "/projects/" + encodeURIComponent(project.id),
    description: clean(project.description), details: clean(project.long_description) || undefined,
    technologies: project.tech.map((item) => clean(item, 80)).filter(Boolean).slice(0, 30),
    featured: project.featured, sourceUrl: publicUrl(project.github_url),
    liveUrl: publicUrl(project.demo_url), image: publicUrl(project.image, siteUrl),
  };
}
export async function getAgentProfile(domain?: string, origin?: string): Promise<AgentProfile | null> {
  const [profile, projects] = await Promise.all([getProfileDataServer(domain), getProjectsServer(domain ?? "")]);
  if (!profile) return null;
  const siteUrl = getConfiguredSiteUrl(origin, domain);
  const home = profile.home_page_data;
  const aboutData = profile.about_page_data;
  const skills = [
    ...(home?.technicalExpertise ?? []).map((group) => ({ category: group.name, items: group.skills })),
    ...(aboutData?.skills ?? []).map((group) => ({ category: group.category, items: group.items })),
  ].map((group) => ({
    category: clean(group.category, 100),
    items: Array.from(new Set(group.items.map((item) => clean(item, 80)).filter(Boolean))),
  })).filter((group) => group.category && group.items.length > 0);
  const candidateEmail = clean(home?.callToAction?.email || aboutData?.callToAction?.email, 254);
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidateEmail) ? candidateEmail : "";
  const socialLinks = (home?.socialLinks ?? []).flatMap((link) => {
    const url = publicUrl(link.href, siteUrl);
    return url ? [{ label: clean(link.display_label || link.label || link.platform, 100), url }] : [];
  }).slice(0, 30);
  return {
    name: clean(profile.full_name || home?.name || "Portfolio owner", 160),
    title: clean(profile.tagline || home?.tagline || profile.active_resume_role || "Software developer", 240),
    summary: clean(home?.about_card_description || aboutData?.subtitle || profile.tagline, 1000),
    about: (aboutData?.story ?? []).map((item) => clean(item)).filter(Boolean).slice(0, 20),
    skills, socialLinks,
    availability: home?.availability_status?.show ? clean(home.availability_status.message, 300) || undefined : undefined,
    contact: { page: siteUrl + "/contact", ...(email ? { email } : {}) },
    pages: [
      { label: "Home", url: siteUrl + "/" }, { label: "About", url: siteUrl + "/about" },
      { label: "Projects", url: siteUrl + "/projects" }, { label: "Resume", url: siteUrl + "/resume" },
      { label: "Contact", url: siteUrl + "/contact" },
    ],
    projects: projects.slice(0, 100).map((project) => mapProject(project, siteUrl)),
    updatedAt: profile.updated_at,
  };
}
