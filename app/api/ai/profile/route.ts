import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getEffectiveDomain } from "@/lib/utils";
import { getAgentProfile } from "@/lib/agent-profile.server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "https";
  const profile = await getAgentProfile(getEffectiveDomain(host) ?? undefined, protocol + "://" + host);
  if (!profile) return NextResponse.json({ error: "Public profile unavailable" }, { status: 404 });
  return NextResponse.json(profile, {
    headers: { "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=3600" },
  });
}
