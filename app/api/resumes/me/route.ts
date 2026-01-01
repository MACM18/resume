import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

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
 * GET /api/resumes/me
 * Get all resumes for the current user
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resumes = await db.resume.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(resumes.map(transformResume));
  } catch (error) {
    console.error("Error fetching user resumes:", error);
    return NextResponse.json(
      { error: "Failed to fetch resumes" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/resumes/me
 * Create a new resume for the current user
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const resume = await db.resume.create({
      data: {
        userId: session.user.id,
        role: body.role,
        title: body.title || null,
        summary: body.summary || "",
        experience: body.experience || [],
        skills: body.skills || [],
        education: body.education || [],
        projectIds: body.project_ids || [],
        resumeUrl: body.resume_url || null,
        pdfSource: body.pdf_source || "generated",
        uploadedResumeId: body.uploaded_resume_id || null,
        certifications: body.certifications || null,
        location: body.location || null,
      },
    });

    return NextResponse.json(transformResume(resume));
  } catch (error) {
    console.error("Error creating resume:", error);
    return NextResponse.json(
      { error: "Failed to create resume" },
      { status: 500 }
    );
  }
}
