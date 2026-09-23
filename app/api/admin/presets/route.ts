import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getOwnerSession } from "@/lib/site-owner";
import { applyMacmPreset, presetSections, type PresetMode, type PresetSection } from "@/lib/macm-presets.server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function allowed() {
  if (process.env.OWNER !== "MACM") return null;
  return getOwnerSession();
}

export async function GET() {
  if (process.env.OWNER !== "MACM") return new NextResponse(null, { status: 404 });
  if (!(await allowed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ enabled: true, capturedAt: "2026-09-23" });
}

export async function POST(request: NextRequest) {
  if (process.env.OWNER !== "MACM") return new NextResponse(null, { status: 404 });
  const session = await allowed();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (request.headers.get("content-type")?.split(";")[0] !== "application/json" || request.headers.get("x-macm-preset") !== "apply") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const body = await request.json().catch(() => null);
  const section = body?.section as PresetSection;
  const mode = body?.mode as PresetMode;
  if (body?.confirm !== "APPLY" || !presetSections.includes(section) || !["fill", "recommended"].includes(mode)) {
    return NextResponse.json({ error: "Invalid preset action" }, { status: 400 });
  }
  try {
    const result = await applyMacmPreset(session.user.id, section, mode);
    for (const path of ["/", "/about", "/projects", "/resume", "/gallery", "/contact", "/admin"]) revalidatePath(path);
    revalidatePath("/projects/[id]", "page");
    return NextResponse.json(result);
  } catch (error) {
    console.error("MACM preset failed:", error);
    return NextResponse.json({ error: "Preset failed. Check the current content before retrying." }, { status: 500 });
  }
}
