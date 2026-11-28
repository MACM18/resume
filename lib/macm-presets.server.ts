import "server-only";
import { Prisma, type Profile } from "@prisma/client";
import { db } from "./db";
import { extractStoragePath } from "./storage-urls";
import { portfolioProjects } from "./portfolio-seed-data";
import { projectImageUrl } from "./project-images";

export const presetSections = ["profile", "home", "about", "projects", "work", "resumes", "theme", "gallery", "all"] as const;
export type PresetSection = (typeof presetSections)[number];
export type PresetMode = "fill" | "recommended";

const cdn = "https://cdn.macm.dev/portfolio-macm/";
const media = {
  avatar: `${cdn}profile-images/cmj8uwynb0000nj0jnkb3tk15/1766146396375.jpeg`,
  background: `${cdn}background-images/cmj8uwynb0000nj0jnkb3tk15/1767339300781.webp`,
  favicon: `${cdn}favicons/cmj8uwynb0000nj0jnkb3tk15/1786703371734.webp`,
  portfolio: `${cdn}project-images/cmj8uwynb0000nj0jnkb3tk15/1785893582791.webp`,
  nns: `${cdn}project-images/cmj8uwynb0000nj0jnkb3tk15/1768669234474.webp`,
  resume: `${cdn}resumes/cmj8uwynb0000nj0jnkb3tk15/Chathura-Madhushanka-Resume-Photo-1766147528797.pdf`,
};
const gallery = [
  ["1772963326296.webp", null], ["1772963338846.webp", null],
  ["1772963300428.webp", null], ["1772963183801.webp", null],
  ["1772939760650.webp", "Graduation"], ["1772938217791.webp", "Graduation"],
  ["1772938161570.webp", "Graduation"], ["1772909044458.webp", "Graduation"],
] as const;
const galleryBase = `${cdn}gallery-images/cmj8uwynb0000nj0jnkb3tk15/`;

const socialLinks = [
  { href: "https://github.com/MACM18", icon: "Fa.FaGithub", label: "GitHub", platform: "GitHub", display_label: "GitHub" },
  { href: "https://www.linkedin.com/in/chathura-m", icon: "Fa.FaLinkedinIn", label: "LinkedIn", platform: "LinkedIn", display_label: "LinkedIn" },
  { href: "https://x.com/chathur27358499", icon: "Bs.BsTwitterX", label: "X", platform: "X", display_label: "X" },
];
const recommendedHome = {
  name: "Chathura Madhushanka",
  tagline: "Full-Stack Software Engineer | Next.js • TypeScript • Laravel • PostgreSQL | Docker & Linux Infrastructure",
  socialLinks,
  experienceHighlights: [{
    title: "Professional experience", metric: "2+", subtitle: "Years in development",
    description: "From WordPress development to full-stack applications and production infrastructure.",
  }],
  technicalExpertise: [
    { name: "Application development", skills: ["Next.js", "TypeScript", "React", "Laravel"] },
    { name: "Data and integrations", skills: ["PostgreSQL", "Prisma", "Google APIs", "REST APIs"] },
    { name: "Homelab and VPS infrastructure", skills: ["Home lab", "Linux VPS", "Docker", "Docker Compose", "Dokploy", "CI/CD", "GitHub Actions"] },
    { name: "Mail and network services", skills: ["Self-hosted mail servers", "DNS", "Cloudflare", "TLS", "S3-compatible storage"] },
  ],
  achievements: [],
  callToAction: {
    title: "Let's build something useful",
    description: "Have a software project or engineering role in mind? Tell me what you are building and where you need help.",
    email: "chathura@macm.dev",
  },
  availability_status: { show: false, message: "Open to relevant opportunities" },
  about_card_description: "I build and operate web applications, from product features and data models to Docker deployments and Linux servers. My recent work includes management dashboards, automated workflows, and the infrastructure that runs them.",
  projects_card_description: "Selected applications and infrastructure projects, with the decisions behind each build.",
  experience_card_description: "A progression from WordPress development to full-stack engineering and production ownership.",
};
const recommendedAbout = {
  title: "About me",
  subtitle: "Full-stack engineering with hands-on infrastructure experience.",
  story: [
    "I am Chathura Madhushanka, a software engineer building web applications with Next.js, TypeScript, Laravel and PostgreSQL. My work spans product features, backend data models, integrations and deployment.",
    "I began with WordPress development and moved into full-stack applications at Altitude1. Alongside application work, I have built and maintained Docker-based services on Linux servers, including CI/CD and mail infrastructure for my projects.",
    "I enjoy understanding the complete path from a user's problem to a running system. The projects here show the architecture, trade-offs and operational work behind what I build.",
  ],
  skills: [
    { category: "Applications", icon: "Fa.FaCode", items: ["Next.js", "TypeScript", "React", "Laravel"] },
    { category: "Data and integrations", icon: "Fa.FaDatabase", items: ["PostgreSQL", "Prisma", "Google APIs"] },
    { category: "Homelab and VPS", icon: "Gi.GiCloudUpload", items: ["Home lab", "Linux VPS", "Docker", "Docker Compose", "Dokploy", "GitHub Actions"] },
    { category: "Mail and network services", icon: "Fa.FaServer", items: ["Self-hosted mail servers", "DNS", "Cloudflare", "TLS", "S3-compatible storage"] },
  ],
  callToAction: {
    title: "Let's talk about your project",
    description: "I am open to engineering roles and useful software projects. Send a note with the problem you are solving.",
    email: "chathura@macm.dev",
  },
};
const productionTheme: Record<string, string> = {
  "--card": "222 47% 11%", "--ring": "186 100% 69%", "--input": "222 40% 15%",
  "--muted": "222 40% 15%", "--accent": "221 92% 41%", "--border": "222 40% 20%",
  "--popover": "222 47% 11%", "--primary": "212 100% 48%", "--glass-bg": "212 100% 48%",
  "--secondary": "221 92% 41%", "--background": "0 0% 14%", "--foreground": "210 40% 98%",
  "--destructive": "0 84.2% 60.2%", "--glass-border": "212 100% 48%",
  "--card-foreground": "210 40% 98%", "--muted-foreground": "215 20.2% 65.1%",
  "--accent-foreground": "222 47% 7%", "--popover-foreground": "210 40% 98%",
  "--primary-foreground": "222 47% 7%", "--background-secondary": "222 47% 9%",
  "--secondary-foreground": "222 47% 7%", "--destructive-foreground": "210 40% 98%",
};

const projects = portfolioProjects;
const work = [
  { sourceId: "cmjy3vgf00001ln01ppjpj0q5", company: "Altitude1 Pvt Ltd", position: "Lead Web Application Developer", startDate: "2026-01-01", endDate: null, isCurrent: true },
  { sourceId: "clwork_001", company: "Altitude1 Pvt. Ltd", position: "Web Application Developer", startDate: "2025-04-01", endDate: "2026-01-01", isCurrent: false },
  { sourceId: "clwork_002", company: "Altitude1 Pvt. Ltd", position: "Associate Web Developer", startDate: "2024-09-01", endDate: "2024-11-01", isCurrent: false },
  { sourceId: "clwork_003", company: "Altitude1 Pvt. Ltd", position: "WordPress Developer", startDate: "2024-03-01", endDate: "2024-09-01", isCurrent: false },
] as const;
const resumeSummary = "Full-stack software engineer with experience building Next.js and Laravel applications backed by PostgreSQL. I work across application features, data integrations, Docker deployment and Linux infrastructure. My projects include management dashboards, automated workflows and self-hosted services.";
const resumeSkills = ["Next.js", "TypeScript", "React", "Laravel", "PostgreSQL", "Prisma", "Home lab", "Linux VPS", "Docker", "Docker Compose", "Dokploy", "Mail server administration", "Cloudflare"];
const education = [{ year: "2025", degree: "Bachelor of Information Communication Technology (Hons.)", school: "University of Jaffna" }];

function object(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
function populated(value: unknown): boolean {
  return typeof value === "string" ? projectImageUrl(value) !== null : Array.isArray(value) ? value.length > 0 : value !== null && value !== undefined;
}
function choose<T>(mode: PresetMode, current: T, next: T): T {
  return mode === "recommended" || !populated(current) ? next : current;
}
function json(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}
function profileData(profile: Profile) {
  return { home: object(profile.homePageData), about: object(profile.aboutPageData), theme: object(profile.theme) };
}

async function applySection(tx: Prisma.TransactionClient, ownerId: string, profile: Profile, section: Exclude<PresetSection, "all">, mode: PresetMode): Promise<number> {
  const data = profileData(profile);
  if (section === "profile") {
    await tx.profile.update({ where: { userId: ownerId }, data: {
      fullName: choose(mode, profile.fullName, "Chathura Madhushanka"),
      tagline: choose(mode, profile.tagline, recommendedHome.tagline),
      avatarUrl: choose("fill", profile.avatarUrl, media.avatar),
      backgroundImageUrl: choose("fill", profile.backgroundImageUrl, media.background),
      faviconUrl: choose("fill", profile.faviconUrl, media.favicon),
    } });
    return 1;
  }
  if (section === "home") {
    const currentCta = object(data.home.callToAction);
    const home = {
      ...data.home,
      name: choose(mode, data.home.name, recommendedHome.name),
      tagline: choose(mode, data.home.tagline, recommendedHome.tagline),
      socialLinks: choose("fill", data.home.socialLinks, recommendedHome.socialLinks),
      experienceHighlights: choose(mode, data.home.experienceHighlights, recommendedHome.experienceHighlights),
      technicalExpertise: choose(mode, data.home.technicalExpertise, recommendedHome.technicalExpertise),
      achievements: choose("fill", data.home.achievements, recommendedHome.achievements),
      callToAction: {
        ...currentCta,
        title: choose(mode, currentCta.title, recommendedHome.callToAction.title),
        description: choose(mode, currentCta.description, recommendedHome.callToAction.description),
        email: choose("fill", currentCta.email, recommendedHome.callToAction.email),
      },
      availability_status: choose("fill", data.home.availability_status, recommendedHome.availability_status),
      about_card_description: choose(mode, data.home.about_card_description, recommendedHome.about_card_description),
      projects_card_description: choose(mode, data.home.projects_card_description, recommendedHome.projects_card_description),
      experience_card_description: choose(mode, data.home.experience_card_description, recommendedHome.experience_card_description),
    };
    await tx.profile.update({ where: { userId: ownerId }, data: { homePageData: json(home) } });
    return 1;
  }
  if (section === "about") {
    const currentCta = object(data.about.callToAction);
    const about = {
      ...data.about,
      title: choose(mode, data.about.title, recommendedAbout.title),
      subtitle: choose(mode, data.about.subtitle, recommendedAbout.subtitle),
      story: choose(mode, data.about.story, recommendedAbout.story),
      skills: choose(mode, data.about.skills, recommendedAbout.skills),
      callToAction: {
        ...currentCta,
        title: choose(mode, currentCta.title, recommendedAbout.callToAction.title),
        description: choose(mode, currentCta.description, recommendedAbout.callToAction.description),
        email: choose("fill", currentCta.email, recommendedAbout.callToAction.email),
      },
    };
    await tx.profile.update({ where: { userId: ownerId }, data: { aboutPageData: json(about) } });
    return 1;
  }
  if (section === "theme") {
    const theme = { ...data.theme };
    for (const [key, value] of Object.entries(productionTheme)) theme[key] = choose(mode, theme[key], value);
    await tx.profile.update({ where: { userId: ownerId }, data: {
      theme: json(theme), backgroundImageUrl: choose("fill", profile.backgroundImageUrl, media.background),
    } });
    return 1;
  }
  if (section === "projects") {
    let count = 0;
    for (const item of projects) {
      const existing = await tx.project.findFirst({ where: { userId: ownerId, OR: [
        { id: item.sourceId }, { title: item.oldTitle }, { title: item.title },
      ] } });
      const content = {
        title: choose(mode, existing?.title ?? "", item.title),
        description: choose(mode, existing?.description ?? "", item.description),
        longDescription: choose(mode, existing?.longDescription ?? "", item.longDescription),
        tech: choose(mode, existing?.tech ?? [], [...item.tech]),
        keyFeatures: choose(mode, existing?.keyFeatures ?? [], [...item.keyFeatures]),
        image: choose("fill", existing?.image ?? null, item.image),
        demoUrl: choose("fill", existing?.demoUrl ?? null, item.demoUrl || null),
        githubUrl: choose("fill", existing?.githubUrl ?? null, item.githubUrl || null),
      };
      if (existing) await tx.project.update({ where: { id: existing.id }, data: {
        ...content,
        ...(mode === "recommended" ? { featured: item.featured, published: true } : {}),
      } });
      else await tx.project.create({ data: { id: item.sourceId, userId: ownerId, ...content, published: true, featured: item.featured } });
      count++;
    }
    return count;
  }
  if (section === "work") {
    let count = 0;
    for (const item of work) {
      const existing = await tx.workExperience.findFirst({ where: { userId: ownerId, OR: [
        { id: item.sourceId }, { startDate: new Date(item.startDate) },
      ] } });
      if (existing) continue;
      await tx.workExperience.create({ data: {
        id: item.sourceId, userId: ownerId, company: item.company, position: item.position, location: "Colombo",
        startDate: new Date(item.startDate), endDate: item.endDate ? new Date(item.endDate) : null,
        isCurrent: item.isCurrent, visible: true, description: [],
      } });
      count++;
    }
    return count;
  }
  if (section === "resumes") {
    const existing = await tx.resume.findFirst({ where: { userId: ownerId, OR: [
      { id: "clresume_001" }, { role: "Full stack developer" }, { role: "Full-Stack Software Engineer" },
    ] } });
    if (existing) {
      await tx.resume.update({ where: { id: existing.id }, data: {
        title: choose(mode, existing.title, "Full-Stack Software Engineer"),
        summary: choose(mode, existing.summary, resumeSummary),
        skills: choose(mode, existing.skills, resumeSkills),
        education: json(choose("fill", existing.education, education)),
        location: choose("fill", existing.location, "Pokunuwita, Sri Lanka"),
        resumeUrl: choose("fill", existing.resumeUrl, media.resume),
      } });
      if (!profile.activeResumeRole) await tx.profile.update({ where: { userId: ownerId }, data: { activeResumeRole: existing.role } });
    } else {
      await tx.resume.create({ data: {
        id: "clresume_001", userId: ownerId, role: "Full stack developer", title: "Full-Stack Software Engineer",
        summary: resumeSummary, skills: resumeSkills, experience: [], education,
        certifications: [], projectIds: [], resumeUrl: media.resume, pdfSource: "uploaded",
        location: "Pokunuwita, Sri Lanka",
      } });
      await tx.profile.update({ where: { userId: ownerId }, data: { activeResumeRole: "Full stack developer" } });
    }
    return 1;
  }
  if (section === "gallery") {
    const existing = await tx.galleryImage.findMany({ where: { userId: ownerId }, select: { url: true } });
    const known = new Set(existing.map(({ url }) => extractStoragePath(url)));
    let count = 0;
    for (const [file, albumName] of gallery) {
      const url = `${galleryBase}${file}`;
      if (known.has(extractStoragePath(url))) continue;
      await tx.galleryImage.create({ data: { userId: ownerId, url, albumName } });
      known.add(extractStoragePath(url));
      count++;
    }
    return count;
  }
  return 0;
}

export async function applyMacmPreset(ownerId: string, section: PresetSection, mode: PresetMode) {
  return db.$transaction(async (tx) => {
    const profile = await tx.profile.findUnique({ where: { userId: ownerId } });
    if (!profile) throw new Error("Owner profile is missing");
    const sections = section === "all" ? presetSections.filter((item) => item !== "all") : [section];
    let changed = 0;
    for (const item of sections) changed += await applySection(tx, ownerId, profile, item as Exclude<PresetSection, "all">, mode);
    return { sections, changed };
  }, { timeout: 30_000 });
}
