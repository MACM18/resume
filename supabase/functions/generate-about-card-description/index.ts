import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Groq from "https://esm.sh/groq-sdk@0.3.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { about_story } = await req.json();

    if (!about_story || !Array.isArray(about_story) || about_story.length === 0) {
      return new Response(JSON.stringify({ error: "Missing or invalid 'about_story' in request body." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const groq = new Groq({ apiKey: Deno.env.get("GROQ_API_KEY") });

    const storyText = about_story.join('\n\n'); // Join paragraphs for the prompt

    const completion = await groq.chat.completions.create({
      model: "llama3-8b-8192", // Using a fast and efficient Groq model
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that summarizes personal stories for a professional portfolio's 'About Me' card. Provide a concise, single-paragraph summary (2-3 sentences) that highlights key aspects of the story. Do not include any introductory or concluding remarks.",
        },
        {
          role: "user",
          content: `Summarize the following personal story for an 'About Me' card on a portfolio homepage:\n\n${storyText}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 100,
    });

    const generatedDescription = completion.choices[0].message.content;

    return new Response(JSON.stringify({ about_card_description: generatedDescription }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error("Error generating about card description:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});