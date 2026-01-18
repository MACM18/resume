import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("profileId");

    if (!profileId) {
      return NextResponse.json(
        { error: "Missing profileId parameter" },
        { status: 400 }
      );
    }

    // 1. Fetch from Database (The Trusted Source)
    // This removes the SSRF risk because the user cannot provide an arbitrary URL
    const profile = await db.profile.findUnique({
      where: { id: profileId },
      select: { avatarUrl: true },
    });

    if (!profile?.avatarUrl) {
      return NextResponse.json(
        { error: "Profile or avatar not found" },
        { status: 404 }
      );
    }

    // 2. Fetch the image from the URL stored in your DB
    const response = await fetch(profile.avatarUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch source image: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    // 3. Process with Sharp
    const processedBuffer = await sharp(imageBuffer)
      .rotate() // Auto-rotate based on EXIF orientation
      .resize(1200, 630, { 
        fit: "contain", 
        background: { r: 255, g: 255, b: 255, alpha: 0 } 
      }) // Standard OG size
      .jpeg({ quality: 90 })
      .toBuffer();

    // 4. Return the processed image
    return new Response(new Uint8Array(processedBuffer), {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable", // Cache for 1 year
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Error processing OG image:", error);
    return NextResponse.json(
      { error: "Failed to process image" },
      { status: 500 }
    );
  }
}