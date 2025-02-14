import PhotoAlbumMaker from "@/components/photo-album-maker";
import { getAllGalleryImages } from "@/lib/gallery-api";

export const dynamic = "force-dynamic";

export default async function Home() {
  const galleryName = "formatura-andre";
  const images = await getAllGalleryImages({ galleryName });

  return (
    <main className="min-h-screen">
      <PhotoAlbumMaker galleryName={galleryName} images={images} />
    </main>
  );
}
