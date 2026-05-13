import { db } from "./db";
import { getEffectiveDomain } from "./utils";
import { Resume } from "@/types/portfolio";

export async function getActiveResumeServer(
  domain: string,
): Promise<Resume | null> {
  const effectiveDomain = getEffectiveDomain(domain);
  if (!effectiveDomain) return null;

  try {
    const profile = await db.profile.findFirst({
      where: {
        domains: {
          some: {
            domain: effectiveDomain,
          },
        },
      },
      select: {
        activeResumeRole: true,
        userId: true,
      },
    });

    if (!profile || !profile.activeResumeRole) return null;

    const resume = await db.resume.findFirst({
      where: {
        userId: profile.userId,
        role: profile.activeResumeRole,
      },
    });

    if (!resume) return null;

    return {
      id: resume.id,
      user_id: resume.userId,
      role: resume.role,
      title: resume.title || "",
      summary: resume.summary,
      skills: resume.skills,
      experience: resume.experience as any[],
      education: resume.education as any[],
      certifications: (resume.certifications as any[]) || [],
      project_ids: resume.projectIds,
      resume_url: resume.resumeUrl,
      pdf_source: (resume.pdfSource as "uploaded" | "generated") || "uploaded",
      uploaded_resume_id: resume.uploadedResumeId,
      location: resume.location || "",
      created_at: resume.created_at.toISOString(),
    };
  } catch (error) {
    console.error("Error fetching active resume (server):", error);
    return null;
  }
}
