import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Lightweight SQL check
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, db: "ok" });
  } catch (err: unknown) {
    console.error("Health check DB error:", err);
    const message = typeof err === "object" && err !== null && "message" in err ? String((err as { message?: unknown }).message) : String(err);
    const name = typeof err === "object" && err !== null && "name" in err ? String((err as { name?: unknown }).name) : "";

    if (message.includes("Environment variable not found: DATABASE_URL") || name === "PrismaClientInitializationError") {
      return NextResponse.json({ ok: false, db: "misconfigured", message: "DATABASE_URL is not configured on the server" }, { status: 500 });
    }
    return NextResponse.json({ ok: false, db: "error", message }, { status: 500 });
  }
}