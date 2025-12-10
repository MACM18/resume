import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format a date string (YYYY-MM-DD or ISO) or Date into "MMM YYYY" (e.g., "Jan 2024")
export function formatMonthYear(date: string | Date | null | undefined) {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    year: "numeric",
  }).format(d);
}

// Format a range like "MMM YYYY – Present" or "MMM YYYY – MMM YYYY"
export function formatDateRange(
  start: string | Date | null | undefined,
  end?: string | Date | null | undefined,
  isCurrent?: boolean
) {
  const startStr = formatMonthYear(start);
  const endStr = isCurrent || !end ? "Present" : formatMonthYear(end);
  return `${startStr} – ${endStr}`;
}

/**
 * Normalize a domain/hostname by removing common prefixes like www.
 * This ensures consistent domain matching regardless of how the user accesses the site.
 * Examples:
 *   - "www.example.com" -> "example.com"
 *   - "example.com" -> "example.com"
 *   - "WWW.EXAMPLE.COM" -> "example.com"
 *   - "localhost" -> "localhost"
 *   - "localhost:3000" -> "localhost"
 */
export function normalizeDomain(domain: string): string {
  if (!domain) return "";
  
  // Convert to lowercase
  let normalized = domain.toLowerCase().trim();
  
  // Remove port number if present (e.g., localhost:3000 -> localhost)
  normalized = normalized.split(":")[0];
  
  // Remove common prefixes
  const prefixesToRemove = ["www.", "www2.", "www3."];
  for (const prefix of prefixesToRemove) {
    if (normalized.startsWith(prefix)) {
      normalized = normalized.slice(prefix.length);
      break;
    }
  }
  
  return normalized;
}

/**
 * Get the effective domain used for data lookups.
 * - Normalizes hostname
 * - If hostname resolves to 'localhost', use a fallback domain from env
 *   (NEXT_PUBLIC_FALLBACK_DOMAIN) when available.
 */
export function getEffectiveDomain(hostname?: string): string | null {
  const normalized = normalizeDomain(hostname || "");
  if (!normalized || normalized === 'localhost') {
    return null;
  }
  return normalized;
}
