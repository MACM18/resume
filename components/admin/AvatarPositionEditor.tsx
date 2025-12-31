"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCurrentUserProfile } from "@/lib/profile";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { Loader2, Move, ZoomIn, ZoomOut, RotateCcw, Hand } from "lucide-react";
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

  // Normalize incoming position shapes (object, array, or JSON string)
  const normalizePosition = useCallback((p: unknown) => {
    if (!p) return { x: 50, y: 50 };
    if (Array.isArray(p) && p.length >= 2) {
      const x = Number(p[0]) || 50;
      const y = Number(p[1]) || 50;
      return {
        x: Math.max(0, Math.min(100, Math.round(x))),
        y: Math.max(0, Math.min(100, Math.round(y))),
      };
    }
    if (typeof p === "string") {
      try {
        const parsed = JSON.parse(p);
        return normalizePosition(parsed);
      } catch {
        const parts = p.split(",").map((s: string) => s.trim());
        if (parts.length >= 2) {
          const x = Number(parts[0]) || 50;
          const y = Number(parts[1]) || 50;
          return {
            x: Math.max(0, Math.min(100, Math.round(x))),
            y: Math.max(0, Math.min(100, Math.round(y))),
          };
        }
      }
    }
    if (typeof p === "object" && p !== null) {
      const maybe = p as { x?: unknown; y?: unknown };
      const x = Number(maybe.x as number | string);
      const y = Number(maybe.y as number | string);
      if (Number.isFinite(x) && Number.isFinite(y)) {
        return {
          x: Math.max(0, Math.min(100, Math.round(x))),
          y: Math.max(0, Math.min(100, Math.round(y))),
        };
      }
    }
    return { x: 50, y: 50 };
  }, []);

  const [position, setPosition] = useState(() =>
    normalizePosition(currentPosition)
  );
  const [zoom, setZoom] = useState(() => {
    const z = Number(currentZoom);
    return Number.isFinite(z)
      ? Math.max(50, Math.min(200, Math.round(z)))
      : 100;
  });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });

  // Sync state when props change
  useEffect(() => {
    setPosition(normalizePosition(currentPosition));

    const z = Number(currentZoom);
    setZoom(
      Number.isFinite(z) ? Math.max(50, Math.min(200, Math.round(z))) : 100
    );

    // Log unexpected shapes (helps diagnose malformed DB values)
    const isValid = (() => {
      if (!currentPosition || typeof currentPosition !== "object") return false;
      const maybe = currentPosition as { x?: unknown; y?: unknown };
      return (
        Number.isFinite(Number(maybe.x as number | string)) &&
        Number.isFinite(Number(maybe.y as number | string))
      );
    })();

    if (!isValid && currentPosition) {
      console.warn(
        "AvatarPositionEditor: normalized unexpected currentPosition",
        currentPosition
      );
    }

    // Dev-time mount log to help reproduce ephemeral rendering errors
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.debug("AvatarPositionEditor mount", {
        currentAvatarUrl,
        currentPosition,
        currentZoom,
      });
    }
  }, [currentPosition, currentZoom, normalizePosition, currentAvatarUrl]);

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

  // Handle drag start
  const handleDragStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      setIsDragging(true);

      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      dragStartRef.current = {
        x: clientX,
        y: clientY,
        posX: position.x,
        posY: position.y,
      };
    },
    [position]
  );

  // Handle drag move
  const handleDragMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !containerRef.current) return;

      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      const rect = containerRef.current.getBoundingClientRect();
      const sensitivity = 100 / Math.max(rect.width, rect.height);

      const deltaX = (clientX - dragStartRef.current.x) * sensitivity;
      const deltaY = (clientY - dragStartRef.current.y) * sensitivity;

      // Invert the direction for intuitive dragging (drag image, not viewport)
      const newX = Math.max(
        0,
        Math.min(100, dragStartRef.current.posX - deltaX)
      );
      const newY = Math.max(
        0,
        Math.min(100, dragStartRef.current.posY - deltaY)
      );

      setPosition({ x: Math.round(newX), y: Math.round(newY) });
    },
    [isDragging]
  );

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add/remove global event listeners for drag
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleDragMove);
      window.addEventListener("mouseup", handleDragEnd);
      window.addEventListener("touchmove", handleDragMove);
      window.addEventListener("touchend", handleDragEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleDragMove);
      window.removeEventListener("mouseup", handleDragEnd);
      window.removeEventListener("touchmove", handleDragMove);
      window.removeEventListener("touchend", handleDragEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  // Handle scroll wheel for zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -5 : 5;
    setZoom((prev) => Math.max(50, Math.min(200, prev + delta)));
  }, []);

  if (!currentAvatarUrl) {
    return (
      <div className='text-sm text-muted-foreground p-6 border rounded-lg text-center'>
        <Hand className='h-8 w-8 mx-auto mb-2 opacity-50' />
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
          Drag the image to reposition, scroll to zoom, or use the sliders below
        </p>
      </div>

      {/* Interactive Preview - Draggable */}
      <div className='space-y-2'>
        <Label className='flex items-center gap-2'>
          <Hand className='h-4 w-4' />
          Interactive Preview
          {isDragging && (
            <span className='text-xs text-primary ml-2'>Dragging...</span>
          )}
        </Label>
        <div
          ref={containerRef}
          className={`relative w-56 h-56 mx-auto rounded-full overflow-hidden border-4 transition-all select-none ${
            isDragging
              ? "border-primary cursor-grabbing shadow-lg shadow-primary/20"
              : "border-primary/20 cursor-grab hover:border-primary/40"
          }`}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
          onWheel={handleWheel}
        >
          {/* Crosshair guide */}
          <div className='absolute inset-0 pointer-events-none z-10'>
            <div className='absolute top-1/2 left-0 right-0 h-px bg-primary/30' />
            <div className='absolute left-1/2 top-0 bottom-0 w-px bg-primary/30' />
            <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-primary/50' />
          </div>

          {/* Image with positioning */}
          <div
            className='absolute inset-0 transition-transform duration-75'
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: `${position.x}% ${position.y}%`,
            }}
          >
            <Image
              src={currentAvatarUrl}
              alt='Avatar preview'
              fill
              className='object-cover pointer-events-none'
              style={{
                objectPosition: `${position.x}% ${position.y}%`,
              }}
              draggable={false}
            />
          </div>

          {/* Drag hint overlay */}
          {!isDragging && (
            <div className='absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/10 transition-colors'>
              <div className='bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium opacity-0 hover:opacity-100 transition-opacity pointer-events-none'>
                Drag to move
              </div>
            </div>
          )}
        </div>

        {/* Quick zoom buttons */}
        <div className='flex justify-center gap-2 mt-3'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => setZoom((prev) => Math.max(50, prev - 10))}
            disabled={zoom <= 50}
          >
            <ZoomOut className='h-4 w-4' />
          </Button>
          <span className='flex items-center px-3 text-sm font-medium min-w-[60px] justify-center'>
            {zoom}%
          </span>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => setZoom((prev) => Math.min(200, prev + 10))}
            disabled={zoom >= 200}
          >
            <ZoomIn className='h-4 w-4' />
          </Button>
        </div>
      </div>

      {/* Fine-tune Controls */}
      <div className='space-y-4 pt-4 border-t'>
        <Label className='text-sm font-medium'>Fine-tune Controls</Label>

        <div className='space-y-3'>
          <div className='space-y-2'>
            <div className='flex justify-between text-sm'>
              <span className='text-muted-foreground'>Horizontal</span>
              <span className='font-mono'>{position.x}%</span>
            </div>
            <Slider
              value={[position.x]}
              onValueChange={([value]) =>
                setPosition((prev) => ({ ...prev, x: Number(value) }))
              }
              min={0}
              max={100}
              step={1}
              className='w-full'
            />
          </div>

          <div className='space-y-2'>
            <div className='flex justify-between text-sm'>
              <span className='text-muted-foreground'>Vertical</span>
              <span className='font-mono'>{position.y}%</span>
            </div>
            <Slider
              value={[position.y]}
              onValueChange={([value]) =>
                setPosition((prev) => ({ ...prev, y: Number(value) }))
              }
              min={0}
              max={100}
              step={1}
              className='w-full'
            />
          </div>

          <div className='space-y-2'>
            <div className='flex justify-between text-sm'>
              <span className='text-muted-foreground'>Zoom Level</span>
              <span className='font-mono'>{zoom}%</span>
            </div>
            <Slider
              value={[zoom]}
              onValueChange={([value]) => setZoom(Number(value))}
              min={50}
              max={200}
              step={5}
              className='w-full'
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className='flex gap-2 pt-2'>
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
          type='button'
          variant='outline'
          onClick={() => {
            setPosition({ x: 50, y: 50 });
            setZoom(100);
          }}
          title='Reset to center'
        >
          <RotateCcw className='h-4 w-4' />
        </Button>
      </div>
    </div>
  );
}
