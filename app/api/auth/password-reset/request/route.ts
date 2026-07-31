import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { normalizeEmail } from "@/lib/auth";
import { generateOtp, hashOtp, OTP_REQUEST_COOLDOWN_MS, OTP_TTL_MS } from "@/lib/auth-otp";
import { getResend, getResendFromEmail } from "@/lib/resend.server";
import { AuthOtpPurpose } from "@prisma/client";

export const dynamic = "force-dynamic";

const SAFE_MESSAGE = "If an account exists for that email, a verification code has been sent.";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? normalizeEmail(body.email) : "";
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
    }

    await db.authOtp.deleteMany({ where: { expiresAt: { lt: new Date() } } });
    const recent = await db.authOtp.findFirst({
      where: {
        targetEmail: email,
        purpose: AuthOtpPurpose.PASSWORD_RESET,
        createdAt: { gt: new Date(Date.now() - OTP_REQUEST_COOLDOWN_MS) },
      },
    });
    if (recent) return NextResponse.json({ success: true, message: SAFE_MESSAGE });

    const user = await db.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ success: true, message: SAFE_MESSAGE });

    const code = generateOtp();
    await db.authOtp.updateMany({
      where: { userId: user.id, purpose: AuthOtpPurpose.PASSWORD_RESET, consumedAt: null },
      data: { consumedAt: new Date() },
    });
    await db.authOtp.create({
      data: {
        userId: user.id,
        targetEmail: email,
        purpose: AuthOtpPurpose.PASSWORD_RESET,
        codeHash: hashOtp(code),
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
      },
    });

    await getResend().emails.send({
      from: getResendFromEmail(),
      to: email,
      subject: "Your password reset code",
      text: `Your password reset code is ${code}. It expires in 15 minutes. If you did not request this, you can ignore this email.`,
    });
    return NextResponse.json({ success: true, message: SAFE_MESSAGE });
  } catch (error) {
    console.error("password-reset request error:", error);
    // Keep the response indistinguishable from the normal request path so
    // provider/database failures cannot be used for account enumeration.
    return NextResponse.json({ success: true, message: SAFE_MESSAGE });
  }
}
