import { db } from "./db";
import { extractStoragePath, resolveStorageUrl } from "./storage-urls";

export interface GalleryImageRecord {
    id: string;
    userId: string;
    url: string;
    albumName?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Create a gallery image record in the database.
 */
export async function createGalleryImage(
    userId: string,
    url: string,
    albumName?: string | null,
): Promise<GalleryImageRecord> {
    const cleanUrl = extractStoragePath(url) || url;
    const record = await db.galleryImage.create({
        data: {
            userId,
            url: cleanUrl,
            albumName: albumName || null,
        },
    });
    return {
        ...record,
        url: resolveStorageUrl(record.url) || record.url,
    } as unknown as GalleryImageRecord;
}

/**
 * List all gallery images for a given user, optionally filtered by album.
 */
import type { Prisma } from "@prisma/client";

export async function listGalleryImagesForUser(
    userId: string,
    albumName?: string | null,
): Promise<GalleryImageRecord[]> {
    const where: Prisma.GalleryImageWhereInput = { userId };
    if (albumName !== undefined) {
        // if null explicitly, match only records with no album
        where.albumName = albumName;
    }
    const images = await db.galleryImage.findMany({
        where,
        orderBy: { createdAt: "desc" },
    });
    return images.map((img) => ({
        ...img,
        url: resolveStorageUrl(img.url) || img.url,
    })) as unknown as GalleryImageRecord[];
}

/**
 * Find a gallery image by its id.
 */
export async function getGalleryImageById(id: string) {
    const img = await db.galleryImage.findUnique({ where: { id } });
    if (!img) return null;
    return {
        ...img,
        url: resolveStorageUrl(img.url) || img.url,
    };
}

/**
 * Delete a gallery image record by id.
 */
export async function deleteGalleryImageRecord(id: string) {
    return db.galleryImage.delete({ where: { id } });
}

/**
 * Update metadata for a gallery image (currently only album name).
 */
export async function updateGalleryImage(
    id: string,
    data: { albumName?: string | null; url?: string },
) {
    return db.galleryImage.update({ where: { id }, data });
}

/**
 * List distinct album names belonging to a user.
 */
export async function listGalleryAlbums(userId: string): Promise<string[]> {
    const results = await db.galleryImage.findMany({
        where: { userId },
        select: { albumName: true },
        distinct: ["albumName"],
    });
    return results
        .map((r) => r.albumName)
        .filter((n): n is string => !!n);
}

/**
 * Helper that looks up user id from domain (or returns undefined if not found).
 */
export async function getUserIdForDomain(
    domain: string,
): Promise<string | null> {
    const profile = await db.profile.findFirst({ where: { domains: { some: { domain } } } });
    return profile ? profile.userId : null;
}
