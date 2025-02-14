import { useState } from "react"
import type { CanvasImage } from "@/types"

export function useImageTransform() {
  const [images, setImages] = useState<CanvasImage[]>([])

  const handleImageTransform = (id: string, transform: Partial<CanvasImage>) => {
    setImages((prevImages) => prevImages.map((img) => (img.id === id ? { ...img, ...transform } : img)))
  }

  return { images, handleImageTransform }
}

