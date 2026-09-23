import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSiteOwnerId } from "@/lib/site-owner";

export async function GET(request: NextRequest) {
  try {
    void request;
    const ownerId = await getSiteOwnerId();

    const profile = await db.profile.findFirst({
      where: { userId: ownerId ?? "" },
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

    // Transform to expected format (match frontend WorkExperience shape)
    return NextResponse.json({
      id: currentWork.id,
      user_id: currentWork.userId,
      company: currentWork.company,
      position: currentWork.position,
      location: currentWork.location || null,
      start_date: currentWork.startDate?.toISOString().split("T")[0] || null,
      end_date: currentWork.endDate?.toISOString().split("T")[0] || null,
      description: currentWork.description,
      is_current: currentWork.isCurrent,
      visible: currentWork.visible,
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
