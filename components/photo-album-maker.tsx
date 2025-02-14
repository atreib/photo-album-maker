"use client";

import { ImageGallery } from "./image-gallery";
import { Canvas } from "./canvas";
import { useDragAndDrop } from "@/hooks/use-drag-and-drop";
import { useCanvasImages } from "@/hooks/useCanvasImages";
import type { CanvasImage } from "@/types/canvasImage";

type Props = {
  images: string[];
  galleryName: string;
};

export default function PhotoAlbumMaker({ images, galleryName }: Props) {
  const { draggedItem, handleDragStart, handleDragEnd } = useDragAndDrop();
  const {
    canvasImages,
    handleImageDrop,
    handleImageTransform,
    setCanvasImages,
  } = useCanvasImages();

  const handleImagesUpdate = (updatedImages: CanvasImage[]) => {
    setCanvasImages(updatedImages);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <ImageGallery
        images={images}
        onDragStart={handleDragStart}
        galleryName={galleryName}
      />
      <Canvas
        images={canvasImages}
        onDrop={(x, y) => handleImageDrop(x, y, draggedItem)}
        onDragEnd={handleDragEnd}
        onImageTransform={handleImageTransform}
        onImagesUpdate={handleImagesUpdate}
      />
    </div>
  );
}
