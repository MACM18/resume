import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDefaultProfileData } from '@/lib/profile.server';
import crypto from 'crypto';
import { getResend, getResendFromEmail } from '@/lib/resend.server';

export const dynamic = 'force-dynamic';

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

    const isSuperAdmin =
      currentUserProfile?.domain === 'macm.dev' ||
      currentUserProfile?.domain === 'www.macm.dev';
    if (!isSuperAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'email is required' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    // Create user with a temporary password (user will need to reset)
    const tempPassword = Math.random().toString(36).slice(-12);
    const passwordHash = await hashPassword(tempPassword);

    const user = await db.user.create({
      data: {
        email,
        passwordHash,
      }
    });

    // Create profile for the user
    const defaults = getDefaultProfileData(email);
    await db.profile.create({
      data: {
        userId: user.id,
        fullName: defaults.fullName,
        tagline: defaults.tagline,
        homePageData: JSON.parse(JSON.stringify(defaults.homePageData)),
        aboutPageData: JSON.parse(JSON.stringify(defaults.aboutPageData)),
        theme: JSON.parse(JSON.stringify(defaults.theme)),
      }
    });

    // Create a password-setup token (store only a hash)
    const token = crypto.randomBytes(32).toString('base64url');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await db.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    // Build the welcome/setup URL
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000';
    const proto = request.headers.get('x-forwarded-proto') || (host.startsWith('localhost') ? 'http' : 'https');
    const origin = `${proto}://${host}`;
    const setupUrl = `${origin}/welcome?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

    // Send the welcome email
    const resend = getResend();
    await resend.emails.send({
      from: getResendFromEmail(),
      to: email,
      subject: 'Welcome! Set up your portfolio account',
      text:
        `You've been invited to create your portfolio.\n\n` +
        `Click the link below to set your password and get started (valid for 7 days):\n${setupUrl}\n\n` +
        `If you didn't expect this invitation, you can ignore this email.`,
    });

    return NextResponse.json({ success: true, message: 'Invitation sent' });
  } catch (error) {
    console.error('invite-user error:', error);
    return NextResponse.json(
      { error: 'Failed to invite user' },
      { status: 500 }
    );
  }
}
