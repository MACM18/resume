import { db } from "./db";
import { getEffectiveDomain } from "./utils";
import { Project } from "@/types/portfolio";

export async function getProjectsServer(domain: string): Promise<Project[]> {
  const effectiveDomain = getEffectiveDomain(domain);
  if (!effectiveDomain) return [];

  try {
    const projects = await db.project.findMany({
      where: {
        user: {
          profile: {
            domains: {
              some: {
                domain: effectiveDomain,
              },
            },
          },
        },
        published: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return projects.map((p) => ({
      id: p.id,
      user_id: p.userId,
      title: p.title,
      description: p.description,
      long_description: p.longDescription || "",
      image: p.image || undefined,
      tech: p.tech,
      demo_url: p.demoUrl || undefined,
      github_url: p.githubUrl || undefined,
      featured: p.featured,
      published: p.published,
      created_at: p.created_at.toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching projects (server):", error);
    return [];
  }
}

export async function getProjectByIdServer(
  id: string,
  domain: string,
): Promise<Project | null> {
  const effectiveDomain = getEffectiveDomain(domain);
  if (!effectiveDomain) return null;

  try {
    const project = await db.project.findFirst({
      where: {
        id,
        user: {
          profile: {
            domains: {
              some: {
                domain: effectiveDomain,
              },
            },
          },
        },
        published: true,
      },
    });

    if (!project) return null;

    return {
      id: project.id,
      user_id: project.userId,
      title: project.title,
      description: project.description,
      long_description: project.longDescription || "",
      image: project.image || undefined,
      tech: project.tech,
      demo_url: project.demoUrl || undefined,
      github_url: project.githubUrl || undefined,
      featured: project.featured,
      published: project.published,
      created_at: project.created_at.toISOString(),
    };
  } catch (error) {
    console.error("Error fetching project by id (server):", error);
    return null;
  }
}
