import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { normalizeDomain } from "@/lib/utils";

export const dynamic = "force-dynamic";

// Transform Prisma work experience to frontend format
function transformWorkExperience(we: {
  id: string;
  userId: string;
  company: string;
  position: string;
  location: string | null;
  startDate: Date;
  endDate: Date | null;
  isCurrent: boolean;
  visible: boolean;
  description: string[];
  createdAt: Date;
}) {
  return {
    id: we.id,
    user_id: we.userId,
    company: we.company,
    position: we.position,
    location: we.location,
    start_date: we.startDate.toISOString(),
    end_date: we.endDate?.toISOString() || null,
    is_current: we.isCurrent,
    visible: we.visible,
    description: we.description,
    created_at: we.createdAt.toISOString(),
  };
}

/**
 * GET /api/work-experiences/by-domain?domain=example.com
 * Get visible work experiences for a domain
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get("domain");

    if (!domain) {
      return NextResponse.json({ error: "Domain is required" }, { status: 400 });
    }

    const normalizedDomain = normalizeDomain(domain);

    // First get the user ID for this domain
    const profile = await db.profile.findFirst({
      where: { domain: normalizedDomain },
      select: { userId: true },
    });

    if (!profile) {
      return NextResponse.json([]);
    }

    // Get visible work experiences for this user
    const workExperiences = await db.workExperience.findMany({
      where: {
        userId: profile.userId,
        visible: true,
      },
      orderBy: [
        { isCurrent: "desc" },
        { endDate: "desc" },
        { startDate: "desc" },
      ],
    });

    return NextResponse.json(workExperiences.map(transformWorkExperience));
  } catch (error) {
    console.error("Error fetching work experiences by domain:", error);
    return NextResponse.json(
      { error: "Failed to fetch work experiences" },
      { status: 500 }
    );
  }
}
