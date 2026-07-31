import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, MIN_PASSWORD_LENGTH, normalizeEmail } from "@/lib/auth";
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

    if (!email || typeof email !== "string" || !password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = normalizeEmail(email);
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` },
        { status: 400 }
      );
    }

    // Check if user already exists
    const user = await db.$transaction(async (tx) => {
      // Serialize the bootstrap check so two simultaneous requests cannot create
      // two initial accounts.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('resume_bootstrap_signup'))`;
      if (await tx.user.count() > 0) {
        throw new Error("BOOTSTRAP_SIGNUP_CLOSED");
      }

      const passwordHash = await hashPassword(password);
      const createdUser = await tx.user.create({
        data: { email: normalizedEmail, passwordHash },
      });
      const defaults = getDefaultProfileData(normalizedEmail, fullName || "New User");
      await tx.profile.create({
        data: {
          userId: createdUser.id,
          fullName: defaults.fullName,
          tagline: defaults.tagline,
          homePageData: JSON.parse(JSON.stringify(defaults.homePageData)),
          aboutPageData: JSON.parse(JSON.stringify(defaults.aboutPageData)),
          theme: JSON.parse(JSON.stringify(defaults.theme)),
        },
      });
      return createdUser;
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "BOOTSTRAP_SIGNUP_CLOSED") {
      return NextResponse.json(
        { error: "Initial account setup is already complete" },
        { status: 409 }
      );
    }
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
