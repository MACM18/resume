import { Metadata } from "next";
import { headers } from "next/headers";
import { getProfileDataServer } from "@/lib/profile.server";
import { getEffectiveDomain } from "@/lib/utils";
import { generateProjectsMetadata } from "@/lib/seo";
import { getProjectsServer } from "@/lib/projects.server";

export async function generateMetadata(): Promise<Metadata> {
  const hdr = await headers();
  const host = hdr.get("host") ?? "";
  const protocol = hdr.get("x-forwarded-proto") ?? "https";
  const origin = `${protocol}://${host}`;
  const domain = getEffectiveDomain(host);
  const profile = domain ? await getProfileDataServer(domain) : null;

  const projects = domain ? await getProjectsServer(domain) : [];
  const projectTitles = projects.map((project) => project.title);

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
