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
    const { resume, profile, projects } = await req.json();

    if (!resume || !profile) {
      return new Response(JSON.stringify({ error: "Missing resume or profile data in request body." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const groq = new Groq({ apiKey: Deno.env.get("GROQ_API_KEY") });

    const experienceText = resume.experience.map((exp: any) =>
      `Company: ${exp.company}, Position: ${exp.position}, Duration: ${exp.duration}, Description: ${exp.description.join(' ')}`
    ).join('\n');

    const skillsText = resume.skills.join(', ');

    const educationText = resume.education.map((edu: any) =>
      `Degree: ${edu.degree}, School: ${edu.school}, Year: ${edu.year}`
    ).join('\n');

    const certificationsText = resume.certifications?.map((cert: any) =>
      `Certification: ${cert.name}, Issuer: ${cert.issuer}, Date: ${cert.date}`
    ).join('\n') || 'None';

    const relevantProjects = projects?.filter((p: any) => resume.project_ids.includes(p.id))
      .map((p: any) => `Project: ${p.title}, Description: ${p.description}`)
      .join('\n') || 'None';

    const prompt = `Generate a concise and impactful professional summary for a resume.
    The user's full name is: ${profile.full_name}
    Their professional tagline is: ${profile.tagline}
    Their about page story: ${profile.about_page_data?.story?.join(' ')}

    Here is the resume data for the role "${resume.role}" with title "${resume.title}":
    Experience:
    ${experienceText}

    Skills:
    ${skillsText}

    Education:
    ${educationText}

    Certifications:
    ${certificationsText}

    Relevant Projects:
    ${relevantProjects}

    Based on the above information, write a 3-5 sentence professional summary. Focus on achievements, key skills, and career goals relevant to the role.`;

    const completion = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [
        {
          role: "system",
          content: "You are an expert resume writer. Generate a professional summary based on the provided data. Keep it concise (3-5 sentences) and impactful.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    const generatedSummary = completion.choices[0].message.content;

    return new Response(JSON.stringify({ summary: generatedSummary }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error("Error generating resume summary:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});