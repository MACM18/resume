import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

let _resend: Resend | null = null;

function getResend(): Resend {
  if (_resend) return _resend;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('Missing RESEND_API_KEY environment variable');
  }
  _resend = new Resend(apiKey);
  return _resend;
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, message, recipientEmail } = await request.json();

    if (!name || !email || !message || !recipientEmail) {
      return NextResponse.json(
        { error: 'name, email, message, and recipientEmail are required' },
        { status: 400 }
      );
    }

    const resend = getResend();
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? 'noreply@resend.dev',
      to: recipientEmail,
      replyTo: email,
      subject: `New contact from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('contact error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
