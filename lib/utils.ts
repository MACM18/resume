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
