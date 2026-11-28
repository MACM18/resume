/** Treat the legacy generic placeholder as missing project media. */
export function projectImageUrl(value: string | null | undefined): string | null {
  const image = value?.trim();
  if (!image) return null;

  const queryIndex = image.indexOf("?");
  const hashIndex = image.indexOf("#");
  let pathEnd = Math.min(
    queryIndex === -1 ? image.length : queryIndex,
    hashIndex === -1 ? image.length : hashIndex,
  );

  while (pathEnd > 0 && image[pathEnd - 1] === "/") pathEnd -= 1;

  const segmentStart = pathEnd > 0 ? image.lastIndexOf("/", pathEnd - 1) + 1 : 0;
  if (image.slice(segmentStart, pathEnd).toLowerCase() === "placeholder.svg") return null;
  return image;
}
