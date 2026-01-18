import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("profileId");

    if (!profileId) {
      return NextResponse.json({ error: "Missing profileId" }, { status: 400 });
    }

    const profile = await db.profile.findUnique({
      where: { id: profileId },
      select: { 
        avatarUrl: true,
        avatarPosition: true, 
        avatarZoom: true,    
      },
    });

    if (!profile?.avatarUrl) {
      return NextResponse.json({ error: "Avatar not found" }, { status: 404 });
    }

    const response = await fetch(profile.avatarUrl);
    if (!response.ok) throw new Error("Fetch failed");

    const arrayBuffer = await response.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    // --- Dynamic Parameters ---
    const targetSize = 512;
    const zoom = (profile.avatarZoom ?? 100) / 100; // e.g., 1.2
    const posX = (profile.avatarPosition as { x: number; y: number })?.x ?? 50; // percentage 0-100
    const posY = (profile.avatarPosition as { x: number; y: number })?.y ?? 50; // percentage 0-100

    // 1. Get metadata to handle the original aspect ratio
    const pipeline = sharp(imageBuffer).rotate(); // Apply EXIF rotation first
    const metadata = await pipeline.metadata();
    
    if (!metadata.width || !metadata.height) throw new Error("Invalid metadata");

    // 2. Calculate the Resize dimensions to fill the square (Object-Fit: Cover)
    // Then multiply by zoom
    const baseScale = Math.max(targetSize / metadata.width, targetSize / metadata.height);
    const scaledWidth = Math.round(metadata.width * baseScale * zoom);
    const scaledHeight = Math.round(metadata.height * baseScale * zoom);

    // 3. Calculate Crop Position (Object-Position)
    // We calculate how much "extra" image we have and use the % to find the top/left
    const left = Math.round((scaledWidth - targetSize) * (posX / 100));
    const top = Math.round((scaledHeight - targetSize) * (posY / 100));

    // 4. Execute Pipeline
    const processedBuffer = await pipeline
      .resize(scaledWidth, scaledHeight)
      .extract({
        left: Math.max(0, Math.min(left, scaledWidth - targetSize)),
        top: Math.max(0, Math.min(top, scaledHeight - targetSize)),
        width: targetSize,
        height: targetSize,
      })
      .jpeg({ quality: 90 })
      .toBuffer();

    return new Response(new Uint8Array(processedBuffer), {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("OG Processing Error:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}