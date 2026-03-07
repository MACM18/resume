import { headers } from "next/headers";
import Image from "next/image";
import { getProfileDataServer } from "@/lib/profile.server";
import { listFiles, getPublicUrl } from "@/lib/storage";
import { normalizeDomain } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  // Determine current host/domain and look up user/profile
  const hdr = await headers();
  const host = hdr.get("host") ?? "";
  const domain = normalizeDomain(host);
  let images: string[] = [];

  if (domain) {
    const profile = await getProfileDataServer(domain);
    if (profile && profile.user_id) {
      const files = await listFiles("gallery-images", profile.user_id);
      images = files.map((key) => {
        const prefix = `gallery-images/`;
        const relative = key.startsWith(prefix)
          ? key.slice(prefix.length)
          : key;
        return getPublicUrl("gallery-images", relative);
      });
    }
  }

  return (
    <div className='max-w-7xl mx-auto py-12 px-4'>
      <h1 className='text-3xl font-bold mb-6'>Gallery</h1>
      {images.length === 0 ? (
        <p className='text-foreground/60'>No photos have been uploaded yet.</p>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
          {images.map((src) => (
            <div
              key={src}
              className='relative w-full h-64 rounded-lg overflow-hidden'
            >
              <Image
                src={src}
                alt='Gallery photo'
                fill
                className='object-cover'
                priority={false}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
