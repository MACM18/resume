"use client";

import { GalleryLightbox } from "./GalleryLightbox";

interface ImageRecord {
  id: string;
  url: string;
  albumName?: string | null;
  createdAt: string;
}

interface ClientGallerySectionProps {
  grouped: Record<string, ImageRecord[]>;
}

export default function ClientGallerySection({
  grouped,
}: ClientGallerySectionProps) {
  return (
    <div className='space-y-12'>
      {Object.entries(grouped).map(([album, imgs]) => (
        <section key={album} className='scroll-mt-20'>
          {/* Album header */}
          <div className='mb-8'>
            <div className='flex items-baseline gap-3 mb-2'>
              <h2 className='text-3xl font-bold'>{album}</h2>
              <span className='text-sm text-foreground/50 font-medium'>
                {imgs.length} photo{imgs.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className='w-12 h-1 bg-gradient-to-r from-primary to-transparent rounded-full' />
          </div>

          {/* Image grid with lightbox */}
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
            {imgs.map((img, idx) => (
              <GalleryLightbox
                key={img.id}
                images={imgs}
                initialIndex={idx}
                albumName={album}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
