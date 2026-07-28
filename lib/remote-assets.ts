function configuredStorageHost(): string | null {
  const raw = process.env.STORAGE_PUBLIC_URL || process.env.STORAGE_ENDPOINT;
  if (!raw) return null;

  try {
    return new URL(raw).hostname.toLowerCase();
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
  return typeof value === "string" && isAllowedAssetUrl(value) ? value : undefined;
}
