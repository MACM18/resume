import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

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
 * PATCH /api/work-experiences/[id]
 * Update a work experience (must be owned by current user)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Verify ownership
    const existing = await db.workExperience.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Work experience not found" },
        { status: 404 }
      );
    }

    // Map frontend field names to Prisma field names
    const updateData: Record<string, unknown> = {};

    if (body.company !== undefined) updateData.company = body.company;
    if (body.position !== undefined) updateData.position = body.position;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.start_date !== undefined) updateData.startDate = new Date(body.start_date);
    if (body.end_date !== undefined) updateData.endDate = body.end_date ? new Date(body.end_date) : null;
    if (body.is_current !== undefined) {
      updateData.isCurrent = body.is_current;
      if (body.is_current) {
        updateData.endDate = null;
      }
    }
    if (body.visible !== undefined) updateData.visible = body.visible;
    if (body.description !== undefined) updateData.description = body.description;

    const workExperience = await db.workExperience.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(transformWorkExperience(workExperience));
  } catch (error) {
    console.error("Error updating work experience:", error);
    return NextResponse.json(
      { error: "Failed to update work experience" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/work-experiences/[id]
 * Delete a work experience (must be owned by current user)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const existing = await db.workExperience.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Work experience not found" },
        { status: 404 }
      );
    }

    await db.workExperience.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting work experience:", error);
    return NextResponse.json(
      { error: "Failed to delete work experience" },
      { status: 500 }
    );
  }
}
