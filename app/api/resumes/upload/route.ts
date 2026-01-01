import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { uploadFile, getPublicUrl } from "@/lib/storage";

export const dynamic = "force-dynamic";

/**
 * POST /api/resumes/upload
 * Accepts multipart/form-data with field `file` and optional `role` string
 * Uploads the file to the `resumes` bucket and creates an uploadedResume record
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const form = await request.formData();
    const file = form.get("file") as Blob | null;
    const role = (form.get("role") as string) || "resume";

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    // Validate content type
    const contentType = file.type || "application/pdf";
    if (contentType !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
    }

    const userId = session.user.id;
    const safeRole = role ? role.replace(/[^a-zA-Z0-9-_]/g, "-") : "resume";
    const filePath = `${userId}/${safeRole}-${Date.now()}.pdf`;

    const buffer = Buffer.from(await file.arrayBuffer());

    await uploadFile("resumes", filePath, buffer, contentType);

    const publicUrl = getPublicUrl("resumes", filePath);
    console.log("Uploaded resume public URL:", publicUrl, "storage endpoint:", process.env.STORAGE_PUBLIC_URL || process.env.STORAGE_ENDPOINT);

    // Create DB record
    const uploadedResume = await db.uploadedResume.create({
      data: {
        userId,
        filePath,
        publicUrl,
        originalFilename: (file as File).name || `${safeRole}.pdf`,
        fileSize: buffer.length,
      },
    });

    return NextResponse.json({
      id: uploadedResume.id,
      user_id: uploadedResume.userId,
      file_path: uploadedResume.filePath,
      public_url: uploadedResume.publicUrl,
      original_filename: uploadedResume.originalFilename,
      file_size: uploadedResume.fileSize,
      created_at: uploadedResume.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Error uploading resume:", error);
    return NextResponse.json({ error: "Failed to upload resume" }, { status: 500 });
  }
}
