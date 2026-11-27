import test from "node:test";
import assert from "node:assert/strict";
import { contrastRatioFromHex, hslStringToHex, readableTextHsl } from "../lib/colors";
import { createSiteTheme, paletteOptions, type SiteMode } from "../lib/site-palettes";

test("calculates WCAG contrast for known colors and rejects malformed hex", () => {
  assert.equal(contrastRatioFromHex("#000000", "#ffffff"), 21);
  assert.equal(contrastRatioFromHex("not-a-color", "#ffffff"), null);
});

test("chooses accessible button text for dark, light, and mid-tone surfaces", () => {
  for (const surface of ["#000000", "#ffffff", "#087e91", "#777777", "#ff00ff"]) {
    const text = hslStringToHex(readableTextHsl(surface));
    assert.ok((contrastRatioFromHex(surface, text) ?? 0) >= 4.5, `${surface} should have readable text`);
  }
});

test("fixed palettes meet 4.5:1 for body copy and button labels in both modes", () => {
  const modes: SiteMode[] = ["light", "dark"];
  for (const palette of paletteOptions) {
    for (const mode of modes) {
      const theme = createSiteTheme(palette.id, mode);
      const checks = [
        ["--foreground", "--background", "body text"],
        ["--primary-foreground", "--primary", "primary button label"],
        ["--secondary-foreground", "--secondary", "secondary button label"],
      ] as const;
      for (const [foreground, background, label] of checks) {
        const ratio = contrastRatioFromHex(hslStringToHex(theme[foreground]), hslStringToHex(theme[background]));
        assert.ok((ratio ?? 0) >= 4.5, `${palette.name} ${mode} ${label}: ${ratio}:1`);
      }
    }
  }
});
