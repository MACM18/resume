"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCurrentUserProfile } from "@/lib/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import {
  Loader2,
  RotateCcw,
  Save,
  ZoomIn,
  ZoomOut,
  Move,
  Square,
  Circle,
} from "lucide-react";

interface AdvancedAvatarEditorProps {
  currentAvatarUrl: string | null;
  currentPosition?: { x: number; y: number };
  currentZoom?: number;
}

export function AdvancedAvatarEditor({
  currentAvatarUrl,
  currentPosition = { x: 50, y: 50 },
  currentZoom = 100,
}: AdvancedAvatarEditorProps) {
  const queryClient = useQueryClient();

  // Normalize position safely
  const normalizePosition = (p: unknown): { x: number; y: number } => {
    if (!p) return { x: 50, y: 50 };
    if (typeof p === "object" && p !== null && "x" in p && "y" in p) {
      const x = Number((p as { x: unknown }).x) || 50;
      const y = Number((p as { y: unknown }).y) || 50;
      return {
        x: Math.max(0, Math.min(100, Math.round(x))),
        y: Math.max(0, Math.min(100, Math.round(y))),
      };
    }
    return { x: 50, y: 50 };
  };

  const normalizeZoom = (z: unknown): number => {
    const zoom = Number(z) || 100;
    return Math.max(50, Math.min(200, Math.round(zoom)));
  };

  const [position, setPosition] = useState(() =>
    normalizePosition(currentPosition)
  );
  const [zoom, setZoom] = useState(() => normalizeZoom(currentZoom));
  const [isDragging, setIsDragging] = useState(false);
  const [shape, setShape] = useState<"circle" | "square">("circle");

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const dragStartRef = useRef({ clientX: 0, clientY: 0, posX: 0, posY: 0 });

  // Only sync with props on initial mount or if they actually change
  useEffect(() => {
    setPosition(normalizePosition(currentPosition));
    setZoom(normalizeZoom(currentZoom));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If parent changes the prop (e.g. after save), update local state
  useEffect(() => {
    const normalized = normalizePosition(currentPosition);
    if (normalized.x !== position.x || normalized.y !== position.y) {
      setPosition(normalized);
    }
    const z = normalizeZoom(currentZoom);
    if (z !== zoom) {
      setZoom(z);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPosition, currentZoom]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      await updateCurrentUserProfile({
        avatar_position: position,
        avatar_zoom: zoom,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
      toast.success("Avatar position saved!");
    },
    onError: (error) => {
      console.error("Error updating avatar position:", error);
      toast.error("Failed to save position");
    },
  });

  // Mouse/Touch drag handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      posX: position.x,
      posY: position.y,
    };
  };

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!isDragging) return;

      // Calculate movement in pixels
      const deltaX = e.clientX - dragStartRef.current.clientX;
      const deltaY = e.clientY - dragStartRef.current.clientY;

      // Convert to percentage (inverse for intuitive dragging)
      // Dividing by 3 to make it less sensitive
      const percentX = -(deltaX / 3);
      const percentY = -(deltaY / 3);

      const newX = Math.max(
        0,
        Math.min(100, dragStartRef.current.posX + percentX)
      );
      const newY = Math.max(
        0,
        Math.min(100, dragStartRef.current.posY + percentY)
      );

      setPosition({ x: Math.round(newX), y: Math.round(newY) });
    },
    [isDragging]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Setup pointer event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("pointermove", handlePointerMove);
      document.addEventListener("pointerup", handlePointerUp);
      document.addEventListener("pointercancel", handlePointerUp);
    }
    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [isDragging, handlePointerMove, handlePointerUp]);

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -5 : 5;
    setZoom((prev) => Math.max(50, Math.min(200, prev + delta)));
  };

  if (!currentAvatarUrl) {
    return (
      <div className='text-center p-8 border-2 border-dashed rounded-xl text-muted-foreground'>
        <Move className='h-12 w-12 mx-auto mb-3 opacity-40' />
        <p className='font-medium mb-1'>No Avatar Image</p>
        <p className='text-sm'>
          Upload a profile image first to customize its position
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Shape Toggle */}
      <div className='flex items-center justify-between'>
        <h3 className='font-semibold text-lg flex items-center gap-2'>
          <Move className='h-5 w-5' />
          Position & Zoom
        </h3>
        <div className='flex gap-2'>
          <Button
            type='button'
            variant={shape === "circle" ? "default" : "outline"}
            size='sm'
            onClick={() => setShape("circle")}
          >
            <Circle className='h-4 w-4 mr-1' />
            Circle
          </Button>
          <Button
            type='button'
            variant={shape === "square" ? "default" : "outline"}
            size='sm'
            onClick={() => setShape("square")}
          >
            <Square className='h-4 w-4 mr-1' />
            Square
          </Button>
        </div>
      </div>

      {/* Preview Container */}
      <div className='flex flex-col items-center gap-4'>
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onWheel={handleWheel}
          className={`relative w-80 h-80 overflow-hidden border-4 transition-all ${
            shape === "circle" ? "rounded-full" : "rounded-2xl"
          } ${
            isDragging
              ? "border-primary cursor-grabbing scale-105 shadow-2xl"
              : "border-primary/40 cursor-grab hover:border-primary hover:shadow-xl"
          } bg-background`}
          style={{ touchAction: "none" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imageRef}
            src={currentAvatarUrl}
            alt='Avatar preview'
            className='absolute pointer-events-none select-none'
            draggable={false}
            style={{
              width: `${zoom}%`,
              height: `${zoom}%`,
              left: `${position.x}%`,
              top: `${position.y}%`,
              transform: "translate(-50%, -50%)",
              objectFit: "cover",
              transition: isDragging ? "none" : "all 0.1s ease-out",
            }}
          />

          {/* Drag instruction overlay */}
          {!isDragging && (
            <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
              <div className='bg-black/60 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity'>
                Drag to reposition
              </div>
            </div>
          )}

          {/* Crosshair */}
          <div className='absolute inset-0 pointer-events-none'>
            <div className='absolute left-1/2 top-0 bottom-0 w-px bg-primary/20' />
            <div className='absolute top-1/2 left-0 right-0 h-px bg-primary/20' />
          </div>
        </div>

        {/* Status Display */}
        <div className='flex gap-3 text-sm'>
          <div className='bg-muted px-4 py-2 rounded-lg font-mono'>
            X: {position.x}%
          </div>
          <div className='bg-muted px-4 py-2 rounded-lg font-mono'>
            Y: {position.y}%
          </div>
          <div className='bg-muted px-4 py-2 rounded-lg font-mono'>
            Zoom: {zoom}%
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-xl bg-muted/30'>
        {/* Zoom Controls */}
        <div className='space-y-3'>
          <Label className='text-sm font-semibold'>Zoom Level</Label>
          <div className='flex gap-2'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => setZoom((z) => Math.max(50, z - 10))}
              disabled={zoom <= 50}
              className='flex-1'
            >
              <ZoomOut className='h-4 w-4 mr-1' />
              Out
            </Button>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => setZoom((z) => Math.min(200, z + 10))}
              disabled={zoom >= 200}
              className='flex-1'
            >
              <ZoomIn className='h-4 w-4 mr-1' />
              In
            </Button>
          </div>
          <Input
            type='range'
            min='50'
            max='200'
            step='5'
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className='w-full'
          />
        </div>

        {/* Position Fine-tune */}
        <div className='space-y-3'>
          <Label className='text-sm font-semibold'>Fine-tune Position</Label>
          <div className='space-y-2'>
            <div>
              <Label className='text-xs text-muted-foreground'>
                Horizontal (X)
              </Label>
              <Input
                type='range'
                min='0'
                max='100'
                step='1'
                value={position.x}
                onChange={(e) =>
                  setPosition((p) => ({ ...p, x: Number(e.target.value) }))
                }
                className='w-full'
              />
            </div>
            <div>
              <Label className='text-xs text-muted-foreground'>
                Vertical (Y)
              </Label>
              <Input
                type='range'
                min='0'
                max='100'
                step='1'
                value={position.y}
                onChange={(e) =>
                  setPosition((p) => ({ ...p, y: Number(e.target.value) }))
                }
                className='w-full'
              />
            </div>
          </div>
        </div>

        {/* Quick Presets */}
        <div className='col-span-1 md:col-span-2 space-y-2'>
          <Label className='text-sm font-semibold'>Quick Presets</Label>
          <div className='grid grid-cols-4 gap-2'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => setPosition({ x: 50, y: 30 })}
            >
              Top
            </Button>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => setPosition({ x: 50, y: 50 })}
            >
              Center
            </Button>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => setPosition({ x: 50, y: 70 })}
            >
              Bottom
            </Button>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => setZoom(150)}
            >
              150%
            </Button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className='flex gap-3'>
        <Button
          onClick={() => updateMutation.mutate()}
          disabled={updateMutation.isPending}
          className='flex-1'
          size='lg'
        >
          {updateMutation.isPending ? (
            <>
              <Loader2 className='mr-2 h-5 w-5 animate-spin' />
              Saving...
            </>
          ) : (
            <>
              <Save className='mr-2 h-5 w-5' />
              Save Position
            </>
          )}
        </Button>
        <Button
          type='button'
          variant='outline'
          onClick={() => {
            setPosition({ x: 50, y: 50 });
            setZoom(100);
            toast.info("Reset to center");
          }}
          size='lg'
        >
          <RotateCcw className='h-5 w-5' />
        </Button>
      </div>

      {/* Help Text */}
      <div className='text-xs text-muted-foreground text-center p-3 bg-muted/50 rounded-lg'>
        💡 <span className='font-semibold'>Tip:</span> Drag the image to
        reposition, scroll to zoom, or use the sliders for precise control
      </div>
    </div>
  );
}
