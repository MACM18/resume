import { Metadata } from "next";
import { headers } from "next/headers";
import { getProfileDataServer } from "@/lib/profile.server";
import { getEffectiveDomain } from "@/lib/utils";
import { generateProjectsMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const hdr = await headers();
  const host = hdr.get("host") ?? "";
  const protocol = hdr.get("x-forwarded-proto") ?? "https";
  const origin = `${protocol}://${host}`;
  const domain = getEffectiveDomain(host);
  const profile = domain ? await getProfileDataServer(domain) : null;

  let projectTitles: string[] = [];
  if (domain) {
    try {
      const res = await fetch(
        `${origin}/api/projects/by-domain?domain=${encodeURIComponent(domain)}`,
      );
      if (res.ok) {
        const data = (await res.json()) as Array<{ title?: string }>;
        projectTitles = (data || []).map((p) => p.title).filter(Boolean) as string[];
      }
    } catch (err) {
      // fail silently; metadata should still be returned
      console.error("Error fetching projects for metadata:", err);
    }
  }

  const currentRole = profile?.active_resume_role || undefined;
  return generateProjectsMetadata(
    profile,
    domain || "",
    origin,
    projectTitles,
    currentRole,
  );
}

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
