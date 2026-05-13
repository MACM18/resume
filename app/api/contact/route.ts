import { NextRequest, NextResponse } from 'next/server';
import { getResend, getResendFromEmail } from '@/lib/resend.server';

export const dynamic = 'force-dynamic';

async function verifyRecaptcha(token: string) {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (!secretKey) return true; // Skip if no secret key configured

  try {
    const response = await fetch(
      'https://www.google.com/recaptcha/api/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${secretKey}&response=${token}`,
      }
    );
    const data = await response.json();
    return data.success && data.score >= 0.5;
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return false;
  }
}

function generateEmailHtml(name: string, email: string, message: string, domain: string) {
  const date = new Date().toLocaleString('en-US', { 
    timeZone: 'UTC',
    dateStyle: 'full',
    timeStyle: 'long'
  });
  
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 32px 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.025em;">New Inquiry Received</h1>
        <p style="color: rgba(255, 255, 255, 0.8); margin: 8px 0 0; font-size: 14px;">Inquiry from your portfolio network</p>
      </div>
      <div style="padding: 40px; background-color: #ffffff;">
        <div style="margin-bottom: 32px;">
          <h2 style="font-size: 18px; font-weight: 700; color: #1e293b; margin: 0 0 16px;">Contact Information</h2>
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #f1f5f9;">
            <div style="margin-bottom: 12px;">
              <span style="display: block; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 600;">Full Name</span>
              <span style="color: #1e293b; font-size: 16px; font-weight: 500;">${name}</span>
            </div>
            <div>
              <span style="display: block; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 600;">Email Address</span>
              <a href="mailto:${email}" style="color: #2563eb; font-size: 16px; font-weight: 500; text-decoration: none;">${email}</a>
            </div>
          </div>
        </div>
        
        <div style="margin-bottom: 32px;">
          <h2 style="font-size: 18px; font-weight: 700; color: #1e293b; margin: 0 0 16px;">Message Content</h2>
          <div style="color: #334155; line-height: 1.7; white-space: pre-wrap; font-size: 15px; background-color: #f8fafc; padding: 24px; border-radius: 8px; border: 1px solid #f1f5f9;">${message}</div>
        </div>
        
        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 40px 0;">
        
        <div style="background-color: #f1f5f9; padding: 16px; border-radius: 6px;">
          <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
            <tr>
              <td style="padding: 4px 0; color: #64748b;">Source Domain</td>
              <td style="text-align: right; padding: 4px 0; color: #1e293b; font-weight: 600;">${domain}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #64748b;">Timestamp (UTC)</td>
              <td style="text-align: right; padding: 4px 0; color: #1e293b; font-weight: 600;">${date}</td>
            </tr>
          </table>
        </div>
      </div>
      <div style="background-color: #f8fafc; padding: 32px 20px; text-align: center; border-top: 1px solid #f1f5f9;">
        <div style="margin-bottom: 12px;">
          <span style="color: #1e293b; font-size: 18px; font-weight: 800; letter-spacing: 0.1em;">MACM</span>
        </div>
        <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: 500;">Premium Portfolio Architecture</p>
        <p style="margin: 8px 0 0; color: #94a3b8; font-size: 11px;">© ${new Date().getFullYear()} MACM System. All rights reserved.</p>
      </div>
    </div>
  `;
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, message, recipientEmail, recaptchaToken } = await request.json();

    if (!name || !email || !message || !recipientEmail) {
      return NextResponse.json(
        { error: 'name, email, message, and recipientEmail are required' },
        { status: 400 }
      );
    }

    // Verify reCAPTCHA
    const isHuman = await verifyRecaptcha(recaptchaToken);
    if (!isHuman && process.env.RECAPTCHA_SECRET_KEY) {
      return NextResponse.json(
        { error: 'reCAPTCHA verification failed. Please try again.' },
        { status: 403 }
      );
    }

    const domain = request.headers.get('host') || 'unknown';
    const htmlContent = generateEmailHtml(name, email, message, domain);

    const resend = getResend();
    await resend.emails.send({
      from: getResendFromEmail(),
      to: recipientEmail,
      replyTo: email,
      subject: `New contact from ${name} [${domain}]`,
      html: htmlContent,
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
