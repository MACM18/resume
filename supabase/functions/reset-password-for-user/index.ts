import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
// Use @latest to ensure we get the most recent version and bypass caches
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

    const redirectTo = 'https://www.macm.dev/update-password';

    // This is the most direct and reliable method to send a password reset email.
    const { data, error } = await supabaseAdmin.auth.admin.resetPasswordForEmail(email, {
      redirectTo: redirectTo,
    });

    if (error) {
      console.error("Error from Supabase resetPasswordForEmail:", JSON.stringify(error, null, 2));
      throw error;
    }

    return new Response(JSON.stringify({ message: "Password reset email sent successfully." }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Caught an error in the main try-catch block:", JSON.stringify(error, null, 2));
    const errorMessage = error.message || "An unknown server error occurred.";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})