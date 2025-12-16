import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDefaultProfileData } from '@/lib/profile.server';

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

    if (currentUserProfile?.domain !== 'macm.dev') {
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

    // TODO: Send email with password reset link
    // For now, just return success - admin can trigger password reset

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('invite-user error:', error);
    return NextResponse.json(
      { error: 'Failed to invite user' },
      { status: 500 }
    );
  }
}
