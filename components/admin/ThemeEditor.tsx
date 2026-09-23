"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, Moon, Sun } from "lucide-react";
import { getCurrentUserProfile, updateCurrentUserProfile } from "@/lib/profile";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/sonner";
import { createSiteTheme, getPaletteId, getSiteMode, paletteOptions, type PaletteId, type SiteMode } from "@/lib/site-palettes";
import { hexToHslString, hslStringToHex } from "@/lib/colors";

export function ThemeEditor() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useQuery({
    queryKey: ["currentUserProfile"],
    queryFn: getCurrentUserProfile,
  });
  const [mode, setMode] = useState<SiteMode>("dark");
  const [palette, setPalette] = useState<PaletteId>("ocean");
  const [customHex, setCustomHex] = useState({ primary: "#087e91", secondary: "#1b8493", background: "#0b111f", foreground: "#edf2f7" });

  useEffect(() => {
    if (profile) {
      setMode(getSiteMode(profile.theme));
      setPalette(getPaletteId(profile.theme));
      const source = profile.theme || {};
      setCustomHex({
        primary: hslStringToHex(source["--primary"] || "187 90% 28%"),
        secondary: hslStringToHex(source["--secondary"] || "192 78% 31%"),
        background: hslStringToHex(source["--background"] || "222 38% 7%"),
        foreground: hslStringToHex(source["--foreground"] || "210 30% 95%"),
      });
    }
  }, [profile]);

  const preset = createSiteTheme(palette, mode);
  const safeHex = (value: string, fallback: string) => /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;
  const preview = {
    ...preset,
    "--primary": hexToHslString(safeHex(customHex.primary, "#087e91")),
    "--secondary": hexToHslString(safeHex(customHex.secondary, "#1b8493")),
    "--accent": hexToHslString(safeHex(customHex.secondary, "#1b8493")),
    "--ring": hexToHslString(safeHex(customHex.primary, "#087e91")),
    "--primary-glow": hexToHslString(safeHex(customHex.primary, "#087e91")),
    "--secondary-glow": hexToHslString(safeHex(customHex.secondary, "#1b8493")),
    "--background": hexToHslString(safeHex(customHex.background, "#0b111f")),
    "--foreground": hexToHslString(safeHex(customHex.foreground, "#edf2f7")),
  };
  const previewStyle = Object.fromEntries(
    Object.entries(preview).filter(([key]) => key.startsWith("--"))
  ) as React.CSSProperties;
  const updateCustomFromPreset = (next: SiteMode, nextPalette: PaletteId) => {
    const nextTheme = createSiteTheme(nextPalette, next);
    setCustomHex({
      primary: hslStringToHex(nextTheme["--primary"]),
      secondary: hslStringToHex(nextTheme["--secondary"]),
      background: hslStringToHex(nextTheme["--background"]),
      foreground: hslStringToHex(nextTheme["--foreground"]),
    });
  };
  const isSaved = profile?.theme?.["site-mode"] === mode && profile?.theme?.["site-palette"] === palette &&
    profile?.theme?.["--primary"] === preview["--primary"] &&
    profile?.theme?.["--background"] === preview["--background"];

  const mutation = useMutation({
    mutationFn: () => updateCurrentUserProfile({ theme: preview }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
      await queryClient.invalidateQueries({ queryKey: ["theme"] });
      router.refresh();
      toast.success("Site appearance updated");
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Could not save site appearance");
    },
  });

  if (isLoading) return <Skeleton className="h-96 w-full" />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Site appearance</h2>
        <p className="mt-1 text-sm text-muted-foreground">Choose a display mode and a tested color palette for every public page.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(300px,0.8fr)]">
        <div className="space-y-6">
          <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
            <h3 className="font-semibold">Display mode</h3>
            <p className="mt-1 text-sm text-muted-foreground">This appearance is shown to visitors on every page.</p>
            <div className="mt-4 grid grid-cols-2 gap-2" role="group" aria-label="Site display mode">
              {([
                { value: "light" as const, label: "Light", Icon: Sun },
                { value: "dark" as const, label: "Dark", Icon: Moon },
              ]).map(({ value, label, Icon }) => (
                <button key={value} type="button" aria-pressed={mode === value} onClick={() => { setMode(value); updateCustomFromPreset(value, palette); }}
                  className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${mode === value ? "border-primary bg-primary/10 text-foreground" : "border-border hover:bg-muted"}`}>
                  <Icon size={17} /> {label}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
            <h3 className="font-semibold">Color palette</h3>
            <p className="mt-1 text-sm text-muted-foreground">Eight fixed accent sets with readable text and surfaces. You can fine-tune the key colors below.</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2" role="group" aria-label="Site color palette">
              {paletteOptions.map((option) => (
                <button key={option.id} type="button" aria-pressed={palette === option.id} onClick={() => { setPalette(option.id); updateCustomFromPreset(mode, option.id); }}
                  className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${palette === option.id ? "border-primary bg-primary/10" : "border-border hover:bg-muted"}`}>
                  <span className="h-9 w-9 shrink-0 rounded-full border border-black/10" style={{ backgroundColor: option.swatch }} />
                  <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{option.name}</span><span className="block text-xs text-muted-foreground">{option.description}</span></span>
                  {palette === option.id && <Check size={16} className="text-primary" aria-hidden="true" />}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
            <h3 className="font-semibold">Custom colors</h3>
            <p className="mt-1 text-sm text-muted-foreground">Enter a hex value or use the color swatch. Contrast is previewed on the right.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {([
                ["primary", "Primary accent"],
                ["secondary", "Secondary accent"],
                ["background", "Page background"],
                ["foreground", "Main text"],
              ] as const).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 rounded-lg border border-border p-2">
                  <input type="color" value={customHex[key]} onChange={(event) => setCustomHex((current) => ({ ...current, [key]: event.target.value }))} className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent p-0" aria-label={label} />
                  <span className="min-w-0 flex-1"><span className="block text-xs font-medium">{label}</span><input value={customHex[key]} onChange={(event) => setCustomHex((current) => ({ ...current, [key]: event.target.value }))} pattern="^#[0-9A-Fa-f]{6}$" className="mt-0.5 w-full bg-transparent font-mono text-xs text-muted-foreground outline-none" aria-label={label + " hex code"} /></span>
                </label>
              ))}
            </div>
          </section>
        </div>

        <section className="space-y-3 xl:sticky xl:top-28 xl:self-start">
          <h3 className="text-sm font-semibold">Preview</h3>
          <div style={previewStyle} className="overflow-hidden rounded-xl border border-border">
            <div className="space-y-5 p-6" style={{ background: "hsl(var(--background))", color: "hsl(var(--foreground))" }}>
              <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: "hsl(var(--primary))" }}>MACM / Portfolio</div>
              <div>
                <p className="text-2xl font-semibold tracking-tight">Ideas made useful.</p>
                <p className="mt-2 text-sm leading-6" style={{ color: "hsl(var(--muted-foreground))" }}>Clear content, readable text, and a focused call to action across the site.</p>
              </div>
              <div className="rounded-lg border p-4" style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
                <p className="text-sm font-semibold">Featured project</p>
                <p className="mt-1 text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>A small sample of card and body copy.</p>
              </div>
              <span className="inline-flex rounded-full px-4 py-2 text-sm font-semibold" style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>View projects</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Preview changes stay here until you save.</p>
        </section>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || isSaved}>
          {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSaved ? "Appearance saved" : "Save appearance"}
        </Button>
        {!profile?.theme?.["site-palette"] && <p className="text-xs text-muted-foreground">Saving will replace the current custom colors with this palette.</p>}
      </div>
    </div>
  );
}
