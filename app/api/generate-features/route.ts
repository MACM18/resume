import { NextRequest, NextResponse } from 'next/server';
import { groq } from '@/lib/groq';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { long_description } = await request.json();

    if (!long_description || typeof long_description !== 'string') {
      return NextResponse.json(
        { error: 'long_description is required' },
        { status: 400 }
      );
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant that extracts key features from project descriptions. Return a JSON array of 3-6 concise feature strings. Only output valid JSON, no extra text.',
        },
        {
          role: 'user',
          content: `Extract key features from this project description:\n\n${long_description}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 512,
    });

    const text = completion.choices[0]?.message?.content?.trim() ?? '[]';
    // Parse JSON array from response
    let features: string[] = [];
    try {
      features = JSON.parse(text);
      if (!Array.isArray(features)) features = [];
    } catch {
      // Fallback: split by newline if not valid JSON
      features = text.split('\n').filter((f: string) => f.trim().length > 0);
    }

    return NextResponse.json({ key_features: features });
  } catch (error) {
    console.error('generate-features error:', error);
    return NextResponse.json(
      { error: 'Failed to generate features' },
      { status: 500 }
    );
  }
}
