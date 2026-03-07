import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { deleteFile, getPublicUrl, listFiles, uploadFile } from "@/lib/storage";
import { getImageDimensions, optimizeImage } from "@/lib/image-optimization";
import {
    createGalleryImage,
    deleteGalleryImageRecord,
    getGalleryImageById,
    getUserIdForDomain,
    listGalleryImagesForUser,
    updateGalleryImage,
} from "@/lib/gallery.server";
import { normalizeDomain } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * GET /api/gallery/images?domain=example.com
 * GET /api/gallery/images?userId=xxx
 *   - lists gallery image records with metadata
 */
export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const queryDomain = url.searchParams.get("domain");
        const queryUserId = url.searchParams.get("userId");
        let userId: string | null = null;

        if (queryUserId) {
            userId = queryUserId;
        } else if (queryDomain) {
            const normalized = normalizeDomain(queryDomain);
            userId = await getUserIdForDomain(normalized);
        }

        if (!userId) {
            return NextResponse.json(
                { error: "userId or domain is required" },
                { status: 400 },
            );
        }

        const images = await listGalleryImagesForUser(userId);
        return NextResponse.json(images);
    } catch (error) {
        console.error("Error listing gallery images:", error);
        return NextResponse.json({ error: "Failed to list gallery images" }, {
            status: 500,
        });
    }
}

/**
 * POST /api/gallery/images
 *  multipart/form-data: file + optional albumName
 *  requires authentication
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, {
                status: 401,
            });
        }

        const formData = await request.formData();
        const file = formData.get("file") as Blob | null;
        const album = formData.get("albumName");
        const albumName = typeof album === "string" ? album.trim() : undefined;
        if (!file) {
            return NextResponse.json({ error: "File is required" }, {
                status: 400,
            });
        }

        const userId = session.user.id;

        // Storage limits (reuse existing logic)
        const existingFiles = await listFiles("gallery-images", userId);
        const limit = 50;
        if (existingFiles.length >= limit) {
            return NextResponse.json(
                {
                    error:
                        `Upload limit reached. You can only upload ${limit} gallery images.`,
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

        const dimensions = getImageDimensions("project"); // reuse project size? maybe generic

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
        await uploadFile(
            "gallery-images",
            filePath,
            optimizedBuffer,
            optimizedType,
        );
        const publicUrl = getPublicUrl(
            "gallery-images",
            `${userId}/${filePath.split("/").pop()}`,
        );

        // persist record in database
        await createGalleryImage(userId, publicUrl, albumName || null);

        return NextResponse.json({ publicUrl });
    } catch (error) {
        console.error("Error uploading gallery image:", error);
        return NextResponse.json({ error: "Failed to upload gallery image" }, {
            status: 500,
        });
    }
}

/**
 * DELETE /api/gallery/images
 * body: { id: string }
 */
export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, {
                status: 401,
            });
        }

        const body = await request.json();
        const id = body?.id;
        if (!id || typeof id !== "string") {
            return NextResponse.json({ error: "id is required" }, {
                status: 400,
            });
        }

        // verify ownership
        const record = await getGalleryImageById(id);
        if (!record || record.userId !== session.user.id) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        // remove from storage
        const segments = record.url.split("/");
        const fileName = segments[segments.length - 1];
        const filePath = `${session.user.id}/${fileName}`;
        await deleteFile("gallery-images", filePath);

        // delete db record
        await deleteGalleryImageRecord(id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting gallery image:", error);
        return NextResponse.json({ error: "Failed to delete gallery image" }, {
            status: 500,
        });
    }
}

/**
 * PATCH /api/gallery/images
 * body: { id: string, albumName?: string | null }
 */
export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, {
                status: 401,
            });
        }

        const body = await request.json();
        const id = body?.id;
        const albumName = body?.albumName;

        if (!id || typeof id !== "string") {
            return NextResponse.json({ error: "id is required" }, {
                status: 400,
            });
        }

        const record = await getGalleryImageById(id);
        if (!record || record.userId !== session.user.id) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        await updateGalleryImage(id, { albumName: albumName ?? null });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating gallery image:", error);
        return NextResponse.json({ error: "Failed to update gallery image" }, {
            status: 500,
        });
    }
}
