import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

async function bufferFromUrl(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get("url");

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Missing image URL parameter" },
        { status: 400 }
      );
    }

    // Fetch the image buffer
    const imageBuffer = await bufferFromUrl(imageUrl);

    // Process with Sharp: auto-rotate based on EXIF, strip metadata, convert to JPEG
    const processedBuffer = await sharp(imageBuffer)
      .rotate() // Auto-rotate based on EXIF orientation
      .jpeg({ quality: 90 }) // Convert to JPEG with good quality
      .toBuffer();

    // Return the processed image
    return new Response(new Uint8Array(processedBuffer), {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable", // Cache for 1 year
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