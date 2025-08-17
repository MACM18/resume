import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { email } = await req.json();
    if (!email) throw new Error("Email is required.");

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 1. Find the user by email to get their ID
    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserByEmail(email);
    if (userError || !user) throw new Error('User not found.');

    // 2. Find the user's profile to get their claimed domain
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('domain')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') throw profileError;

    // 3. Dynamically construct the redirect URL
    const userDomain = profile?.domain;
    let redirectTo;
    if (userDomain) {
      // Handle localhost for development and https for production
      const protocol = userDomain.startsWith('localhost') ? 'http://' : 'https://';
      redirectTo = `${protocol}${userDomain}/update-password`;
    } else {
      // Fallback for users who haven't claimed a domain yet
      redirectTo = 'https://www.macm.dev/update-password';
    }

    // 4. Generate the secure, single-use recovery link with the correct URL
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: "recovery",
        email: email,
        redirectTo: redirectTo
    });
    if (linkError) throw linkError;

    const resetLink = linkData.properties.action_link;

    // 5. Manually send the email using the Resend API
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) throw new Error("RESEND_API_KEY is not configured.");

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'Portfolio Password Reset <security@macm.dev>',
        to: email,
        subject: 'Reset Your Portfolio Password',
        html: `
          <p>Hello,</p>
          <p>A password reset was requested for your portfolio account. Please click the link below to set a new password:</p>
          <p><a href="${resetLink}">Reset Your Password</a></p>
          <p>This link will expire in 24 hours. If you did not request this, you can safely ignore this email.</p>
        `,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Resend API Error:', errorData);
      throw new Error(errorData.message || 'Failed to send password reset email.');
    }

    return new Response(JSON.stringify({ message: "Password reset link sent successfully." }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error("Reset password function error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})