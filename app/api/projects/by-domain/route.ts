import { NextRequest, NextResponse } from "next/server";
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
 * GET /api/projects/by-domain?domain=example.com&featured=true
 * Get published projects for a domain
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get("domain");
    const featured = searchParams.get("featured") === "true";

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

    // Get projects for this user
    const whereClause: {
      userId: string;
      published: boolean;
      featured?: boolean;
    } = {
      userId: profile.userId,
      published: true,
    };

    if (featured) {
      whereClause.featured = true;
    }

    const projects = await db.project.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(projects.map(transformProject));
  } catch (error) {
    console.error("Error fetching projects by domain:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}
