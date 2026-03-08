"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RotateCw, Loader2 } from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { renderEditedImage, type PhotoTransforms } from "@/lib/image-editor";

interface PhotoEditorProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageName?: string;
  onSave?: (blob: Blob, transforms: PhotoTransforms) => Promise<void>;
}

export function PhotoEditor({
  isOpen,
  onClose,
  imageUrl,
  imageName = "Photo",
  onSave,
}: PhotoEditorProps) {
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [blur, setBlur] = useState(0);
  const [grayscale, setGrayscale] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setRotation(0);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setBlur(0);
    setGrayscale(0);
  };

  const handleSave = async () => {
    if (!onSave) return;

    setIsSaving(true);
    try {
      const blob = await renderEditedImage(imageUrl, {
        rotation,
        brightness,
        contrast,
        saturation,
        blur,
        grayscale,
      });

      await onSave(blob, {
        rotation,
        brightness,
        contrast,
        saturation,
        blur,
        grayscale,
      });

      onClose();
    } catch (error) {
      console.error("Failed to save edited image:", error);
      alert("Failed to save edited image. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const filterStyle = {
    transform: `rotate(${rotation}deg)`,
    filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px) grayscale(${grayscale}%)`,
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Edit Photo</DialogTitle>
          <DialogDescription>
            Rotate and apply filters to {imageName}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Image Preview */}
          <div className='flex justify-center items-center bg-background/50 rounded-lg p-4 border border-foreground/10'>
            <div
              className='relative w-64 h-64 rounded-lg overflow-hidden'
              style={filterStyle}
            >
              <Image
                src={imageUrl}
                alt={imageName}
                fill
                objectFit='cover'
                className='transition-all duration-200'
              />
            </div>
          </div>

          {/* Controls */}
          <div className='space-y-4'>
            {/* Rotation */}
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <label className='text-sm font-medium'>Rotation</label>
                <span className='text-xs text-foreground/60'>{rotation}°</span>
              </div>
              <Button
                size='sm'
                variant='outline'
                onClick={handleRotate}
                className='w-full'
              >
                <RotateCw size={16} className='mr-2' />
                Rotate 90°
              </Button>
            </div>

            {/* Brightness */}
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <label htmlFor='brightness' className='text-sm font-medium'>
                  Brightness
                </label>
                <span className='text-xs text-foreground/60'>
                  {brightness}%
                </span>
              </div>
              <input
                id='brightness'
                type='range'
                min='0'
                max='200'
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className='w-full'
              />
            </div>

            {/* Contrast */}
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <label htmlFor='contrast' className='text-sm font-medium'>
                  Contrast
                </label>
                <span className='text-xs text-foreground/60'>{contrast}%</span>
              </div>
              <input
                id='contrast'
                type='range'
                min='0'
                max='200'
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className='w-full'
              />
            </div>

            {/* Saturation */}
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <label htmlFor='saturation' className='text-sm font-medium'>
                  Saturation
                </label>
                <span className='text-xs text-foreground/60'>
                  {saturation}%
                </span>
              </div>
              <input
                id='saturation'
                type='range'
                min='0'
                max='200'
                value={saturation}
                onChange={(e) => setSaturation(Number(e.target.value))}
                className='w-full'
              />
            </div>

            {/* Blur */}
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <label htmlFor='blur' className='text-sm font-medium'>
                  Blur
                </label>
                <span className='text-xs text-foreground/60'>{blur}px</span>
              </div>
              <input
                id='blur'
                type='range'
                min='0'
                max='20'
                value={blur}
                onChange={(e) => setBlur(Number(e.target.value))}
                className='w-full'
              />
            </div>

            {/* Grayscale */}
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <label htmlFor='grayscale' className='text-sm font-medium'>
                  Grayscale
                </label>
                <span className='text-xs text-foreground/60'>{grayscale}%</span>
              </div>
              <input
                id='grayscale'
                type='range'
                min='0'
                max='100'
                value={grayscale}
                onChange={(e) => setGrayscale(Number(e.target.value))}
                className='w-full'
              />
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className='flex gap-2 justify-between'>
            <Button
              size='sm'
              variant='outline'
              onClick={handleReset}
              disabled={isSaving}
            >
              Reset
            </Button>
            <div className='flex gap-2'>
              <Button
                size='sm'
                variant='outline'
                onClick={onClose}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button size='sm' onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 size={14} className='mr-2 animate-spin' />
                    Saving...
                  </>
                ) : (
                  "Apply"
                )}
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
