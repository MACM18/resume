import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

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

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!; // Use anon key for public auth endpoint

    const redirectTo = 'https://www.macm.dev/update-password';

    // Make a direct HTTP POST request to the Supabase Auth API's recover endpoint
    const response = await fetch(`${supabaseUrl}/auth/v1/recover`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey, // Use apikey header for authentication
      },
      body: JSON.stringify({
        email: email,
        redirect_to: redirectTo,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Supabase Auth API Error:", errorData);
      throw new Error(errorData.message || "Failed to send password reset email via Supabase Auth API.");
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