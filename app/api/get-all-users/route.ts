import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    // Get all users from auth
    const {
      data: { users },
      error: authError,
    } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) throw authError;

    // Get domains from profiles
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('user_id, domain');
    if (profilesError) throw profilesError;

    const domainMap = new Map(
      (profiles ?? []).map((p) => [p.user_id, p.domain])
    );

    const result = (users ?? []).map((u) => ({
      id: u.id,
      email: u.email ?? '',
      domain: domainMap.get(u.id) ?? '',
      created_at: u.created_at,
      email_confirmed_at: u.email_confirmed_at ?? null,
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
