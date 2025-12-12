import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { normalizeDomain } from "@/lib/utils";

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
 * GET /api/projects/[id]?domain=example.com
 * Get a single project by ID (public, must be published)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get("domain");

    if (!domain) {
      return NextResponse.json({ error: "Domain is required" }, { status: 400 });
    }

    const normalizedDomain = normalizeDomain(domain);

    // Get the profile for this domain
    const profile = await db.profile.findFirst({
      where: { domain: normalizedDomain },
      select: { userId: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Get the project (must be published and owned by the domain user)
    const project = await db.project.findFirst({
      where: {
        id,
        userId: profile.userId,
        published: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(transformProject(project));
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/projects/[id]
 * Update a project (must be owned by current user)
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
    const existingProject = await db.project.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Map frontend field names to Prisma field names
    const updateData: Record<string, unknown> = {};
    
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.long_description !== undefined) updateData.longDescription = body.long_description;
    if (body.image !== undefined) updateData.image = body.image;
    if (body.tech !== undefined) updateData.tech = body.tech;
    if (body.demo_url !== undefined) updateData.demoUrl = body.demo_url;
    if (body.github_url !== undefined) updateData.githubUrl = body.github_url;
    if (body.featured !== undefined) updateData.featured = body.featured;
    if (body.published !== undefined) updateData.published = body.published;
    if (body.key_features !== undefined) updateData.keyFeatures = body.key_features;

    const project = await db.project.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(transformProject(project));
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects/[id]
 * Delete a project (must be owned by current user)
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
    const existingProject = await db.project.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    await db.project.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
