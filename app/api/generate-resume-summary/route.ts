import { NextRequest, NextResponse } from 'next/server';
import { groq } from '@/lib/groq';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { resume, profile, projects } = await request.json();

    if (!resume || !profile) {
      return NextResponse.json(
        { error: 'resume and profile are required' },
        { status: 400 }
      );
    }

    const context = `
Profile:
Name: ${profile.full_name ?? 'N/A'}
Tagline: ${profile.tagline ?? ''}
About: ${JSON.stringify(profile.about_page_data ?? {})}

Resume Data:
Skills: ${Array.isArray(resume.skills) ? resume.skills.join(', ') : resume.skills}
Experience: ${JSON.stringify(resume.experience ?? [])}

Projects: ${JSON.stringify(projects ?? [])}
`.trim();

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content:
            'You are a professional resume writer. Given profile, experience, and projects, write a compelling 2-4 sentence professional summary. Output only the summary text.',
        },
        {
          role: 'user',
          content: `Write a professional summary based on:\n\n${context}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    const summary = completion.choices[0]?.message?.content?.trim() ?? '';

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('generate-resume-summary error:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}
