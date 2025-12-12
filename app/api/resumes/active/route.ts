import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { normalizeDomain } from "@/lib/utils";

export const dynamic = "force-dynamic";

// Transform Prisma resume to frontend format
function transformResume(resume: {
  id: string;
  userId: string;
  role: string;
  title: string | null;
  summary: string;
  experience: unknown;
  skills: string[];
  education: unknown;
  projectIds: string[];
  resumeUrl: string | null;
  pdfSource: string;
  uploadedResumeId: string | null;
  certifications: unknown;
  location: string | null;
  createdAt: Date;
}) {
  return {
    id: resume.id,
    user_id: resume.userId,
    role: resume.role,
    title: resume.title,
    summary: resume.summary,
    experience: resume.experience,
    skills: resume.skills,
    education: resume.education,
    project_ids: resume.projectIds,
    resume_url: resume.resumeUrl,
    pdf_source: resume.pdfSource,
    uploaded_resume_id: resume.uploadedResumeId,
    certifications: resume.certifications,
    location: resume.location,
    created_at: resume.createdAt.toISOString(),
  };
}

/**
 * GET /api/resumes/active?domain=example.com
 * Get the active resume for a domain
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get("domain");

    if (!domain) {
      return NextResponse.json({ error: "Domain is required" }, { status: 400 });
    }

    const normalizedDomain = normalizeDomain(domain);

    // Get profile with active resume role
    const profile = await db.profile.findFirst({
      where: { domain: normalizedDomain },
      select: { userId: true, activeResumeRole: true },
    });

    if (!profile || !profile.activeResumeRole) {
      return NextResponse.json(
        { error: "No active resume set" },
        { status: 404 }
      );
    }

    // Get the active resume
    const resume = await db.resume.findFirst({
      where: {
        userId: profile.userId,
        role: profile.activeResumeRole,
      },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    return NextResponse.json(transformResume(resume));
  } catch (error) {
    console.error("Error fetching active resume:", error);
    return NextResponse.json(
      { error: "Failed to fetch resume" },
      { status: 500 }
    );
  }
}
