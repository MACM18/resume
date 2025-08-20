import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Groq from "https://esm.sh/groq-sdk@0.3.0"; // Import Groq SDK

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { long_description } = await req.json();

    if (!long_description) {
      return new Response(JSON.stringify({ error: "Missing long_description in request body." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Initialize Groq client with API key from environment variables
    const groq = new Groq({ apiKey: Deno.env.get("GROQ_API_KEY") });

    const completion = await groq.chat.completions.create({
      model: "llama3-8b-8192", // Using a fast and efficient Groq model
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that extracts key features from project descriptions. Provide a concise list of 3-5 bullet points. Respond only with the bullet points, each on a new line, without any introductory or concluding remarks. Each bullet point should be a single sentence.",
        },
        {
          role: "user",
          content: `Extract key features from the following project description:\n\n${long_description}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    const featuresText = completion.choices[0].message.content;
    const features = featuresText
      ? featuresText.split('\n').map(line => line.replace(/^- /, '').trim()).filter(line => line.length > 0)
      : [];

    return new Response(JSON.stringify({ key_features: features }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error("Error generating features:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});