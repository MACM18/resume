"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GalleryImage {
  id: string;
  url: string;
  createdAt: string;
}

interface GalleryLightboxProps {
  images: GalleryImage[];
  initialIndex: number;
  albumName: string;
}

export function GalleryLightbox({
  images,
  initialIndex,
  albumName,
}: GalleryLightboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isAutoplay, setIsAutoplay] = useState(false);

  const currentImage = images[currentIndex];

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
      if (e.key === "ArrowRight") {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }
      if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, currentIndex, images.length]);

  // Autoplay timer
  useEffect(() => {
    if (!isAutoplay || !isOpen) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [isAutoplay, isOpen, images.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  if (!isOpen) {
    return (
      <div
        className='relative w-full h-64 rounded-lg overflow-hidden cursor-pointer group'
        onClick={() => setIsOpen(true)}
      >
        <Image
          src={currentImage.url}
          alt={albumName}
          fill
          className='object-cover group-hover:scale-110 transition-transform duration-500'
          priority={false}
        />
        {/* Gradient overlay on hover */}
        <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3'>
          <div className='text-white text-sm'>
            <p className='font-medium'>{albumName}</p>
            <p className='text-white/70 text-xs'>
              {new Date(currentImage.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Click to expand indicator */}
        <div className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
          <div className='bg-white/20 backdrop-blur-sm rounded-full p-3'>
            <div className='text-white text-xs font-medium'>
              Click to expand
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Modal backdrop */}
      <div
        className='fixed inset-0 bg-black/80 z-50 backdrop-blur-sm'
        onClick={() => setIsOpen(false)}
      />

      {/* Modal content */}
      <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
        <div
          className='relative w-full h-full max-w-6xl max-h-[90vh] flex flex-col bg-background rounded-xl overflow-hidden shadow-2xl'
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with album name and close */}
          <div className='flex items-center justify-between p-4 border-b border-foreground/10'>
            <div>
              <h2 className='text-xl font-bold'>{albumName}</h2>
              <p className='text-sm text-foreground/60'>
                {currentIndex + 1} / {images.length}
              </p>
            </div>
            <div className='flex gap-2'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setIsAutoplay(!isAutoplay)}
                title={isAutoplay ? "Stop autoplay" : "Start autoplay"}
              >
                {isAutoplay ? <Pause size={18} /> : <Play size={18} />}
              </Button>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setIsOpen(false)}
              >
                <X size={20} />
              </Button>
            </div>
          </div>

          {/* Image display */}
          <div className='flex-1 flex items-center justify-center min-h-0 p-4'>
            <div className='relative w-full h-full'>
              <Image
                key={currentImage.id}
                src={currentImage.url}
                alt={`Photo ${currentIndex + 1}`}
                fill
                className='object-contain animate-in fade-in duration-300'
                priority
              />
            </div>
          </div>

          {/* Footer with navigation and metadata */}
          <div className='flex items-center justify-between p-4 border-t border-foreground/10'>
            <Button
              variant='outline'
              size='sm'
              onClick={goToPrev}
              disabled={images.length <= 1}
              title='Previous (← arrow key)'
            >
              <ChevronLeft size={18} />
            </Button>

            <div className='flex flex-col items-center'>
              <p className='text-xs text-foreground/60'>
                {new Date(currentImage.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <Button
              variant='outline'
              size='sm'
              onClick={goToNext}
              disabled={images.length <= 1}
              title='Next (→ arrow key)'
            >
              <ChevronRight size={18} />
            </Button>
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className='border-t border-foreground/10 p-3 bg-background/50 overflow-x-auto'>
              <div className='flex gap-2'>
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`relative h-16 w-16 flex-shrink-0 rounded border-2 overflow-hidden transition-all duration-200 ${
                      idx === currentIndex
                        ? "border-primary"
                        : "border-foreground/20 hover:border-foreground/40"
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      className='object-cover'
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
