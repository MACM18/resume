import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'email is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('invite-user error:', error);
    return NextResponse.json(
      { error: 'Failed to invite user' },
      { status: 500 }
    );
  }
}
