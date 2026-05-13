import { headers } from "next/headers";
import { getEffectiveDomain } from "@/lib/utils";
import { getProfileDataServer } from "@/lib/profile.server";
import { getProjectsServer } from "@/lib/projects.server";
import { getCurrentWorkServer } from "@/lib/work-experiences.server";
import HomeClient from "./HomeClient";
import { DomainNotClaimed } from "@/components/DomainNotClaimed";

export default async function Page() {
  const hdr = await headers();
  const host = hdr.get("host") ?? "";
  const domain = getEffectiveDomain(host);

  if (!domain) {
    return <DomainNotClaimed />;
  }

  // Fetch all data in parallel on the server
  const [profileData, projects, currentWork] = await Promise.all([
    getProfileDataServer(domain),
    getProjectsServer(domain),
    getCurrentWorkServer(domain),
  ]);

  if (!profileData) {
    return <DomainNotClaimed />;
  }

  return (
    <HomeClient
      initialProfile={profileData}
      initialProjects={projects}
      initialWork={currentWork}
      hostname={host}
    />
  );
}
