import { Metadata } from "next";
import { headers } from "next/headers";
import { getProfileDataServer } from "@/lib/profile.server";
import { getProjectsServer } from "@/lib/projects.server";
import { getEffectiveDomain } from "@/lib/utils";
import { generateProjectsMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const hdr = await headers();
  const host = hdr.get("host") ?? "";
  const protocol = hdr.get("x-forwarded-proto") ?? "https";
  const origin = `${protocol}://${host}`;
  const domain = getEffectiveDomain(host);
  const [profile, projects] = domain
    ? await Promise.all([getProfileDataServer(domain), getProjectsServer(domain)])
    : [null, []];

  const currentRole = profile?.active_resume_role || undefined;
  return generateProjectsMetadata(
    profile,
    domain || "",
    origin,
    projects.map((project) => project.title),
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
