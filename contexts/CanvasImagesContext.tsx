"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { CanvasImage, DraggedItem } from "@/types"

interface CanvasImagesContextType {
  canvasImages: CanvasImage[]
  handleImageDrop: (x: number, y: number, draggedItem: DraggedItem | null) => void
  handleImageTransform: (id: string, transform: Partial<CanvasImage>) => void
}

const CanvasImagesContext = createContext<CanvasImagesContextType | undefined>(undefined)

export function CanvasImagesProvider({ children }: { children: ReactNode }) {
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
      }
      setCanvasImages((prevImages) => [...prevImages, newImage])
    }
  }

  const handleImageTransform = (id: string, transform: Partial<CanvasImage>) => {
    setCanvasImages((prevImages) => prevImages.map((img) => (img.id === id ? { ...img, ...transform } : img)))
  }

  return (
    <CanvasImagesContext.Provider value={{ canvasImages, handleImageDrop, handleImageTransform }}>
      {children}
    </CanvasImagesContext.Provider>
  )
}

export function useCanvasImages() {
  const context = useContext(CanvasImagesContext)
  if (context === undefined) {
    throw new Error("useCanvasImages must be used within a CanvasImagesProvider")
  }
  return context
}

