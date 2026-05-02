import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Prevent static generation - this route needs runtime env vars
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is super admin (has macm.dev domain)
    const currentUserProfile = await db.profile.findFirst({
      where: {
        user: { email: session.user.email }
      },
      include: { domains: true }
    });

    if (!currentUserProfile?.domains?.some(d => d.domain === 'macm.dev')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all users with their profiles
    const users = await db.user.findMany({
      include: {
        profile: {
          include: { domains: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const result = users.map((u) => ({
      id: u.id,
      email: u.email,
      domain: u.profile?.domains?.find((d) => d.isPrimary)?.domain || u.profile?.domains?.[0]?.domain || '',
      created_at: u.createdAt.toISOString(),
      email_confirmed_at: u.emailVerified?.toISOString() ?? null,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('get-all-users error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
