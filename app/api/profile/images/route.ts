import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listFiles, uploadFile, deleteFile, getPublicUrl } from "@/lib/storage";

export const dynamic = "force-dynamic";

/**
 * GET /api/profile/images
 * List images for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const bucket = url.searchParams.get("bucket") || "profile-images";

    const userId = session.user.id;
    const files = await listFiles(bucket, userId);

    // map keys to public URLs
    const urls = files.slice(0, 10).map((key) => {
      const relativePath = key.replace(new RegExp(`^${bucket}\\/`), "");
      return getPublicUrl(bucket, relativePath);
    });

    return NextResponse.json(urls);
  } catch (error) {
    console.error("Error listing profile images:", error);
    return NextResponse.json({ error: "Failed to list images" }, { status: 500 });
  }
}

/**
 * POST /api/profile/images
 * Upload a profile image (multipart/form-data expected with field `file`)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as Blob | null;
    const bucketField = formData.get("bucket");
    const bucket = typeof bucketField === "string" ? bucketField : "profile-images";
    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    // Validate content type
    const contentType = file.type || "application/octet-stream";
    if (!["image/jpeg", "image/png", "image/webp"].includes(contentType)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    const userId = session.user.id;
    const ext = (file.type.split("/").pop() || "jpg").replace(/[^a-z0-9]/gi, "");
    const filePath = `${userId}/${Date.now()}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await uploadFile(bucket, filePath, buffer, contentType);

    const publicUrl = getPublicUrl(bucket, `${userId}/${filePath.split("/").pop()}`);

    return NextResponse.json({ publicUrl });
  } catch (error) {
    console.error("Error uploading profile image:", error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}

/**
 * DELETE /api/profile/images
 * Body: { imageUrl: string }
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const imageUrl = body?.imageUrl;
    const bucket = body?.bucket || "profile-images";
    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json({ error: "imageUrl is required" }, { status: 400 });
    }

    // Derive file name from URL
    const segments = imageUrl.split("/");
    const fileName = segments[segments.length - 1];
    const filePath = `${session.user.id}/${fileName}`;

    await deleteFile(bucket, filePath);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting profile image:", error);
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}
