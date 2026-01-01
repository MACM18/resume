import { Resend } from "resend";

let _resend: Resend | null = null;

export function getResend(): Resend {
  if (_resend) return _resend;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY environment variable");
  }
  _resend = new Resend(apiKey);
  return _resend;
}

export function getResendFromEmail(): string {
  return process.env.RESEND_FROM_EMAIL ?? "noreply@resend.dev";
}
