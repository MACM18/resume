/** Fetch a remote resource without allowing a stalled or oversized response to
 * take down a request. This module is server-only by usage.
 */
export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = 8_000,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  let targetUrl: URL;
  try {
    if (input instanceof URL) {
      targetUrl = input;
    } else if (typeof input === "string") {
      targetUrl = new URL(input);
    } else if (input instanceof Request) {
      targetUrl = new URL(input.url);
    } else {
      throw new Error("Unsupported request input");
    }
  } catch {
    throw new Error("Invalid or non-absolute URL");
  }

  if (!["http:", "https:"].includes(targetUrl.protocol)) {
    throw new Error("Only HTTP(S) URLs are allowed");
  }
  if (targetUrl.username || targetUrl.password || targetUrl.port) {
    throw new Error("Credentials and custom ports are not allowed");
  }

  try {
    return await fetch(targetUrl, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export async function readResponseBuffer(
  response: Response,
  maxBytes = 8 * 1024 * 1024,
): Promise<Buffer> {
  const declaredLength = Number(response.headers.get("content-length") || 0);
  if (declaredLength > maxBytes) {
    throw new Error("Remote response exceeds the allowed size");
  }

  if (!response.body) {
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.byteLength > maxBytes) {
      throw new Error("Remote response exceeds the allowed size");
    }
    return buffer;
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel("response too large");
        throw new Error("Remote response exceeds the allowed size");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)));
}
