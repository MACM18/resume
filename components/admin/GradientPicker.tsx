"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useQuery } from "@tanstack/react-query";
import { updateCurrentUserProfile } from "@/lib/profile";
import { toast } from "@/components/ui/sonner";

interface Gradient {
  id: string;
  name: string;
  type: string;
  angle?: number;
  colorStops?: unknown;
  previewCss?: string | null;
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
  const [useTheme, setUseTheme] = useState(false);

  // load current profile selection
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/profile/me");
      if (!res.ok) return;
      const data = await res.json();
      setSelectedId(data.selected_gradient_id ?? undefined);
      setUseTheme(Boolean(data.selected_gradient_use_theme));
    })();
  }, []);

  const handleSave = async () => {
    try {
      await updateCurrentUserProfile({
        selected_gradient_id: selectedId ?? undefined,
        selected_gradient_use_theme: useTheme,
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
        selected_gradient_use_theme: false,
      });
      // update local state for immediate UI feedback
      setSelectedId(undefined);
      setUseTheme(false);
      toast.success("Gradient cleared — using default. Refreshing...");
      setTimeout(() => window.location.reload(), 500);
    } catch {
      toast.error("Failed to clear gradient");
    }
  };

  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <h4 className='font-medium'>Preset Gradients</h4>
          <p className='text-sm text-muted-foreground'>
            Choose a subtle overlay
          </p>
        </div>
        <div className='flex items-center gap-3'>
          <span className='text-sm'>Use theme colors</span>
          <Switch
            checked={useTheme}
            onCheckedChange={(v) => setUseTheme(Boolean(v))}
          />
        </div>
      </div>

      <div className='grid grid-cols-3 gap-3'>
        {gradients &&
          gradients.map((g: Gradient) => (
            <button
              key={g.id}
              type='button'
              className={`rounded-lg p-3 aspect-square border-2 ${
                selectedId === g.id ? "border-primary" : "border-transparent"
              }`}
              onClick={() => setSelectedId(g.id)}
              title={g.name}
              style={{ background: g.previewCss ?? undefined }}
            >
              <div className='text-xs font-semibold text-foreground'>
                {g.name}
              </div>
            </button>
          ))}
      </div>

      <div className='flex gap-3'>
        <Button variant='outline' onClick={handleClear}>
          Clear
        </Button>
        <div className='ml-auto'>
          <Button onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
