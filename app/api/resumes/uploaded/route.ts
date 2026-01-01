import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// Transform Prisma uploaded resume to frontend format
function transformUploadedResume(uploadedResume: {
  id: string;
  userId: string;
  filePath: string;
  publicUrl: string | null;
  originalFilename: string;
  fileSize: number | null;
  createdAt: Date;
}) {
  return {
    id: uploadedResume.id,
    user_id: uploadedResume.userId,
    file_path: uploadedResume.filePath,
    public_url: uploadedResume.publicUrl,
    original_filename: uploadedResume.originalFilename,
    file_size: uploadedResume.fileSize,
    created_at: uploadedResume.createdAt.toISOString(),
  };
}

/**
 * GET /api/resumes/uploaded
 * Get all uploaded resumes for the current user
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const uploadedResumes = await db.uploadedResume.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(uploadedResumes.map(transformUploadedResume));
  } catch (error) {
    console.error("Error fetching uploaded resumes:", error);
    return NextResponse.json(
      { error: "Failed to fetch uploaded resumes" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/resumes/uploaded
 * Create a new uploaded resume record
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const uploadedResume = await db.uploadedResume.create({
      data: {
        userId: session.user.id,
        filePath: body.filePath,
        publicUrl: body.publicUrl || null,
        originalFilename: body.originalFilename,
        fileSize: body.fileSize || null,
      },
    });

    return NextResponse.json(transformUploadedResume(uploadedResume));
  } catch (error) {
    console.error("Error creating uploaded resume:", error);
    return NextResponse.json(
      { error: "Failed to create uploaded resume" },
      { status: 500 }
    );
  }
}
