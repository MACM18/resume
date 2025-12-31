import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const gradients = await db.gradient.findMany({ orderBy: { createdAt: "asc" } });
    return NextResponse.json(gradients);
  } catch (error) {
    console.error("Error fetching gradients:", error);
    return NextResponse.json({ error: "Failed to fetch gradients" }, { status: 500 });
  }
}
