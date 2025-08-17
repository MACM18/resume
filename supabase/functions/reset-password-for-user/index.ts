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
    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Step 1: Verify the user exists before attempting to reset the password.
    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserByEmail(email);

    if (userError || !user) {
      // For an admin panel, it's better to be explicit about the error.
      console.error(`Password reset attempted for non-existent user: ${email}`, userError);
      return new Response(JSON.stringify({ error: `User with email ${email} not found.` }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
      });
    }

    const redirectTo = 'https://www.macm.dev/update-password';

    // Step 2: Proceed with the password reset.
    const { error: resetError } = await supabaseAdmin.auth.admin.resetPasswordForEmail(email, {
      redirectTo: redirectTo,
    });

    if (resetError) {
      console.error("Error from resetPasswordForEmail:", resetError);
      throw resetError;
    }

    return new Response(JSON.stringify({ message: "Password reset email sent successfully." }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Full error object in reset password function:", JSON.stringify(error, null, 2));
    return new Response(JSON.stringify({ error: error.message || "An unknown server error occurred." }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})