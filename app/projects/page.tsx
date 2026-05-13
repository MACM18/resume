import { headers } from "next/headers";
import { getEffectiveDomain } from "@/lib/utils";
import { getProfileDataServer } from "@/lib/profile.server";
import { getProjectsServer } from "@/lib/projects.server";
import ProjectsClient from "./ProjectsClient";
import { DomainNotClaimed } from "@/components/DomainNotClaimed";

export default async function Page() {
  const hdr = await headers();
  const host = hdr.get("host") ?? "";
  const domain = getEffectiveDomain(host);

  if (!domain) {
    return <DomainNotClaimed />;
  }

  const [profileData, projects] = await Promise.all([
    getProfileDataServer(domain),
    getProjectsServer(domain),
  ]);

  if (!profileData) {
    return <DomainNotClaimed />;
  }

  return (
    <ProjectsClient
      initialProfile={profileData}
      initialProjects={projects}
      hostname={host}
    />
  );
}
