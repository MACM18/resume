/** Treat the legacy generic placeholder as missing project media. */
export function projectImageUrl(value: string | null | undefined): string | null {
  const image = value?.trim();
  if (!image) return null;

  const pathname = image.split(/[?#]/, 1)[0].replace(/\/+$/, "").toLowerCase();
  if (pathname.split("/").pop() === "placeholder.svg") return null;
  return image;
}
