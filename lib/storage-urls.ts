export const STORAGE_CATEGORIES = [
  "profile-images",
  "background-images",
  "project-images",
  "gallery-images",
  "favicons",
  "resumes",
] as const;

export type StorageCategory = (typeof STORAGE_CATEGORIES)[number];

/**
 * Get the storage main domain (e.g., https://storage.macm.dev)
 */
export function getStorageMainDomain(): string {
  const raw =
    process.env.STORAGE_MAIN_DOMAIN ||
    process.env.NEXT_PUBLIC_STORAGE_MAIN_DOMAIN ||
    process.env.STORAGE_PUBLIC_URL ||
    process.env.NEXT_PUBLIC_STORAGE_URL ||
    process.env.STORAGE_ENDPOINT ||
    "https://storage.macm.dev";

  let trimmed = raw.trim().replace(/\/+$/, "");
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    trimmed = `https://${trimmed}`;
  }
  return trimmed;
}

/**
 * Get the bucket name (e.g., portfolio)
 */
export function getStorageBucket(): string {
  return (process.env.STORAGE_BUCKET || "portfolio")
    .trim()
    .replace(/^\/+|\/+$/g, "");
}

/**
 * Get the folder name inside the bucket (e.g., my-folder), or empty string if root
 */
export function getStorageFolder(): string {
  const folder =
    process.env.STORAGE_FOLDER ||
    process.env.STORAGE_BASE_FOLDER ||
    process.env.STORAGE_PREFIX ||
    "";
  return folder.trim().replace(/^\/+|\/+$/g, "");
}

/**
 * Extracts clean relative image path from a URL or raw path.
 * Only the relative image path (e.g. "profile-images/user_1/abc.webp") is saved to the database.
 *
 * Examples:
 * - "https://storage.macm.dev/portfolio/my-folder/profile-images/user_1/abc.webp" -> "profile-images/user_1/abc.webp"
 * - "https://supabase.macm.dev/storage/v1/object/public/profile-images/user_1/abc.jpeg" -> "profile-images/user_1/abc.jpeg"
 * - "profile-images/user_1/abc.webp" -> "profile-images/user_1/abc.webp"
 * - "/placeholder.svg" -> "/placeholder.svg"
 * - "https://github.com/avatar.png" -> "https://github.com/avatar.png"
 */
export function extractStoragePath(
  value: string | null | undefined,
): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  // Local site paths
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed;
  }

  // Check for known storage categories in the path or URL
  for (const category of STORAGE_CATEGORIES) {
    const idx = trimmed.indexOf(`${category}/`);
    if (idx !== -1) {
      return trimmed.slice(idx);
    }
  }

  // If no storage category matched, return as is (e.g. external links)
  return trimmed;
}

/**
 * Resolves a stored image path into a full public URL:
 * main domain / [foldername /] image path
 * Note: Bucket name is not included in the public URL.
 */
export function resolveStorageUrl(
  value: string | null | undefined,
): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed;
  }
  // Preset and legacy assets may deliberately point at a public CDN.
  // Keep absolute URLs intact; callers that display remote assets validate hosts.
  if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) {
    return trimmed;
  }

  const cleanPath = extractStoragePath(trimmed);
  if (!cleanPath) return null;

  // If it didn't match any storage category and is already an external URL
  if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
    return cleanPath;
  }

  const mainDomain = getStorageMainDomain();
  const folder = getStorageFolder();

  const pathWithFolder = folder ? `${folder}/${cleanPath}` : cleanPath;
  return `${mainDomain}/${pathWithFolder}`;
}
