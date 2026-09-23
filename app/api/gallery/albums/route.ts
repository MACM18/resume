import { NextRequest, NextResponse } from "next/server";
import { listGalleryAlbums } from "@/lib/gallery.server";
import { getSiteOwnerId } from "@/lib/site-owner";

export const dynamic = "force-dynamic";
// Albums endpoint also uses Prisma, so force Node runtime.
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
    try {
        void request;
        const userId = await getSiteOwnerId();
        if (!userId) return NextResponse.json([]);
        const albums = await listGalleryAlbums(userId);
        return NextResponse.json(albums);
    } catch (error) {
        console.error("Error listing gallery albums:", error);
        if (error instanceof Error) {
            console.error(error.stack);
        }
        // degrade gracefully to empty album list
        return NextResponse.json([], { status: 200 });
    }
}
