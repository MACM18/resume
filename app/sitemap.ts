import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { getEffectiveDomain } from "@/lib/utils";
import { getProjectsServer } from "@/lib/projects.server";
import { getConfiguredSiteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const hdr = await headers();
  const host = hdr.get("host") ?? "";
  const domain = getEffectiveDomain(host);
  const baseUrl = getConfiguredSiteUrl();
  let projects: Awaited<ReturnType<typeof getProjectsServer>> = [];
  try {
    projects = domain ? await getProjectsServer(domain) : [];
  } catch (error) {
    console.error("Sitemap project lookup failed:", error);
  }

  return [
    { url: `${baseUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/projects`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/resume`, changeFrequency: "monthly", priority: 0.8 },
    ...projects.map((project) => ({
      url: `${baseUrl}/projects/${project.id}`,
      lastModified: project.created_at,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
