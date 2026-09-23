"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Section = "all" | "profile" | "home" | "about" | "projects" | "work" | "resumes" | "theme" | "gallery";
type Mode = "fill" | "recommended";
const descriptions: Record<Section, string> = {
  all: "Profile, home, about, projects, work history, resume, theme and gallery.",
  profile: "Name, headline and missing avatar, background or favicon links.",
  home: "Hero copy, capabilities, highlights and contact invitation. Existing social links and contact email remain.",
  about: "Story, skills and contact invitation. Phone numbers remain untouched.",
  projects: "The four known projects, their descriptions and missing production image, demo and source links.",
  work: "Missing roles from the public production timeline. Existing roles and dates remain untouched.",
  resumes: "The active resume summary, title and skills. Existing PDF links and uploaded files remain.",
  theme: "Colors from the public production palette and a missing background image link.",
  gallery: "Missing references to eight public production photos. Existing images and albums remain.",
};

export function PresetControls({ section }: { section: string }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const key = section === "overview" ? "all" : section;
  const { data: enabled } = useQuery({
    queryKey: ["macm-preset-enabled"],
    queryFn: async () => {
      const response = await fetch("/api/admin/presets", { cache: "no-store" });
      return response.ok;
    },
    staleTime: 60_000,
  });
  const mutation = useMutation({
    mutationFn: async (mode: Mode) => {
      const response = await fetch("/api/admin/presets", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-macm-preset": "apply" },
        body: JSON.stringify({ section: key, mode, confirm: "APPLY" }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Preset failed");
      return result as { changed: number };
    },
    onSuccess: (result) => {
      toast.success(`Preset completed. ${result.changed} record${result.changed === 1 ? "" : "s"} checked or added.`);
      void queryClient.invalidateQueries();
      router.refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (!enabled || !(key in descriptions)) return null;
  const presetSection = key as Section;
  const modes: Mode[] = presetSection === "work" || presetSection === "gallery" ? ["fill"] : ["fill", "recommended"];
  return (
    <div className="mb-8 border border-amber-500/30 bg-amber-500/5 p-4 md:p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-600 dark:text-amber-400">MACM content presets</p>
          <p className="mt-1 text-sm text-foreground/70">{descriptions[presetSection]}</p>
          <p className="mt-1 text-xs text-foreground/50">Production references captured 23 September 2026.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {modes.map((mode) => (
            <AlertDialog key={mode}>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={mutation.isPending} className="gap-2">
                  {mode === "fill" ? <RotateCcw size={15} /> : <Sparkles size={15} />}
                  {mode === "fill" ? "Fill missing" : presetSection === "theme" ? "Restore live palette" : "Apply recommended"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{mode === "fill" ? "Fill missing data?" : presetSection === "theme" ? "Restore the production colors?" : presetSection === "all" ? "Apply all recommended presets?" : "Replace this section's text?"}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {mode === "fill"
                      ? "This adds missing content from the captured production portfolio. Nonempty text, uploads, links and records remain in place."
                      : presetSection === "all"
                        ? "This applies the prepared MACM copy and production colors across the dashboard and adds missing work and gallery records. Existing nonempty media, source/demo links and contact details remain in place."
                        : presetSection === "theme"
                          ? "This restores the captured production colors. An existing background image remains in place."
                          : "This replaces the selected section's text with the prepared MACM copy. Existing nonempty media, source/demo links, contact details and unrelated records remain in place."}
                    {" "}Changes save immediately to production. Review the page after applying.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => mutation.mutate(mode)} disabled={mutation.isPending}>
                    {mode === "fill" ? "Fill missing data" : "Apply preset"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ))}
        </div>
      </div>
    </div>
  );
}
