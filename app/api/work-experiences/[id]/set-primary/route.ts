import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * POST /api/work-experiences/[id]/set-primary
 * Set a work experience as the primary (current) one
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // First, unset all others as primary
    await db.workExperience.updateMany({
      where: {
        userId: session.user.id,
        isCurrent: true,
      },
      data: { isCurrent: false },
    });

    // Then set the specified one as primary
    const workExperience = await db.workExperience.update({
      where: { id },
      data: {
        isCurrent: true,
        endDate: null, // Primary/current job has no end date
      },
    });

    return NextResponse.json({
      id: workExperience.id,
      user_id: workExperience.userId,
      company: workExperience.company,
      position: workExperience.position,
      location: workExperience.location,
      start_date: workExperience.startDate.toISOString(),
      end_date: null,
      is_current: true,
      visible: workExperience.visible,
      description: workExperience.description,
      created_at: workExperience.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Error setting primary work experience:", error);
    return NextResponse.json(
      { error: "Failed to set primary work experience" },
      { status: 500 }
    );
  }
}
