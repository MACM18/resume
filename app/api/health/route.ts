import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const service = "portfolio-nextjs";
const headers = { "Cache-Control": "no-store" };

export async function GET(request: NextRequest) {
  const expectedToken = process.env.HEALTH_CHECK_TOKEN;

  if (!expectedToken) {
    return NextResponse.json({ status: "unavailable" }, { status: 503, headers });
  }

  const authorization = request.headers.get("authorization");
  const providedToken = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : "";
  const provided = Buffer.from(providedToken);
  const expected = Buffer.from(expectedToken);

  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ status: "unavailable", service, db: "unavailable" }, { status: 503, headers });
  }

  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", service, db: "ok" }, { status: 200, headers });
  } catch (error) {
    console.error("Health check DB error:", error);
    return NextResponse.json({ status: "unavailable", service, db: "unavailable" }, { status: 503, headers });
  }
}
