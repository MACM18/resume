import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { deleteFile, getPublicUrl, uploadFile } from "@/lib/storage";
import { getImageDimensions, optimizeImage } from "@/lib/image-optimization";
import {
    getGalleryImageById,
    updateGalleryImage as updateGalleryImageInDb,
} from "@/lib/gallery.server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * PATCH /api/gallery/images/[id]
 *  multipart/form-data: file (edited image)
 *  requires authentication
 *  Saves the edited image, deletes the old one, and updates the database record
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, {
                status: 401,
            });
        }

        const { id: imageId } = await params;

        // Get the current image record to verify ownership and get old URL
        const currentImage = await getGalleryImageById(imageId);
        if (!currentImage) {
            return NextResponse.json(
                { error: "Image not found" },
                { status: 404 },
            );
        }

        // Verify ownership
        if (currentImage.userId !== session.user.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 403 },
            );
        }

        const formData = await request.formData();
        const file = formData.get("file") as Blob | null;

        if (!file) {
            return NextResponse.json(
                { error: "File is required" },
                { status: 400 },
            );
        }

        const userId = session.user.id;
        const contentType = file.type || "application/octet-stream";

        if (
            !["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(
                contentType,
            )
        ) {
            return NextResponse.json(
                {
                    error:
                        "Invalid file type. Please upload JPEG, PNG, or WebP.",
                },
                { status: 400 },
            );
        }

        const arrayBuffer = await file.arrayBuffer();
        const originalBuffer = Buffer.from(arrayBuffer);

        const dimensions = getImageDimensions("project");

        const { buffer: optimizedBuffer, contentType: optimizedType, ext } =
            await optimizeImage(originalBuffer, {
                maxWidth: dimensions.maxWidth,
                maxHeight: dimensions.maxHeight,
                quality: 85,
                format: "webp",
            });

        const filePath = `${userId}/${Date.now()}.${ext}`;
        await uploadFile(
            "gallery-images",
            filePath,
            optimizedBuffer,
            optimizedType,
        );

        const newPublicUrl = getPublicUrl(
            "gallery-images",
            `${userId}/${filePath.split("/").pop()}`,
        );

        // Update the database record with the new URL
        await updateGalleryImageInDb(imageId, { url: newPublicUrl });

        // Delete the old image from storage
        try {
            const oldUrl = currentImage.url;
            if (oldUrl) {
                // Extract the path from the URL
                // URL format: https://bucket/gallery-images/userId/timestamp.webp
                const urlParts = oldUrl.split("/");
                const oldFileName = urlParts.pop(); // e.g., "1234567890.webp"
                const oldUserId = urlParts.pop(); // e.g., userId
                if (oldFileName && oldUserId) {
                    await deleteFile(
                        "gallery-images",
                        `${oldUserId}/${oldFileName}`,
                    );
                }
            }
        } catch (err) {
            console.warn("Failed to delete old image:", err);
            // Don't fail the request if old file deletion fails
        }

        return NextResponse.json({ publicUrl: newPublicUrl });
    } catch (error) {
        console.error("Error editing gallery image:", error);
        if (error instanceof Error) {
            console.error(error.stack);
        }
        return NextResponse.json(
            { error: "Failed to edit gallery image" },
            { status: 500 },
        );
    }
}
