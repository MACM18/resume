import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, isValidEmail, MIN_PASSWORD_LENGTH, normalizeEmail } from "@/lib/auth";
import { isValidOtp, isValidOtpFormat, OTP_MAX_ATTEMPTS } from "@/lib/auth-otp";
import { AuthOtpPurpose } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? normalizeEmail(body.email) : "";
    const code = body.code;
    const newPassword = body.newPassword;
    if (!isValidEmail(email) || !isValidOtpFormat(code)) {
      return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 });
    }
    if (typeof newPassword !== "string" || newPassword.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` }, { status: 400 });
    }

    const otp = await db.authOtp.findFirst({
      where: { targetEmail: email, purpose: AuthOtpPurpose.PASSWORD_RESET, consumedAt: null },
      orderBy: { createdAt: "desc" },
    });
    if (!otp || otp.expiresAt.getTime() <= Date.now() || otp.attempts >= OTP_MAX_ATTEMPTS) {
      return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 });
    }
    if (!isValidOtp(code, otp.codeHash)) {
      await db.authOtp.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
      return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 });
    }

    const passwordHash = await hashPassword(newPassword);
    await db.$transaction([
      db.user.update({ where: { id: otp.userId! }, data: { passwordHash } }),
      db.authOtp.update({ where: { id: otp.id }, data: { consumedAt: new Date() } }),
      db.authOtp.updateMany({
        where: { userId: otp.userId!, purpose: AuthOtpPurpose.PASSWORD_RESET, consumedAt: null, id: { not: otp.id } },
        data: { consumedAt: new Date() },
      }),
    ]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("password-reset verify error:", error);
    return NextResponse.json({ error: "Unable to reset password" }, { status: 500 });
  }
}
