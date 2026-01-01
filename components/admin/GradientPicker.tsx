"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { updateCurrentUserProfile } from "@/lib/profile";
import { toast } from "@/components/ui/sonner";

interface Gradient {
  id: string;
  name: string;
  type: string;
  angle: number;
  intensity: string; // subtle, medium, bold
  pattern: string; // primary-accent, secondary-primary, etc.
  description?: string | null;
}

export default function GradientPicker() {
  const { data: gradients } = useQuery<Gradient[], Error>({
    queryKey: ["gradients"],
    queryFn: async () => {
      const res = await fetch("/api/gradients");
      if (!res.ok) throw new Error("Failed to fetch gradients");
      return res.json();
    },
  });

  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  // load current profile selection
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/profile/me");
      if (!res.ok) return;
      const data = await res.json();
      setSelectedId(data.selected_gradient_id ?? undefined);
    })();
  }, []);

  const handleSave = async () => {
    try {
      await updateCurrentUserProfile({
        selected_gradient_id: selectedId ?? undefined,
      });
      toast.success("Gradient saved! Refreshing to show changes...");
      // Refresh the page to show the new gradient in the layout
      setTimeout(() => window.location.reload(), 500);
    } catch {
      toast.error("Failed to save gradient");
    }
  };

  const handleClear = async () => {
    try {
      await updateCurrentUserProfile({
        selected_gradient_id: undefined,
      });
      // update local state for immediate UI feedback
      setSelectedId(undefined);
      toast.success("Gradient cleared — using default. Refreshing...");
      setTimeout(() => window.location.reload(), 500);
    } catch {
      toast.error("Failed to clear gradient");
    }
  };

  // Generate preview gradient CSS based on pattern and intensity
  const getPreviewGradient = (g: Gradient) => {
    const opacities = {
      subtle: { start: 0.08, end: 0.04 },
      medium: { start: 0.15, end: 0.08 },
      bold: { start: 0.25, end: 0.12 },
    };
    const opacity =
      opacities[g.intensity as keyof typeof opacities] || opacities.subtle;

    const patterns: Record<string, string> = {
      "primary-accent": `linear-gradient(${g.angle}deg, hsl(var(--primary) / ${opacity.start}) 0%, hsl(var(--accent) / ${opacity.end}) 100%)`,
      "secondary-primary": `linear-gradient(${g.angle}deg, hsl(var(--secondary) / ${opacity.start}) 0%, hsl(var(--primary) / ${opacity.end}) 100%)`,
      "accent-secondary": `linear-gradient(${g.angle}deg, hsl(var(--accent) / ${opacity.start}) 0%, hsl(var(--secondary) / ${opacity.end}) 100%)`,
      warm: `linear-gradient(${g.angle}deg, hsl(25 85% 60% / ${opacity.start}) 0%, hsl(340 75% 55% / ${opacity.end}) 100%)`,
      cool: `linear-gradient(${g.angle}deg, hsl(200 85% 60% / ${opacity.start}) 0%, hsl(260 75% 55% / ${opacity.end}) 100%)`,
    };

    return patterns[g.pattern] || patterns["primary-accent"];
  };

  return (
    <div className='space-y-4'>
      <div>
        <h4 className='font-medium mb-2'>Theme-Aware Gradients</h4>
        <p className='text-sm text-muted-foreground'>
          These gradients automatically adapt to your theme colors and provide
          subtle depth to your pages.
        </p>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
        {gradients &&
          gradients.map((g: Gradient) => (
            <button
              key={g.id}
              type='button'
              className={`group relative rounded-lg p-4 aspect-square border-2 transition-all ${
                selectedId === g.id
                  ? "border-primary shadow-lg scale-105"
                  : "border-foreground/10 hover:border-foreground/30 hover:scale-102"
              }`}
              onClick={() => setSelectedId(g.id)}
              title={g.description || g.name}
            >
              <div
                className='absolute inset-0 rounded-lg'
                style={{ background: getPreviewGradient(g) }}
              />
              <div className='relative z-10 flex flex-col items-center justify-center h-full'>
                <div className='text-sm font-semibold text-foreground text-center mb-1'>
                  {g.name}
                </div>
                <div className='text-xs text-foreground/60 capitalize'>
                  {g.intensity}
                </div>
              </div>
            </button>
          ))}
      </div>

      <div className='flex gap-3'>
        <Button variant='outline' onClick={handleClear}>
          Clear
        </Button>
        <div className='ml-auto'>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>
    </div>
  );
}
