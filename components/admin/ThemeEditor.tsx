"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentUserProfile, updateCurrentUserProfile } from "@/lib/profile";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/sonner";
import { Loader2, RotateCcw } from "lucide-react";
import { defaultTheme } from "@/data/theme";
import { hslStringToHex, hexToHslString } from "@/lib/colors";

const editableColors = [
  '--background',
  '--foreground',
  '--primary',
  '--secondary',
  '--accent',
  '--glass-bg',
  '--glass-border',
];

export function ThemeEditor() {
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useQuery({
    queryKey: ["currentUserProfile"],
    queryFn: getCurrentUserProfile,
  });

  const [theme, setTheme] = useState(profile?.theme || defaultTheme);

  useEffect(() => {
    if (profile?.theme) {
      setTheme(profile.theme);
    }
  }, [profile]);

  useEffect(() => {
    // Live preview
    if (theme) {
      Object.entries(theme).forEach(([key, value]) => {
        document.documentElement.style.setProperty(key, value);
      });
    }
  }, [theme]);

  const mutation = useMutation({
    mutationFn: (newTheme: typeof defaultTheme) => updateCurrentUserProfile({ theme: newTheme }),
    onSuccess: () => {
      toast.success("Theme updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
      queryClient.invalidateQueries({ queryKey: ["theme"] });
    },
    onError: (error: any) => toast.error(`Failed to update theme: ${error.message}`),
  });

  const handleColorChange = (key: string, value: string) => {
    setTheme(prev => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setTheme(defaultTheme);
    toast.info("Theme reset to default. Click save to apply.");
  };

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-primary">Theme Editor</h2>
          <p className="text-foreground/70">Customize the core colors of your portfolio. Changes are previewed live.</p>
        </div>
        <Button variant="outline" onClick={handleReset}><RotateCcw className="mr-2" size={16} /> Reset to Default</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(theme)
          .filter(([key]) => editableColors.includes(key))
          .map(([key, value]) => (
          <div key={key} className="space-y-2">
            <label className="text-sm font-medium capitalize">{key.replace('--', '').replace(/-/g, ' ')}</label>
            <div className="flex items-center gap-2">
              <div className="relative w-10 h-10">
                <label
                  htmlFor={`color-picker-${key}`}
                  className="block w-full h-full rounded-full cursor-pointer"
                  style={{
                    backgroundColor: hslStringToHex(value),
                    border: '1px solid hsl(var(--border))'
                  }}
                />
                <input
                  id={`color-picker-${key}`}
                  type="color"
                  value={hslStringToHex(value)}
                  onChange={(e) => handleColorChange(key, hexToHslString(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <input
                type="text"
                value={value}
                onChange={(e) => handleColorChange(key, e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              />
            </div>
          </div>
        ))}
      </div>
      <Button onClick={() => mutation.mutate(theme)} disabled={mutation.isPending}>
        {mutation.isPending ? <Loader2 className="animate-spin" /> : "Save Theme"}
      </Button>
    </div>
  );
}