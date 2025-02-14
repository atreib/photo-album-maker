import { useState } from "react"
import type { CanvasImage, DraggedItem } from "@/types"

export function useCanvasImages() {
  const [canvasImages, setCanvasImages] = useState<CanvasImage[]>([])

  const handleImageDrop = (x: number, y: number, draggedItem: DraggedItem | null) => {
    if (draggedItem) {
      const newImage: CanvasImage = {
        id: `canvas-image-${canvasImages.length}`,
        src: draggedItem.src,
        x,
        y,
        scale: 1,
        rotation: 0,
        zIndex: canvasImages.length,
      }
      setCanvasImages((prevImages) => [...prevImages, newImage])
    }
  }

  const handleImageTransform = (id: string, transform: Partial<CanvasImage>) => {
    setCanvasImages((prevImages) => prevImages.map((img) => (img.id === id ? { ...img, ...transform } : img)))
  }

  return {
    canvasImages,
    handleImageDrop,
    handleImageTransform,
    setCanvasImages,
  }
}

