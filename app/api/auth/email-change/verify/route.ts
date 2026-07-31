import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isValidEmail, normalizeEmail } from "@/lib/auth";
import { db } from "@/lib/db";
import { isValidOtp, isValidOtpFormat, OTP_MAX_ATTEMPTS } from "@/lib/auth-otp";
import { AuthOtpPurpose } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json();
    const email = typeof body.email === "string" ? normalizeEmail(body.email) : "";
    if (!isValidEmail(email) || !isValidOtpFormat(body.code)) return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 });
    const otp = await db.authOtp.findFirst({ where: { userId: session.user.id, targetEmail: email, purpose: AuthOtpPurpose.EMAIL_CHANGE, consumedAt: null }, orderBy: { createdAt: "desc" } });
    if (!otp || otp.expiresAt.getTime() <= Date.now() || otp.attempts >= OTP_MAX_ATTEMPTS) return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 });
    if (!isValidOtp(body.code, otp.codeHash)) {
      await db.authOtp.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
      return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 });
    }
    await db.$transaction([
      db.user.update({ where: { id: session.user.id }, data: { email, emailVerified: new Date() } }),
      db.authOtp.update({ where: { id: otp.id }, data: { consumedAt: new Date() } }),
      db.authOtp.updateMany({ where: { userId: session.user.id, purpose: AuthOtpPurpose.EMAIL_CHANGE, consumedAt: null, id: { not: otp.id } }, data: { consumedAt: new Date() } }),
    ]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("email-change verify error:", error);
    return NextResponse.json({ error: "Unable to update email" }, { status: 500 });
  }
}
