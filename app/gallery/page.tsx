import { headers } from "next/headers";
import Image from "next/image";
import { getProfileDataServer } from "@/lib/profile.server";
import {
  listGalleryImagesForUser,
  listGalleryAlbums,
} from "@/lib/gallery.server";
import { normalizeDomain } from "@/lib/utils";
import AlbumSelector from "@/components/AlbumSelector";

export const dynamic = "force-dynamic";

type GalleryPageProps = {
  searchParams?: Promise<{ album?: string } | undefined>;
};

export default async function GalleryPage(props: GalleryPageProps) {
  // Next.js warns if we access searchParams properties synchronously; await the promise before using.
  const searchParams = await props.searchParams;
  const selectedAlbumParam = searchParams?.album;
  // Determine current host/domain and look up user/profile
  const hdr = await headers();
  const host = hdr.get("host") ?? "";
  const domain = normalizeDomain(host);
  interface ImageRecord {
    id: string;
    url: string;
    albumName?: string | null;
    createdAt: string;
  }

  let images: ImageRecord[] = [];
  let albums: string[] = [];
  const selectedAlbum: string | null = selectedAlbumParam || null;

  if (domain) {
    const profile = await getProfileDataServer(domain);
    if (profile && profile.user_id) {
      // fetch available album names
      albums = (await listGalleryAlbums(profile.user_id)) || [];
      // fetch records directly from DB
      const records = await listGalleryImagesForUser(profile.user_id);
      images = records.map((r) => ({
        id: r.id,
        url: r.url,
        albumName: r.albumName || null,
        createdAt: r.createdAt.toISOString(),
      }));
      if (selectedAlbum && selectedAlbum !== "All") {
        images = images.filter(
          (i) => (i.albumName || "Uncategorized") === selectedAlbum,
        );
      }
    }
  }

  // group by album name
  const grouped: Record<string, typeof images> = {};
  images.forEach((img) => {
    const key = img.albumName || "Uncategorized";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(img);
  });

  return (
    <div className='max-w-7xl mx-auto py-12 px-4'>
      <h1 className='text-3xl font-bold mb-6'>Gallery</h1>
      {images.length === 0 ? (
        <p className='text-foreground/60'>No photos have been uploaded yet.</p>
      ) : (
        <>
          {/* album selector */}
          {/* album filter will be rendered via client component */}
          <div className='mb-6'>
            <AlbumSelector albums={albums} selected={selectedAlbum || "All"} />
          </div>
          <div className='space-y-8'>
            {Object.entries(grouped).map(([album, imgs]) => (
              <div key={album}>
                {album && (
                  <h2 className='text-2xl font-semibold mb-4'>{album}</h2>
                )}
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                  {imgs.map((img) => (
                    <div
                      key={img.id}
                      className='relative w-full h-64 rounded-lg overflow-hidden'
                    >
                      <Image
                        src={img.url}
                        alt='Gallery photo'
                        fill
                        className='object-cover'
                        priority={false}
                      />
                      <div className='absolute bottom-0 left-0 bg-black/50 text-white text-xs px-2 py-1'>
                        {new Date(img.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
