import { headers } from "next/headers";
import { getEffectiveDomain } from "@/lib/utils";
import { getProfileDataServer } from "@/lib/profile.server";
import { getActiveResumeServer } from "@/lib/resumes.server";
import { getProjectsServer } from "@/lib/projects.server";
import { getVisibleWorkExperiencesServer } from "@/lib/work-experiences.server";
import ResumeClient from "./ResumeClient";
import { DomainNotClaimed } from "@/components/DomainNotClaimed";

export default async function Page() {
  const hdr = await headers();
  const host = hdr.get("host") ?? "";
  const domain = getEffectiveDomain(host);

  if (!domain) {
    return <DomainNotClaimed />;
  }

  const [profileData, resume, projects, workHistory] = await Promise.all([
    getProfileDataServer(domain),
    getActiveResumeServer(domain),
    getProjectsServer(domain),
    getVisibleWorkExperiencesServer(domain),
  ]);

  if (!profileData) {
    return <DomainNotClaimed />;
  }

  return (
    <ResumeClient
      initialProfile={profileData}
      initialResume={resume}
      initialProjects={projects}
      initialWork={workHistory}
      hostname={host}
    />
  );
}
