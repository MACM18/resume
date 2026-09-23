import { db } from "./db";
import { getSiteOwnerId } from "./site-owner";
import type { Resume } from "@/types/portfolio";
import { safeAssetUrl } from "./remote-assets";
import { cache } from "react";

export const getActiveResumeServer = cache(async function getActiveResumeServer(
  domain: string,
): Promise<Resume | null> {
  void domain;
  const ownerId = await getSiteOwnerId();
  if (!ownerId) return null;

  try {
    const profile = await db.profile.findFirst({
      where: { userId: ownerId },
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
      experience: resume.experience as Resume["experience"],
      education: resume.education as Resume["education"],
      certifications: (resume.certifications as Resume["certifications"]) || [],
      project_ids: resume.projectIds,
      resume_url: safeAssetUrl(resume.resumeUrl) || null,
      pdf_source: (resume.pdfSource as Resume["pdf_source"]) || "uploaded",
      uploaded_resume_id: resume.uploadedResumeId,
      location: resume.location || "",
      created_at: resume.createdAt.toISOString(),
    };
  } catch (error) {
    console.error("Error fetching active resume (server):", error);
    return null;
  }
});
