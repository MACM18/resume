import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { normalizeDomain } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get("domain");

    if (!domain) {
      return NextResponse.json(
        { error: "Domain parameter required" },
        { status: 400 }
      );
    }

    const normalizedDomain = normalizeDomain(domain);

    // Find profile by domain
    const profile = await db.profile.findFirst({
      where: { domain: normalizedDomain },
      select: { userId: true },
    });

    if (!profile) {
      return NextResponse.json(null);
    }

    // Get the current work experience (is_current = true) or the most recent one
    const currentWork = await db.workExperience.findFirst({
      where: {
        userId: profile.userId,
        visible: true,
      },
      orderBy: [
        { isCurrent: "desc" }, // Current work first
        { startDate: "desc" }, // Then by most recent start date
      ],
    });

    if (!currentWork) {
      return NextResponse.json(null);
    }

    // Transform to expected format
    return NextResponse.json({
      id: currentWork.id,
      user_id: currentWork.userId,
      company: currentWork.company,
      role: currentWork.position,
      start_date: currentWork.startDate?.toISOString().split("T")[0] || null,
      end_date: currentWork.endDate?.toISOString().split("T")[0] || null,
      description: currentWork.description,
      is_current: currentWork.isCurrent,
      is_visible: currentWork.visible,
      display_order: 0, // Not in schema, use default
      created_at: currentWork.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Error fetching current work experience:", error);
    return NextResponse.json(
      { error: "Failed to fetch current work experience" },
      { status: 500 }
    );
  }
}
