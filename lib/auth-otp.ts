import crypto from "crypto";
import { AuthOtpPurpose } from "@prisma/client";

export const OTP_TTL_MS = 15 * 60 * 1000;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_REQUEST_COOLDOWN_MS = 60 * 1000;

function getOtpSecret(): string {
  return process.env.NEXTAUTH_SECRET || "development-only-otp-secret";
}

export function generateOtp(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

export function hashOtp(code: string): string {
  return crypto
    .createHmac("sha256", getOtpSecret())
    .update(code)
    .digest("hex");
}

export function isValidOtp(code: string, expectedHash: string): boolean {
  const actual = Buffer.from(hashOtp(code), "hex");
  const expected = Buffer.from(expectedHash, "hex");
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

export function isOtpPurpose(value: string): value is AuthOtpPurpose {
  return value === AuthOtpPurpose.PASSWORD_RESET || value === AuthOtpPurpose.EMAIL_CHANGE;
}

export function isValidOtpFormat(code: unknown): code is string {
  return typeof code === "string" && /^\d{6}$/.test(code);
}
