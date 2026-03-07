import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserIdForDomain, listGalleryAlbums } from "@/lib/gallery.server";
import { normalizeDomain } from "@/lib/utils";

export const dynamic = "force-dynamic";
// Albums endpoint also uses Prisma, so force Node runtime.
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const queryDomain = url.searchParams.get("domain");
        const session = await getServerSession(authOptions);

        let userId: string | null = null;
        if (queryDomain) {
            const normalized = normalizeDomain(queryDomain);
            userId = await getUserIdForDomain(normalized);
        } else if (session?.user?.id) {
            userId = session.user.id;
        }

        if (!userId) {
            return NextResponse.json({ error: "userId or domain required" }, {
                status: 400,
            });
        }

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
