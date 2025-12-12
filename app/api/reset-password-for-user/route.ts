import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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

    // Find the user
    const user = await db.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate a new temporary password
    const tempPassword = Math.random().toString(36).slice(-12);
    const passwordHash = await hashPassword(tempPassword);

    // Update user's password
    await db.user.update({
      where: { email },
      data: { passwordHash }
    });

    // TODO: Send email with the new temporary password
    // For now, return the temporary password to the admin
    // In production, you'd want to send this via email instead

    return NextResponse.json({ 
      success: true,
      message: 'Password has been reset',
      // Only include temp password in development/staging
      tempPassword: process.env.NODE_ENV !== 'production' ? tempPassword : undefined
    });
  } catch (error) {
    console.error('reset-password-for-user error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
