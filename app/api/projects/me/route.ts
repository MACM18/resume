import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// Transform Prisma project to frontend format
function transformProject(project: {
  id: string;
  userId: string;
  title: string;
  description: string;
  longDescription: string;
  image: string | null;
  tech: string[];
  demoUrl: string | null;
  githubUrl: string | null;
  featured: boolean;
  published: boolean;
  keyFeatures: string[];
  createdAt: Date;
}) {
  return {
    id: project.id,
    user_id: project.userId,
    title: project.title,
    description: project.description,
    long_description: project.longDescription,
    image: project.image,
    tech: project.tech,
    demo_url: project.demoUrl,
    github_url: project.githubUrl,
    featured: project.featured,
    published: project.published,
    key_features: project.keyFeatures,
    created_at: project.createdAt.toISOString(),
  };
}

/**
 * GET /api/projects/me
 * Get all projects for the current user
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projects = await db.project.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(projects.map(transformProject));
  } catch (error) {
    console.error("Error fetching user projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects/me
 * Create a new project for the current user
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const project = await db.project.create({
      data: {
        userId: session.user.id,
        title: body.title,
        description: body.description,
        longDescription: body.long_description || "",
        image: body.image || "/placeholder.svg",
        tech: body.tech || [],
        demoUrl: body.demo_url || null,
        githubUrl: body.github_url || null,
        featured: body.featured || false,
        published: body.published || false,
        keyFeatures: body.key_features || [],
      },
    });

    return NextResponse.json(transformProject(project));
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
