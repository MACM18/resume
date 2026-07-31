import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, normalizeEmail } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateOtp, hashOtp, OTP_REQUEST_COOLDOWN_MS, OTP_TTL_MS } from "@/lib/auth-otp";
import { getResend, getResendFromEmail } from "@/lib/resend.server";
import { AuthOtpPurpose } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json();
    const email = typeof body.email === "string" ? normalizeEmail(body.email) : "";
    if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });

    const currentUser = await db.user.findUnique({ where: { id: session.user.id } });
    if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (email === currentUser.email) return NextResponse.json({ error: "Enter a different email address" }, { status: 400 });
    if (await db.user.findUnique({ where: { email } })) return NextResponse.json({ error: "That email is already in use" }, { status: 409 });

    const recent = await db.authOtp.findFirst({
      where: { userId: currentUser.id, targetEmail: email, purpose: AuthOtpPurpose.EMAIL_CHANGE, createdAt: { gt: new Date(Date.now() - OTP_REQUEST_COOLDOWN_MS) } },
    });
    if (recent) return NextResponse.json({ success: true, message: "A verification code has already been sent." });

    const code = generateOtp();
    await db.authOtp.updateMany({ where: { userId: currentUser.id, purpose: AuthOtpPurpose.EMAIL_CHANGE, consumedAt: null }, data: { consumedAt: new Date() } });
    await db.authOtp.create({ data: { userId: currentUser.id, targetEmail: email, purpose: AuthOtpPurpose.EMAIL_CHANGE, codeHash: hashOtp(code), expiresAt: new Date(Date.now() + OTP_TTL_MS) } });
    await getResend().emails.send({ from: getResendFromEmail(), to: email, subject: "Verify your new account email", text: `Your email change verification code is ${code}. It expires in 15 minutes.` });
    return NextResponse.json({ success: true, message: "A verification code has been sent to the new email." });
  } catch (error) {
    console.error("email-change request error:", error);
    return NextResponse.json({ error: "Unable to send a verification code" }, { status: 500 });
  }
}
