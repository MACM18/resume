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
 * GET /api/work-experiences/me
 * Get all work experiences for the current user
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workExperiences = await db.workExperience.findMany({
      where: { userId: session.user.id },
      orderBy: [
        { isCurrent: "desc" },
        { endDate: "desc" },
        { startDate: "desc" },
      ],
    });

    return NextResponse.json(workExperiences.map(transformWorkExperience));
  } catch (error) {
    console.error("Error fetching user work experiences:", error);
    return NextResponse.json(
      { error: "Failed to fetch work experiences" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/work-experiences/me
 * Create a new work experience for the current user
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // If is_current is true, clear end_date
    const isCurrent = body.is_current || false;
    const endDate = isCurrent ? null : body.end_date ? new Date(body.end_date) : null;

    const workExperience = await db.workExperience.create({
      data: {
        userId: session.user.id,
        company: body.company,
        position: body.position,
        location: body.location || null,
        startDate: new Date(body.start_date),
        endDate,
        isCurrent,
        visible: body.visible ?? true,
        description: body.description || [],
      },
    });

    return NextResponse.json(transformWorkExperience(workExperience));
  } catch (error) {
    console.error("Error creating work experience:", error);
    return NextResponse.json(
      { error: "Failed to create work experience" },
      { status: 500 }
    );
  }
}
