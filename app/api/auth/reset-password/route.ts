import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { email, token, newPassword } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "email is required" }, { status: 400 });
    }

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "token is required" }, { status: 400 });
    }

    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const record = await db.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: { select: { email: true, id: true } } },
    });

    if (!record || record.user.email !== email) {
      return NextResponse.json({ error: "Invalid reset link" }, { status: 400 });
    }

    if (record.usedAt) {
      return NextResponse.json({ error: "Reset link already used" }, { status: 400 });
    }

    if (record.expiresAt.getTime() < Date.now()) {
      return NextResponse.json({ error: "Reset link expired" }, { status: 400 });
    }

    const newPasswordHash = await hashPassword(newPassword);

    await db.$transaction([
      db.user.update({
        where: { id: record.userId },
        data: { passwordHash: newPasswordHash },
      }),
      db.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("reset-password error:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}
