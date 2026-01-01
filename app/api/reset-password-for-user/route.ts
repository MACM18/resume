import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import crypto from 'crypto';
import { getResend, getResendFromEmail } from '@/lib/resend.server';

export const dynamic = 'force-dynamic';

function isSuperAdminDomain(domain: string | null | undefined): boolean {
  return domain === 'macm.dev' || domain === 'www.macm.dev';
}

function getRequestOrigin(request: NextRequest): string {
  const forwardedProto = request.headers.get('x-forwarded-proto');
  const forwardedHost = request.headers.get('x-forwarded-host');
  if (forwardedProto && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }
  const host = request.headers.get('host');
  if (host) {
    const proto = forwardedProto ?? (host.startsWith('localhost') ? 'http' : 'https');
    return `${proto}://${host}`;
  }
  return request.nextUrl.origin;
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and is super admin
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUserProfile = await db.profile.findFirst({
      where: { user: { email: session.user.email } },
      select: { domain: true }
    });

    if (!isSuperAdminDomain(currentUserProfile?.domain)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'email is required' }, { status: 400 });
    }

    // Find the user
    const user = await db.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create a one-time password reset token (store only a hash)
    const token = crypto.randomBytes(32).toString('base64url');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    const origin = getRequestOrigin(request);
    const resetUrl = `${origin}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

    const resend = getResend();
    await resend.emails.send({
      from: getResendFromEmail(),
      to: email,
      subject: 'Reset your password',
      text:
        `A password reset was requested for your account.\n\n` +
        `Reset your password using this link (valid for 1 hour):\n${resetUrl}\n\n` +
        `If you did not request this, you can ignore this email.`,
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset link sent',
    });
  } catch (error) {
    console.error('reset-password-for-user error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
