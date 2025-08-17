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

    // This is the central, whitelisted URL where users will update their password.
    const redirectTo = 'https://www.macm.dev/update-password';

    // Use the dedicated `resetPasswordForEmail` method.
    // This method correctly generates the link AND sends the email via your configured SMTP provider.
    const { error } = await supabaseAdmin.auth.admin.resetPasswordForEmail(email, {
      redirectTo: redirectTo,
    });

    if (error) {
      // Log the specific error for better debugging
      console.error("Error from resetPasswordForEmail:", error);
      throw error;
    }

    return new Response(JSON.stringify({ message: "Password reset email sent successfully." }), {
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