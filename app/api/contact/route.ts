import { NextRequest, NextResponse } from 'next/server';
import { getResend, getResendFromEmail } from '@/lib/resend.server';

export const dynamic = 'force-dynamic';

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
      from: getResendFromEmail(),
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
