import { getStorageMainDomain, resolveStorageUrl } from "./storage-urls";

function configuredStorageHost(): string | null {
  try {
    return new URL(getStorageMainDomain()).hostname.toLowerCase();
  } catch {
    return null;
  }
}

export function isAllowedAssetUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (!(["http:", "https:"] as string[]).includes(url.protocol)) return false;
    if (url.username || url.password || url.port || url.pathname.includes("..")) {
      return false;
    }

    const allowedHosts = new Set([
      "storage.macm.dev",
      "storage.macm.lk",
      "macm.dev",
      "macm.lk",
      configuredStorageHost(),
    ]);

    return allowedHosts.has(url.hostname.toLowerCase());
  } catch {
    return false;
  }
}

export function safeAssetUrl(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;

  const resolved = resolveStorageUrl(value);
  if (!resolved) return undefined;

  // Local site assets like /placeholder.svg
  if (resolved.startsWith("/") && !resolved.startsWith("//")) {
    return resolved;
  }

  return isAllowedAssetUrl(resolved) ? resolved : undefined;
}
