import { NextRequest, NextResponse } from 'next/server';
import { groq } from '@/lib/groq';

export async function POST(request: NextRequest) {
  try {
    const { about_story } = await request.json();

    if (!about_story || !Array.isArray(about_story)) {
      return NextResponse.json(
        { error: 'about_story (array) is required' },
        { status: 400 }
      );
    }

    const storyText = about_story.join('\n');

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content:
            'You are a copywriter. Given a personal story, write a 1-2 sentence about card description that is engaging and professional. Output only the description text, no quotes or extra formatting.',
        },
        {
          role: 'user',
          content: `Write an about card description from this story:\n\n${storyText}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 256,
    });

    const description =
      completion.choices[0]?.message?.content?.trim() ?? '';

    return NextResponse.json({ about_card_description: description });
  } catch (error) {
    console.error('generate-about-card-description error:', error);
    return NextResponse.json(
      { error: 'Failed to generate description' },
      { status: 500 }
    );
  }
}
