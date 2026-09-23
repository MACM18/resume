import { NextResponse } from "next/server";

export async function DELETE() {
  return NextResponse.json({ error: "Domain management is disabled" }, { status: 410 });
}
