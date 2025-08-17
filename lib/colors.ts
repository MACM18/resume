export function hslStringToHex(hslString: string): string {
  const [h, s, l] = hslString.split(" ").map(parseFloat);
  const sDecimal = s / 100;
  const lDecimal = l / 100;
  const c = (1 - Math.abs(2 * lDecimal - 1)) * sDecimal;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lDecimal - c / 2;
  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) { [r, g, b] = [c, x, 0]; }
  else if (60 <= h && h < 120) { [r, g, b] = [x, c, 0]; }
  else if (120 <= h && h < 180) { [r, g, b] = [0, c, x]; }
  else if (180 <= h && h < 240) { [r, g, b] = [0, x, c]; }
  else if (240 <= h && h < 300) { [r, g, b] = [x, 0, c]; }
  else if (300 <= h && h < 360) { [r, g, b] = [c, 0, x]; }

  const toHex = (c: number) => {
    const hex = Math.round((c + m) * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function hexToHslString(hex: string): string {
  const r = parseInt(hex.substring(1, 3), 16) / 255;
  const g = parseInt(hex.substring(3, 5), 16) / 255;
  const b = parseInt(hex.substring(5, 7), 16) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return `${h} ${s}% ${l}%`;
}