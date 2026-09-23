import { NextResponse } from "next/server";

// Accounts are provisioned during installation; public registration is disabled.
export async function POST() {
  return NextResponse.json({ error: "Registration is closed" }, { status: 403 });
}
