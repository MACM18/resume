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
 * PATCH /api/resumes/[id]
 * Update a resume (must be owned by current user)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Verify ownership
    const existingResume = await db.resume.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existingResume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Map frontend field names to Prisma field names
    const updateData: Record<string, unknown> = {};
    
    if (body.role !== undefined) updateData.role = body.role;
    if (body.title !== undefined) updateData.title = body.title;
    if (body.summary !== undefined) updateData.summary = body.summary;
    if (body.experience !== undefined) updateData.experience = body.experience;
    if (body.skills !== undefined) updateData.skills = body.skills;
    if (body.education !== undefined) updateData.education = body.education;
    if (body.project_ids !== undefined) updateData.projectIds = body.project_ids;
    if (body.resume_url !== undefined) updateData.resumeUrl = body.resume_url;
    if (body.pdf_source !== undefined) updateData.pdfSource = body.pdf_source;
    if (body.uploaded_resume_id !== undefined) updateData.uploadedResumeId = body.uploaded_resume_id;
    if (body.certifications !== undefined) updateData.certifications = body.certifications;
    if (body.location !== undefined) updateData.location = body.location;

    const resume = await db.resume.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(transformResume(resume));
  } catch (error) {
    console.error("Error updating resume:", error);
    return NextResponse.json(
      { error: "Failed to update resume" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/resumes/[id]
 * Delete a resume (must be owned by current user)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const existingResume = await db.resume.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existingResume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    await db.resume.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting resume:", error);
    return NextResponse.json(
      { error: "Failed to delete resume" },
      { status: 500 }
    );
  }
}
