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
import Image from "next/image";

interface AdvancedAvatarEditorProps {
  currentAvatarUrl: string | null;
  currentPosition?: { x: number; y: number };
  currentZoom?: number;
  currentSize?: number;
}

export function AdvancedAvatarEditor({
  currentAvatarUrl,
  currentPosition = { x: 50, y: 50 },
  currentZoom = 100,
  currentSize = 320,
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
  const dragStartRef = useRef({ clientX: 0, clientY: 0, posX: 0, posY: 0 });

  // Props are synced by the effect below when `currentPosition` or `currentZoom` change.

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
        avatar_size: containerSize,
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

  // Container sizing & drag state
  const [containerSize, setContainerSize] = useState<number>(320); // px (w-80 = 320)
  const [previewMode, setPreviewMode] = useState<"home" | "about" | "custom">(
    "home"
  );

  // Drag start/end logic (mouse + touch)
  const handleDragStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      setIsDragging(true);

      const clientX =
        "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      const clientY =
        "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

      dragStartRef.current = {
        clientX,
        clientY,
        posX: position.x,
        posY: position.y,
      };
    },
    [position]
  );

  const handleDragMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !containerRef.current) return;

      const clientX =
        "touches" in (e as TouchEvent)
          ? (e as TouchEvent).touches[0].clientX
          : (e as MouseEvent).clientX;
      const clientY =
        "touches" in (e as TouchEvent)
          ? (e as TouchEvent).touches[0].clientY
          : (e as MouseEvent).clientY;

      const rect = containerRef.current.getBoundingClientRect();
      const sensitivity = 100 / Math.max(rect.width, rect.height);

      const deltaX = (clientX - dragStartRef.current.clientX) * sensitivity;
      const deltaY = (clientY - dragStartRef.current.clientY) * sensitivity;

      // Invert direction to move the image when dragging the preview
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
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -5 : 5;
    setZoom((prev) => Math.max(50, Math.min(200, prev + delta)));
  };

  // Sync preview mode presets
  useEffect(() => {
    if (previewMode === "home") setContainerSize(320);
    if (previewMode === "about") setContainerSize(192);
    // custom keeps the current size
  }, [previewMode]);

  // Sync incoming prop changes (e.g., after save)
  useEffect(() => {
    const z = normalizeZoom(currentZoom);
    if (z !== zoom) setZoom(z);

    const normalized = normalizePosition(currentPosition);
    if (normalized.x !== position.x || normalized.y !== position.y) {
      setPosition(normalized);
    }

    const cs = Number(currentSize) || 320;
    if (cs !== containerSize)
      setContainerSize(Math.max(64, Math.min(512, Math.round(cs))));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPosition, currentZoom, currentSize]);

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
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
          onWheel={handleWheel}
          className={`relative overflow-hidden border-4 transition-all select-none ${
            shape === "circle" ? "rounded-full" : "rounded-2xl"
          } ${
            isDragging
              ? "border-primary cursor-grabbing scale-105 shadow-2xl"
              : "border-primary/40 cursor-grab hover:border-primary hover:shadow-xl"
          } bg-background`}
          style={{
            width: `${containerSize}px`,
            height: `${containerSize}px`,
            touchAction: "none",
          }}
        >
          {/* Crosshair */}
          <div className='absolute inset-0 pointer-events-none z-10'>
            <div className='absolute left-1/2 top-0 bottom-0 w-px bg-primary/20' />
            <div className='absolute top-1/2 left-0 right-0 h-px bg-primary/20' />
          </div>

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

          {/* Drag instruction overlay */}
          {!isDragging && (
            <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
              <div className='bg-black/60 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity'>
                Drag to reposition
              </div>
            </div>
          )}
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
          <div className='bg-muted px-4 py-2 rounded-lg font-mono'>
            Size: {containerSize}px
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

        {/* Container Size */}
        <div className='space-y-3'>
          <Label className='text-sm font-semibold'>Container Size</Label>
          <div className='flex gap-2 items-center'>
            <Input
              type='range'
              min='64'
              max='512'
              step='8'
              value={containerSize}
              onChange={(e) => {
                setPreviewMode("custom");
                setContainerSize(Number(e.target.value));
              }}
              className='w-full'
            />
            <div className='w-20 text-sm font-mono text-right'>
              {containerSize}px
            </div>
          </div>
          <div className='flex gap-2 mt-2'>
            <Button
              size='sm'
              variant={previewMode === "home" ? "default" : "outline"}
              onClick={() => {
                setPreviewMode("home");
                setContainerSize(320);
              }}
            >
              Home
            </Button>
            <Button
              size='sm'
              variant={previewMode === "about" ? "default" : "outline"}
              onClick={() => {
                setPreviewMode("about");
                setContainerSize(192);
              }}
            >
              About
            </Button>
            <Button
              size='sm'
              variant={previewMode === "custom" ? "default" : "outline"}
              onClick={() => setPreviewMode("custom")}
            >
              Custom
            </Button>
          </div>
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
            setPreviewMode("home");
            setContainerSize(320);
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
