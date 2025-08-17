import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@latest'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Fetch all users from Auth
    const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    if (usersError) throw usersError;

    // Fetch all profiles to get domain info
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, domain');
    if (profilesError) throw profilesError;

    // Create a map for quick profile lookup
    const profileMap = new Map(profiles.map(p => [p.id, p.domain]));

    // Combine user and profile data
    const combinedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      domain: profileMap.get(user.id) || 'Not Claimed',
      created_at: user.created_at,
      email_confirmed_at: user.email_confirmed_at,
    }));

    return new Response(JSON.stringify(combinedUsers), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error in get-all-users function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})