import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { getDefaultProfileData } from "@/lib/profile.server";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/signup
 * Register a new user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, fullName } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await db.user.create({
      data: {
        email,
        passwordHash,
      },
    });

    // Create profile for the user
    const defaults = getDefaultProfileData(email, fullName || "New User");
    await db.profile.create({
      data: {
        userId: user.id,
        fullName: defaults.fullName,
        tagline: defaults.tagline,
        // Cast to JSON compatible type for Prisma
        homePageData: JSON.parse(JSON.stringify(defaults.homePageData)),
        aboutPageData: JSON.parse(JSON.stringify(defaults.aboutPageData)),
        theme: JSON.parse(JSON.stringify(defaults.theme)),
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
