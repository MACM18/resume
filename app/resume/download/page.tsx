import { headers } from "next/headers";
import { getEffectiveDomain } from "@/lib/utils";
import { getProfileDataServer } from "@/lib/profile.server";
import { getActiveResumeServer } from "@/lib/resumes.server";
import { getProjectsServer } from "@/lib/projects.server";
import { getVisibleWorkExperiencesServer } from "@/lib/work-experiences.server";
import { DomainNotClaimed } from "@/components/DomainNotClaimed";
import ResumeDownloadClient from "./ResumeDownloadClient";

export default async function ResumeDownloadPage() {
  const hdr = await headers();
  const host = hdr.get("host") ?? "";
  const domain = getEffectiveDomain(host);

  if (!domain) {
    return <DomainNotClaimed />;
  }

  // Fetch the complete public bundle in parallel on the server. This avoids
  // waiting for four dependent browser API requests before PDF generation.
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
    <ResumeDownloadClient
      initialProfile={profileData}
      initialResume={resume}
      initialProjects={projects}
      initialWork={workHistory}
    />
  );
}
