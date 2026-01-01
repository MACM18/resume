"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { updateCurrentUserProfile } from "@/lib/profile";
import { toast } from "@/components/ui/sonner";

interface Gradient {
  id: string;
  name: string;
  patternType: string; // diagonal, radial, mesh, spiral, wave, dots
  intensity: string; // subtle, medium, vibrant
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

  // Generate preview gradient CSS based on pattern type and intensity
  const getPreviewGradient = (g: Gradient) => {
    const opacities = {
      subtle: 0.06,
      medium: 0.12,
      vibrant: 0.2,
    };
    const opacity =
      opacities[g.intensity as keyof typeof opacities] || opacities.subtle;

    const patterns: Record<string, string> = {
      diagonal: `linear-gradient(135deg, hsl(var(--primary) / ${opacity}) 0%, hsl(var(--accent) / ${
        opacity * 0.6
      }) 100%)`,
      radial: `radial-gradient(circle at 30% 30%, hsl(var(--primary) / ${opacity}) 0%, hsl(var(--accent) / ${
        opacity * 0.4
      }) 50%, transparent 100%)`,
      mesh: `
        radial-gradient(at 20% 30%, hsl(var(--primary) / ${opacity}) 0px, transparent 50%),
        radial-gradient(at 80% 20%, hsl(var(--accent) / ${opacity}) 0px, transparent 50%),
        radial-gradient(at 50% 80%, hsl(var(--secondary) / ${
          opacity * 0.7
        }) 0px, transparent 50%)
      `,
      spiral: `conic-gradient(from 45deg at 50% 50%, hsl(var(--primary) / ${opacity}), hsl(var(--accent) / ${
        opacity * 0.8
      }), hsl(var(--secondary) / ${
        opacity * 0.6
      }), hsl(var(--primary) / ${opacity}))`,
      wave: `linear-gradient(110deg, hsl(var(--primary) / ${opacity}) 0%, hsl(var(--accent) / ${
        opacity * 0.7
      }) 30%, hsl(var(--secondary) / ${
        opacity * 0.5
      }) 60%, hsl(var(--primary) / ${opacity * 0.3}) 100%)`,
      dots: `radial-gradient(circle, hsl(var(--primary) / ${opacity}) 1px, transparent 1px), radial-gradient(circle, hsl(var(--accent) / ${
        opacity * 0.5
      }) 1px, transparent 1px)`,
    };

    return patterns[g.patternType] || patterns.diagonal;
  };

  return (
    <div className='space-y-4'>
      <div>
        <h4 className='font-medium mb-2'>Background Patterns</h4>
        <p className='text-sm text-muted-foreground'>
          Choose a subtle visual pattern using your theme colors
        </p>
      </div>

      <div className='space-y-2'>
        {/* Default / None option */}
        <button
          type='button'
          onClick={() => setSelectedId(undefined)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${
            !selectedId
              ? "border-primary bg-primary/5"
              : "border-foreground/10 hover:border-foreground/20 hover:bg-foreground/5"
          }`}
        >
          <div className='w-10 h-10 rounded-full border-2 border-foreground/20 bg-background flex items-center justify-center'>
            <span className='text-xs text-foreground/50'>None</span>
          </div>
          <div className='flex-1 text-left'>
            <div className='font-medium text-sm'>No Pattern</div>
            <div className='text-xs text-muted-foreground'>
              Clean background
            </div>
          </div>
        </button>

        {/* Gradient patterns */}
        {gradients &&
          gradients.map((g: Gradient) => (
            <button
              key={g.id}
              type='button'
              onClick={() => setSelectedId(g.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${
                selectedId === g.id
                  ? "border-primary bg-primary/5"
                  : "border-foreground/10 hover:border-foreground/20 hover:bg-foreground/5"
              }`}
              title={g.description || g.name}
            >
              <div
                className='w-10 h-10 rounded-full border border-foreground/10 overflow-hidden'
                style={{ background: getPreviewGradient(g) }}
              />
              <div className='flex-1 text-left'>
                <div className='font-medium text-sm'>{g.name}</div>
                <div className='text-xs text-muted-foreground capitalize'>
                  {g.patternType} · {g.intensity}
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
