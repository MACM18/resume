import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import net from "net";

function isAllowedImageUrl(rawUrl: string): URL | null {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }

  const protocol = url.protocol.toLowerCase();
  if (protocol !== "http:" && protocol !== "https:") {
    return null;
  }

  const hostname = url.hostname.toLowerCase();

  // Disallow localhost and common internal host patterns to mitigate SSRF
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal")
  ) {
    return null;
  }

  // Disallow direct access to private, loopback, and link-local IP ranges
  const ipVersion = net.isIP(hostname);
  if (ipVersion === 4) {
    const octets = hostname.split(".").map((part) => parseInt(part, 10));
    if (octets.length === 4 && octets.every((n) => !Number.isNaN(n))) {
      const [o1, o2] = octets;
      // 127.0.0.0/8 loopback
      if (o1 === 127) {
        return null;
      }
      // 10.0.0.0/8 private
      if (o1 === 10) {
        return null;
      }
      // 172.16.0.0/12 private
      if (o1 === 172 && o2 >= 16 && o2 <= 31) {
        return null;
      }
      // 192.168.0.0/16 private
      if (o1 === 192 && o2 === 168) {
        return null;
      }
      // 169.254.0.0/16 link-local
      if (o1 === 169 && o2 === 254) {
        return null;
      }
    } else {
      return null;
    }
  } else if (ipVersion === 6) {
    const normalized = hostname;
    // Block IPv6 loopback
    if (normalized === "::1") {
      return null;
    }
    // Block IPv6 link-local fe80::/10 and unique local fc00::/7
    const lower = normalized.toLowerCase();
    if (lower.startsWith("fe80:") || lower.startsWith("fe81:") || lower.startsWith("fe82:") || lower.startsWith("fe83:") || lower.startsWith("fe84:") || lower.startsWith("fe85:") || lower.startsWith("fe86:") || lower.startsWith("fe87:") || lower.startsWith("fe88:") || lower.startsWith("fe89:") || lower.startsWith("fe8a:") || lower.startsWith("fe8b:") || lower.startsWith("fe8c:") || lower.startsWith("fe8d:") || lower.startsWith("fe8e:") || lower.startsWith("fe8f:")) {
      return null;
    }
    if (lower.startsWith("fc") || lower.startsWith("fd")) {
      return null;
    }
  }

  return url;
}

async function bufferFromUrl(url: URL): Promise<Buffer> {
  const response = await fetch(url.toString());
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

    const allowedUrl = isAllowedImageUrl(imageUrl);
    if (!allowedUrl) {
      return NextResponse.json(
        { error: "Invalid or disallowed image URL" },
        { status: 400 }
      );
    }

    // Fetch the image buffer
    const imageBuffer = await bufferFromUrl(allowedUrl);

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