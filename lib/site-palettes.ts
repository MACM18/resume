import type { Theme } from "@/types/portfolio";

export type SiteMode = "light" | "dark";
export type PaletteId = "ocean" | "violet" | "forest" | "amber";

export const paletteOptions: { id: PaletteId; name: string; description: string; swatch: string }[] = [
  { id: "ocean", name: "Ocean", description: "Clear blue and cyan", swatch: "#087e91" },
  { id: "violet", name: "Violet", description: "Creative purple", swatch: "#7147b6" },
  { id: "forest", name: "Forest", description: "Grounded green", swatch: "#167854" },
  { id: "amber", name: "Amber", description: "Warm orange", swatch: "#a85b09" },
];

const accents: Record<PaletteId, { light: string; dark: string; lightSoft: string; darkSoft: string }> = {
  ocean: { light: "187 90% 28%", dark: "186 88% 70%", lightSoft: "192 78% 31%", darkSoft: "191 75% 72%" },
  violet: { light: "264 49% 42%", dark: "265 82% 78%", lightSoft: "281 40% 39%", darkSoft: "282 74% 79%" },
  forest: { light: "155 70% 28%", dark: "151 65% 71%", lightSoft: "174 57% 28%", darkSoft: "166 65% 73%" },
  amber: { light: "32 91% 31%", dark: "41 93% 72%", lightSoft: "18 74% 34%", darkSoft: "24 91% 74%" },
};

export function getSiteMode(theme: Theme | null | undefined): SiteMode {
  return theme?.["site-mode"] === "light" ? "light" : "dark";
}

export function getPaletteId(theme: Theme | null | undefined): PaletteId {
  const value = theme?.["site-palette"];
  return paletteOptions.some((option) => option.id === value) ? value as PaletteId : "ocean";
}

export function createSiteTheme(palette: PaletteId, mode: SiteMode): Theme {
  const dark = mode === "dark";
  const accent = accents[palette];
  const primary = dark ? accent.dark : accent.light;
  const secondary = dark ? accent.darkSoft : accent.lightSoft;
  const foreground = dark ? "210 30% 95%" : "222 32% 13%";
  const surface = dark ? "222 32% 11%" : "0 0% 100%";
  const accentForeground = dark ? "222 40% 8%" : "0 0% 100%";
  return {
    "site-mode": mode,
    "site-palette": palette,
    "--background": dark ? "222 38% 7%" : "210 33% 98%",
    "--background-secondary": dark ? "222 35% 9%" : "210 27% 95%",
    "--foreground": foreground,
    "--glass-bg": surface,
    "--glass-border": dark ? "215 22% 25%" : "213 24% 82%",
    "--primary": primary,
    "--primary-glow": primary,
    "--primary-foreground": accentForeground,
    "--secondary": secondary,
    "--secondary-glow": secondary,
    "--secondary-foreground": accentForeground,
    "--accent": secondary,
    "--accent-foreground": accentForeground,
    "--hover-glow": primary,
    "--card": surface,
    "--card-foreground": foreground,
    "--border": dark ? "215 22% 22%" : "213 22% 83%",
    "--input": dark ? "215 22% 18%" : "213 21% 91%",
    "--ring": primary,
    "--muted": dark ? "215 22% 17%" : "210 24% 92%",
    "--muted-foreground": dark ? "213 16% 72%" : "215 16% 38%",
    "--destructive": dark ? "0 75% 66%" : "0 72% 38%",
    "--destructive-foreground": accentForeground,
    "--popover": surface,
    "--popover-foreground": foreground,
  };
}
