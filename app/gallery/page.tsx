import { headers } from "next/headers";
import { getProfileDataServer } from "@/lib/profile.server";
import {
  listGalleryImagesForUser,
  listGalleryAlbums,
} from "@/lib/gallery.server";
import { normalizeDomain } from "@/lib/utils";
import AlbumSelector from "@/components/AlbumSelector";
import ClientGallerySection from "@/components/ClientGallerySection";

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
          (i) => (i.albumName || "No Album") === selectedAlbum,
        );
      }
    }
  }

  // group by album name
  const grouped: Record<string, typeof images> = {};
  images.forEach((img) => {
    const key = img.albumName || "No Album";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(img);
  });

  return (
    <div className='min-h-screen relative pb-20'>
      {/* Hero Section */}
      <section className='pt-32 pb-20 px-6'>
        <div className='max-w-6xl mx-auto'>
          <div className='text-center max-w-3xl mx-auto'>
            <h1 className='text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight'>
              Gallery
            </h1>
            <p className='text-xl md:text-2xl text-foreground/60 font-light leading-relaxed'>
              {images.length} photo{images.length !== 1 ? "s" : ""} across{" "}
              {Object.keys(grouped).length} album
              {Object.keys(grouped).length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className='px-6 pb-20'>
        <div className='max-w-6xl mx-auto'>
          {images.length === 0 ? (
            <div className='text-center py-12'>
              <p className='text-foreground/60 mb-4'>
                No photos have been uploaded yet.
              </p>
              <p className='text-sm text-foreground/40'>Come back soon!</p>
            </div>
          ) : (
            <>
              {/* album selector */}
              <div className='mb-12'>
                <AlbumSelector
                  albums={albums}
                  selected={selectedAlbum || "All"}
                />
              </div>
              <ClientGallerySection grouped={grouped} />
            </>
          )}
        </div>
      </section>
    </div>
  );
}
