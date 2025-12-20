import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadFile, getPublicUrl } from "@/lib/storage";
import { optimizeImage, getImageDimensions } from "@/lib/image-optimization";

export const dynamic = "force-dynamic";

/**
 * POST /api/projects/upload-image
 * Upload and optimize a project image
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as Blob | null;

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    // Validate content type
    const contentType = file.type || "application/octet-stream";
    if (!["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(contentType)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload JPEG, PNG, or WebP." },
        { status: 400 }
      );
    }

    const userId = session.user.id;
    const arrayBuffer = await file.arrayBuffer();
    const originalBuffer = Buffer.from(arrayBuffer);

    const dimensions = getImageDimensions("project");

    // Optimize image (resize + convert to WebP)
    const { buffer: optimizedBuffer, contentType: optimizedType, ext } = await optimizeImage(
      originalBuffer,
      {
        maxWidth: dimensions.maxWidth,
        maxHeight: dimensions.maxHeight,
        quality: 85,
        format: "webp",
      }
    );

    const filePath = `${userId}/${Date.now()}.${ext}`;

    await uploadFile("project-images", filePath, optimizedBuffer, optimizedType);

    const publicUrl = getPublicUrl("project-images", `${userId}/${filePath.split("/").pop()}`);

    return NextResponse.json({ publicUrl });
  } catch (error) {
    console.error("Error uploading project image:", error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}
