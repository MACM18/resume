import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { deleteFile, getPublicUrl, listFiles, uploadFile } from "@/lib/storage";
import { getImageDimensions, optimizeImage } from "@/lib/image-optimization";
import { normalizeDomain } from "@/lib/utils";
import { db } from "@/lib/db";

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

    // Determine which user id to list.  By default we use the authenticated
    // user's ID, but callers may provide `userId` or `domain` query params to
    // fetch someone else's gallery (public-only).  Only the gallery bucket is
    // allowed to be viewed without authentication.
    let userId: string | null = null;
    const queryUserId = url.searchParams.get("userId");
    const queryDomain = url.searchParams.get("domain");

    if (queryUserId) {
      userId = queryUserId;
    } else if (queryDomain) {
      // look up profile by domain
      const normalized = normalizeDomain(queryDomain);
      const profile = await db.profile.findFirst({
        where: { domain: normalized },
      });
      if (profile) {
        userId = profile.userId;
      }
    }

    if (!userId) {
      // fallback to session-based id; if none and bucket isn't gallery we
      // reject unauthorized
      if (session?.user?.id) {
        userId = session.user.id;
      } else if (bucket === "gallery-images") {
        // allow anonymous gallery listing without auth only if userId was
        // resolved via domain above; otherwise it's an error
        return NextResponse.json({ error: "Missing userId or domain" }, {
          status: 400,
        });
      } else {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const files = await listFiles(bucket, userId);

    // map keys to public URLs
    let urls = files.map((key) => {
      const prefix = `${bucket}/`;
      const relativePath = key.startsWith(prefix)
        ? key.slice(prefix.length)
        : key;
      return getPublicUrl(bucket, relativePath);
    });

    // only limit profile images; galleries should show all
    if (bucket === "profile-images") {
      urls = urls.slice(0, 10);
    }

    return NextResponse.json(urls);
  } catch (error) {
    console.error("Error listing profile images:", error);
    return NextResponse.json({ error: "Failed to list images" }, {
      status: 500,
    });
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
    const bucket = typeof bucketField === "string"
      ? bucketField
      : "profile-images";
    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    // Enforce upload limits per bucket
    const userId = session.user.id;
    const existingFiles = await listFiles(bucket, userId);

    const limits: Record<string, number> = {
      "profile-images": 10,
      "background-images": 5,
      "project-images": 20,
      "favicons": 3,
      // gallery can be quite large; cap to 50 for now
      "gallery-images": 50,
    };

    const limit = limits[bucket] || 10;
    if (existingFiles.length >= limit) {
      return NextResponse.json(
        {
          error: `Upload limit reached. You can only upload ${limit} ${
            bucket.replace("-images", "")
          } images. Please delete some existing images first.`,
        },
        { status: 400 },
      );
    }

    // Validate content type
    const contentType = file.type || "application/octet-stream";
    if (
      !["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(
        contentType,
      )
    ) {
      return NextResponse.json({
        error: "Invalid file type. Please upload JPEG, PNG, or WebP.",
      }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const originalBuffer = Buffer.from(arrayBuffer);

    // Determine image type from bucket
    let imageType = "profile";
    if (bucket.includes("background")) imageType = "background";
    else if (bucket.includes("project")) imageType = "project";
    else if (bucket.includes("favicon")) imageType = "favicon";

    const dimensions = getImageDimensions(imageType);

    // Optimize image (resize + convert to WebP)
    const { buffer: optimizedBuffer, contentType: optimizedType, ext } =
      await optimizeImage(
        originalBuffer,
        {
          maxWidth: dimensions.maxWidth,
          maxHeight: dimensions.maxHeight,
          quality: 85,
          format: "webp",
        },
      );

    const filePath = `${userId}/${Date.now()}.${ext}`;

    await uploadFile(bucket, filePath, optimizedBuffer, optimizedType);

    const publicUrl = getPublicUrl(
      bucket,
      `${userId}/${filePath.split("/").pop()}`,
    );

    return NextResponse.json({ publicUrl });
  } catch (error) {
    console.error("Error uploading profile image:", error);
    return NextResponse.json({ error: "Failed to upload image" }, {
      status: 500,
    });
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
      return NextResponse.json({ error: "imageUrl is required" }, {
        status: 400,
      });
    }

    // Derive file name from URL
    const segments = imageUrl.split("/");
    const fileName = segments[segments.length - 1];
    const filePath = `${session.user.id}/${fileName}`;

    await deleteFile(bucket, filePath);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting profile image:", error);
    return NextResponse.json({ error: "Failed to delete image" }, {
      status: 500,
    });
  }
}
