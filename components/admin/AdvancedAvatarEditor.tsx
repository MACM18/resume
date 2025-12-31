"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCurrentUserProfile } from "@/lib/profile";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import {
  Loader2,
  RotateCcw,
  Save,
  Grid3x3,
  ZoomIn,
  ZoomOut,
  Move,
  Maximize2,
  Minimize2,
} from "lucide-react";
import Image from "next/image";

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
  const normalizePosition = useCallback(
    (p: unknown): { x: number; y: number } => {
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
    },
    []
  );

  const normalizeZoom = useCallback((z: unknown): number => {
    const zoom = Number(z) || 100;
    return Math.max(50, Math.min(200, Math.round(zoom)));
  }, []);

  const [position, setPosition] = useState(() =>
    normalizePosition(currentPosition)
  );
  const [zoom, setZoom] = useState(() => normalizeZoom(currentZoom));
  const [isDragging, setIsDragging] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [previewMode, setPreviewMode] = useState<"circle" | "square">("circle");

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });

  // Sync with props
  useEffect(() => {
    setPosition(normalizePosition(currentPosition));
    setZoom(normalizeZoom(currentZoom));
  }, [currentPosition, currentZoom, normalizePosition, normalizeZoom]);

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
      toast.success("Avatar position saved");
    },
    onError: (error) => {
      console.error("Error updating avatar position:", error);
      toast.error("Failed to save position");
    },
  });

  // Drag handlers
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

  const handleDragMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !containerRef.current) return;

      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      const rect = containerRef.current.getBoundingClientRect();
      const sensitivity = 100 / Math.max(rect.width, rect.height);

      const deltaX = (clientX - dragStartRef.current.x) * sensitivity;
      const deltaY = (clientY - dragStartRef.current.y) * sensitivity;

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

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

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

  // Wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -5 : 5;
    setZoom((prev) => Math.max(50, Math.min(200, prev + delta)));
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current?.contains(document.activeElement)) return;

      const step = e.shiftKey ? 10 : 1;

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          setPosition((p) => ({ ...p, y: Math.max(0, p.y - step) }));
          break;
        case "ArrowDown":
          e.preventDefault();
          setPosition((p) => ({ ...p, y: Math.min(100, p.y + step) }));
          break;
        case "ArrowLeft":
          e.preventDefault();
          setPosition((p) => ({ ...p, x: Math.max(0, p.x - step) }));
          break;
        case "ArrowRight":
          e.preventDefault();
          setPosition((p) => ({ ...p, x: Math.min(100, p.x + step) }));
          break;
        case "+":
        case "=":
          e.preventDefault();
          setZoom((z) => Math.min(200, z + 5));
          break;
        case "-":
          e.preventDefault();
          setZoom((z) => Math.max(50, z - 5));
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
      {/* Preview Section */}
      <div className='space-y-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <h3 className='font-semibold text-lg'>Live Preview</h3>
            {isDragging && (
              <span className='text-xs bg-primary/20 text-primary px-2 py-1 rounded-full animate-pulse'>
                Dragging
              </span>
            )}
          </div>
          <div className='flex gap-2'>
            <Button
              type='button'
              variant={showGrid ? "default" : "outline"}
              size='sm'
              onClick={() => setShowGrid(!showGrid)}
              title='Toggle grid'
            >
              <Grid3x3 className='h-4 w-4' />
            </Button>
            <Button
              type='button'
              variant={previewMode === "circle" ? "default" : "outline"}
              size='sm'
              onClick={() =>
                setPreviewMode(previewMode === "circle" ? "square" : "circle")
              }
              title='Toggle shape'
            >
              {previewMode === "circle" ? (
                <Minimize2 className='h-4 w-4' />
              ) : (
                <Maximize2 className='h-4 w-4' />
              )}
            </Button>
          </div>
        </div>

        {/* Interactive Preview Container */}
        <div className='flex justify-center'>
          <div
            ref={containerRef}
            tabIndex={0}
            className={`relative w-72 h-72 mx-auto overflow-hidden border-4 transition-all select-none ${
              previewMode === "circle" ? "rounded-full" : "rounded-2xl"
            } ${
              isDragging
                ? "border-primary cursor-grabbing shadow-xl shadow-primary/30 scale-105"
                : "border-primary/30 cursor-grab hover:border-primary/60 hover:shadow-lg"
            } focus:outline-none focus:ring-4 focus:ring-primary/20`}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            onWheel={handleWheel}
            role='button'
            aria-label='Drag to reposition avatar'
          >
            {/* Grid Overlay */}
            {showGrid && (
              <div className='absolute inset-0 pointer-events-none z-10'>
                {/* Vertical lines */}
                <div className='absolute left-1/3 top-0 bottom-0 w-px bg-foreground/10' />
                <div className='absolute left-2/3 top-0 bottom-0 w-px bg-foreground/10' />
                {/* Horizontal lines */}
                <div className='absolute top-1/3 left-0 right-0 h-px bg-foreground/10' />
                <div className='absolute top-2/3 left-0 right-0 h-px bg-foreground/10' />
                {/* Center crosshair */}
                <div className='absolute top-1/2 left-0 right-0 h-px bg-primary/30' />
                <div className='absolute left-1/2 top-0 bottom-0 w-px bg-primary/30' />
                <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-primary/60 bg-background/80' />
              </div>
            )}

            {/* Avatar Image */}
            <div
              className='absolute inset-0'
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: `${position.x}% ${position.y}%`,
                transition: isDragging ? "none" : "transform 0.1s ease-out",
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
                priority
                unoptimized
              />
            </div>

            {/* Hover Hint */}
            {!isDragging && (
              <div className='absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity pointer-events-none'>
                <div className='bg-background/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium shadow-lg border border-foreground/10'>
                  🖱️ Drag • 🖲️ Scroll to zoom
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Position & Zoom Display */}
        <div className='flex justify-center gap-4 text-sm'>
          <div className='bg-foreground/5 px-4 py-2 rounded-lg border border-foreground/10'>
            <span className='text-muted-foreground'>Position: </span>
            <span className='font-mono font-semibold'>
              X:{position.x}% Y:{position.y}%
            </span>
          </div>
          <div className='bg-foreground/5 px-4 py-2 rounded-lg border border-foreground/10'>
            <span className='text-muted-foreground'>Zoom: </span>
            <span className='font-mono font-semibold'>{zoom}%</span>
          </div>
        </div>
      </div>

      {/* Quick Controls */}
      <div className='grid grid-cols-2 gap-3 p-4 border rounded-xl bg-foreground/5'>
        <div className='col-span-2'>
          <h4 className='text-sm font-semibold mb-3 flex items-center gap-2'>
            <Move className='h-4 w-4' />
            Quick Controls
          </h4>
        </div>

        {/* Zoom Controls */}
        <div className='space-y-2'>
          <label className='text-xs text-muted-foreground font-medium'>
            Zoom
          </label>
          <div className='flex gap-2'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => setZoom((z) => Math.max(50, z - 10))}
              disabled={zoom <= 50}
              className='flex-1'
            >
              <ZoomOut className='h-4 w-4' />
            </Button>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => setZoom((z) => Math.min(200, z + 10))}
              disabled={zoom >= 200}
              className='flex-1'
            >
              <ZoomIn className='h-4 w-4' />
            </Button>
          </div>
        </div>

        {/* Preset Zoom Levels */}
        <div className='space-y-2'>
          <label className='text-xs text-muted-foreground font-medium'>
            Presets
          </label>
          <div className='flex gap-2'>
            <Button
              type='button'
              variant={zoom === 100 ? "default" : "outline"}
              size='sm'
              onClick={() => setZoom(100)}
              className='flex-1 text-xs'
            >
              100%
            </Button>
            <Button
              type='button'
              variant={zoom === 150 ? "default" : "outline"}
              size='sm'
              onClick={() => setZoom(150)}
              className='flex-1 text-xs'
            >
              150%
            </Button>
          </div>
        </div>

        {/* Position Presets */}
        <div className='col-span-2 space-y-2'>
          <label className='text-xs text-muted-foreground font-medium'>
            Position Presets
          </label>
          <div className='grid grid-cols-3 gap-2'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => setPosition({ x: 50, y: 30 })}
              className='text-xs'
            >
              Top
            </Button>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => setPosition({ x: 50, y: 50 })}
              className='text-xs'
            >
              Center
            </Button>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => setPosition({ x: 50, y: 70 })}
              className='text-xs'
            >
              Bottom
            </Button>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className='p-3 bg-muted/50 rounded-lg border'>
        <p className='text-xs text-muted-foreground'>
          <span className='font-semibold'>💡 Tip:</span> Use arrow keys to
          fine-tune position (hold Shift for larger steps), +/- for zoom
        </p>
      </div>

      {/* Action Buttons */}
      <div className='flex gap-3 pt-2'>
        <Button
          onClick={() => updateMutation.mutate()}
          disabled={updateMutation.isPending}
          className='flex-1 h-11'
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
              Save Changes
            </>
          )}
        </Button>
        <Button
          type='button'
          variant='outline'
          onClick={() => {
            setPosition({ x: 50, y: 50 });
            setZoom(100);
            toast.info("Reset to defaults");
          }}
          title='Reset to center at 100%'
          className='h-11'
          size='lg'
        >
          <RotateCcw className='h-5 w-5' />
        </Button>
      </div>
    </div>
  );
}
