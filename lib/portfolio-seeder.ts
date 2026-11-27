import { Prisma } from "@prisma/client";
import {
  portfolioAboutSkills,
  portfolioHomeSkills,
  portfolioProjects,
  portfolioResumeSkills,
} from "./portfolio-seed-data";

type Transaction = Prisma.TransactionClient;

function asRecord(value: Prisma.JsonValue | null | undefined): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function mergeUnique(current: unknown, additions: readonly string[]): string[] {
  const values = Array.isArray(current) ? current.filter((item): item is string => typeof item === "string") : [];
  const seen = new Set(values.map((item) => item.toLocaleLowerCase()));
  for (const item of additions) {
    if (!seen.has(item.toLocaleLowerCase())) {
      values.push(item);
      seen.add(item.toLocaleLowerCase());
    }
  }
  return values;
}

function mergeSkillGroups<T extends { name?: string; category?: string; skills?: unknown; items?: unknown; icon?: string }>(
  existing: unknown,
  additions: readonly T[],
  key: "name" | "category",
): Record<string, unknown>[] {
  const groups = Array.isArray(existing)
    ? existing.filter((item): item is Record<string, unknown> => !!item && typeof item === "object" && !Array.isArray(item)).map((item) => ({ ...item }))
    : [];
  for (const addition of additions) {
    const label = addition[key];
    if (!label) continue;
    const found = groups.find((group) => typeof group[key] === "string" && (group[key] as string).toLocaleLowerCase() === label.toLocaleLowerCase());
    const skillKey = key === "name" ? "skills" : "items";
    const skills = mergeUnique(found?.[skillKey], key === "name" ? (addition.skills as readonly string[] ?? []) : (addition.items as readonly string[] ?? []));
    if (found) {
      found[skillKey] = skills;
      if (key === "category" && !found.icon && addition.icon) found.icon = addition.icon;
    } else {
      groups.push({ [key]: label, ...(key === "category" && addition.icon ? { icon: addition.icon } : {}), [skillKey]: skills });
    }
  }
  return groups;
}

function nonEmpty(value: string | null | undefined): string | null {
  return value?.trim() ? value : null;
}

/** Adds missing portfolio content for the configured owner without replacing editorial data. */
export async function seedOwnerPortfolio(tx: Transaction, ownerId: string) {
  const profile = await tx.profile.findUnique({ where: { userId: ownerId } });
  if (!profile) throw new Error(`Cannot seed portfolio: profile for configured owner ${ownerId} does not exist`);

  let createdProjects = 0;
  let matchedProjects = 0;
  for (const item of portfolioProjects) {
    const candidates = [item.title, item.oldTitle].filter(Boolean);
    const seededId = `macm_${item.sourceId}`;
    const matches = await tx.project.findMany({
      where: {
        userId: ownerId,
        OR: [
          { id: item.sourceId },
          { id: seededId },
          { title: { in: candidates, mode: "insensitive" } },
          ...(item.githubUrl ? [{ githubUrl: item.githubUrl }] : []),
          ...(item.demoUrl ? [{ demoUrl: item.demoUrl }] : []),
        ],
      },
      orderBy: { createdAt: "asc" },
      take: 1,
    });
    const current = matches[0];
    if (!current) {
      await tx.project.upsert({
        where: { id: seededId },
        update: {},
        create: {
          id: seededId,
          userId: ownerId,
          title: item.title,
          description: item.description,
          longDescription: item.longDescription,
          image: item.image,
          tech: [...item.tech],
          demoUrl: nonEmpty(item.demoUrl),
          githubUrl: nonEmpty(item.githubUrl),
          featured: item.featured,
          published: true,
          keyFeatures: [...item.keyFeatures],
        },
      });
      createdProjects++;
      continue;
    }

    matchedProjects++;
    await tx.project.update({
      where: { id: current.id },
      data: {
        description: current.description.trim() ? current.description : item.description,
        longDescription: current.longDescription.trim() ? current.longDescription : item.longDescription,
        image: current.image || item.image,
        demoUrl: current.demoUrl || nonEmpty(item.demoUrl),
        githubUrl: current.githubUrl || nonEmpty(item.githubUrl),
        tech: mergeUnique(current.tech, item.tech),
        keyFeatures: mergeUnique(current.keyFeatures, item.keyFeatures),
      },
    });
  }

  const home = asRecord(profile.homePageData);
  const about = asRecord(profile.aboutPageData);
  const homeGroups = mergeSkillGroups(home.technicalExpertise, portfolioHomeSkills, "name");
  const aboutGroups = mergeSkillGroups(about.skills, portfolioAboutSkills, "category");
  await tx.profile.update({
    where: { userId: ownerId },
    data: {
      homePageData: { ...home, technicalExpertise: homeGroups } as Prisma.InputJsonValue,
      aboutPageData: { ...about, skills: aboutGroups } as Prisma.InputJsonValue,
    },
  });

  let resume = await tx.resume.findFirst({
    where: { userId: ownerId, ...(profile.activeResumeRole ? { role: { equals: profile.activeResumeRole, mode: "insensitive" } } : {}) },
    orderBy: { updatedAt: "desc" },
  });
  if (!resume) resume = await tx.resume.findFirst({ where: { userId: ownerId }, orderBy: { updatedAt: "desc" } });
  if (resume) {
    await tx.resume.update({ where: { id: resume.id }, data: { skills: mergeUnique(resume.skills, portfolioResumeSkills) } });
  } else {
    await tx.resume.create({
      data: {
        userId: ownerId,
        role: profile.activeResumeRole || "Full stack developer",
        title: profile.activeResumeRole || "Full stack developer",
        summary: profile.tagline || "Full-stack software engineer building useful web applications and infrastructure.",
        experience: [],
        skills: [...portfolioResumeSkills],
        education: [],
        projectIds: [],
        pdfSource: "generated",
      },
    });
  }

  return { createdProjects, matchedProjects, skillsUpdated: true };
}
