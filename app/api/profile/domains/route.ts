import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * DELETE /api/profile/domains
 * Remove a domain from the user's profile
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { domain } = await request.json();
    if (!domain) {
      return NextResponse.json({ error: "Domain is required" }, { status: 400 });
    }

    // Verify the domain belongs to the current user's profile
    const profile = await db.profile.findUnique({
      where: { userId: session.user.id },
      include: { domains: true }
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const domainRecord = profile.domains.find(d => d.domain === domain);
    if (!domainRecord) {
      return NextResponse.json({ error: "Domain not found in your profile" }, { status: 404 });
    }

    // Delete the domain
    await db.domain.delete({
      where: { id: domainRecord.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing domain:", error);
    return NextResponse.json(
      { error: "Failed to remove domain" },
      { status: 500 }
    );
  }
}
