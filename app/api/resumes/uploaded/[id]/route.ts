import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { deleteFile } from "@/lib/storage";

export const dynamic = "force-dynamic";

/**
 * DELETE /api/resumes/uploaded/[id]
 * Delete an uploaded resume (record and file)
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

    // Get the uploaded resume to find the file path
    const uploadedResume = await db.uploadedResume.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!uploadedResume) {
      return NextResponse.json(
        { error: "Uploaded resume not found" },
        { status: 404 }
      );
    }

    // Delete the file from storage
    if (uploadedResume.filePath) {
      try {
        await deleteFile("resumes", uploadedResume.filePath);
      } catch (storageError) {
        console.error("Error deleting file from storage:", storageError);
        // Continue with DB deletion even if storage deletion fails
      }
    }

    // Delete the database record
    await db.uploadedResume.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting uploaded resume:", error);
    return NextResponse.json(
      { error: "Failed to delete uploaded resume" },
      { status: 500 }
    );
  }
}
