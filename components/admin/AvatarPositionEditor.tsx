"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCurrentUserProfile } from "@/lib/profile";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { Loader2, Move, ZoomIn } from "lucide-react";
import Image from "next/image";

interface AvatarPositionEditorProps {
  currentAvatarUrl: string | null;
  currentPosition?: { x: number; y: number };
  currentZoom?: number;
}

export function AvatarPositionEditor({
  currentAvatarUrl,
  currentPosition = { x: 50, y: 50 },
  currentZoom = 100,
}: AvatarPositionEditorProps) {
  const queryClient = useQueryClient();
  const [position, setPosition] = useState(currentPosition);
  const [zoom, setZoom] = useState(currentZoom);

  const updateMutation = useMutation({
    mutationFn: async () => {
      await updateCurrentUserProfile({
        avatar_position: position,
        avatar_zoom: zoom,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
      toast.success("Avatar position updated successfully");
    },
    onError: (error) => {
      console.error("Error updating avatar position:", error);
      toast.error("Failed to update avatar position");
    },
  });

  if (!currentAvatarUrl) {
    return (
      <div className='text-sm text-muted-foreground'>
        Upload an avatar image first to adjust its position
      </div>
    );
  }

  return (
    <div className='space-y-6 border rounded-lg p-6'>
      <div>
        <h3 className='text-lg font-medium mb-2 flex items-center gap-2'>
          <Move className='h-5 w-5' />
          Avatar Position & Zoom
        </h3>
        <p className='text-sm text-muted-foreground'>
          Adjust how your avatar is positioned and scaled within the circle
        </p>
      </div>

      {/* Preview */}
      <div className='space-y-2'>
        <Label>Preview</Label>
        <div className='relative w-48 h-48 mx-auto rounded-full overflow-hidden border-4 border-primary/20 bg-background'>
          <div
            className='absolute inset-0'
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: `${position.x}% ${position.y}%`,
            }}
          >
            <Image
              src={currentAvatarUrl}
              alt='Avatar preview'
              fill
              className='object-cover'
              style={{
                objectPosition: `${position.x}% ${position.y}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Position Controls */}
      <div className='space-y-4'>
        <div className='space-y-2'>
          <Label className='flex items-center gap-2'>
            <Move className='h-4 w-4' />
            Horizontal Position: {position.x}%
          </Label>
          <Slider
            value={[position.x]}
            onValueChange={([value]) => setPosition({ ...position, x: value })}
            min={0}
            max={100}
            step={1}
            className='w-full'
          />
          <p className='text-xs text-muted-foreground'>
            Adjust left-right positioning (0 = left, 100 = right)
          </p>
        </div>

        <div className='space-y-2'>
          <Label className='flex items-center gap-2'>
            <Move className='h-4 w-4' />
            Vertical Position: {position.y}%
          </Label>
          <Slider
            value={[position.y]}
            onValueChange={([value]) => setPosition({ ...position, y: value })}
            min={0}
            max={100}
            step={1}
            className='w-full'
          />
          <p className='text-xs text-muted-foreground'>
            Adjust up-down positioning (0 = top, 100 = bottom)
          </p>
        </div>

        <div className='space-y-2'>
          <Label className='flex items-center gap-2'>
            <ZoomIn className='h-4 w-4' />
            Zoom Level: {zoom}%
          </Label>
          <Slider
            value={[zoom]}
            onValueChange={([value]) => setZoom(value)}
            min={50}
            max={200}
            step={5}
            className='w-full'
          />
          <p className='text-xs text-muted-foreground'>
            Scale your avatar (50% = zoom out, 200% = zoom in)
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className='flex gap-2'>
        <Button
          onClick={() => updateMutation.mutate()}
          disabled={updateMutation.isPending}
          className='flex-1'
        >
          {updateMutation.isPending ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Saving...
            </>
          ) : (
            "Save Position"
          )}
        </Button>
        <Button
          variant='outline'
          onClick={() => {
            setPosition({ x: 50, y: 50 });
            setZoom(100);
          }}
        >
          Reset
        </Button>
      </div>
    </div>
  );
}
