"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { DraggableImage } from "./draggable-image"
import type { CanvasImage } from "@/types"

interface CanvasProps {
  images: CanvasImage[]
  onDrop: (x: number, y: number) => void
  onDragEnd: () => void
  onImageTransform: (id: string, transform: Partial<CanvasImage>) => void
  onImagesUpdate: (updatedImages: CanvasImage[]) => void
}

export function Canvas({ images, onDrop, onDragEnd, onImageTransform, onImagesUpdate }: CanvasProps) {
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null)

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const x = e.nativeEvent.offsetX
    const y = e.nativeEvent.offsetY
    onDrop(x, y)
    onDragEnd()
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setSelectedImageId(null)
    }
  }

  const updateImagesOrder = useCallback(
    (newImages: CanvasImage[]) => {
      const sortedImages = newImages.sort((a, b) => a.zIndex - b.zIndex)
      const updatedImages = sortedImages.map((img, index) => ({
        ...img,
        zIndex: index,
      }))
      onImagesUpdate(updatedImages)
    },
    [onImagesUpdate],
  )

  const bringToFront = useCallback(
    (id: string) => {
      const highestZIndex = Math.max(...images.map((img) => img.zIndex))
      const newImages = images.map((img) => (img.id === id ? { ...img, zIndex: highestZIndex + 1 } : img))
      updateImagesOrder(newImages)
    },
    [images, updateImagesOrder],
  )

  const sendToBack = useCallback(
    (id: string) => {
      const lowestZIndex = Math.min(...images.map((img) => img.zIndex))
      const newImages = images.map((img) => (img.id === id ? { ...img, zIndex: lowestZIndex - 1 } : img))
      updateImagesOrder(newImages)
    },
    [images, updateImagesOrder],
  )

  const bringForward = useCallback(
    (id: string) => {
      const index = images.findIndex((img) => img.id === id)
      if (index < images.length - 1) {
        const newImages = [...images]
        const temp = newImages[index].zIndex
        newImages[index].zIndex = newImages[index + 1].zIndex
        newImages[index + 1].zIndex = temp
        updateImagesOrder(newImages)
      }
    },
    [images, updateImagesOrder],
  )

  const sendBackward = useCallback(
    (id: string) => {
      const index = images.findIndex((img) => img.id === id)
      if (index > 0) {
        const newImages = [...images]
        const temp = newImages[index].zIndex
        newImages[index].zIndex = newImages[index - 1].zIndex
        newImages[index - 1].zIndex = temp
        updateImagesOrder(newImages)
      }
    },
    [images, updateImagesOrder],
  )

  // Sort images by zIndex
  const sortedImages = [...images].sort((a, b) => a.zIndex - b.zIndex)

  return (
    <div
      className="flex-1 bg-gray-100 relative"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleCanvasClick}
    >
      {sortedImages.map((image) => (
        <DraggableImage
          key={image.id}
          image={image}
          isSelected={image.id === selectedImageId}
          onSelect={() => setSelectedImageId(image.id)}
          onTransform={onImageTransform}
          onBringToFront={() => bringToFront(image.id)}
          onSendToBack={() => sendToBack(image.id)}
          onBringForward={() => bringForward(image.id)}
          onSendBackward={() => sendBackward(image.id)}
        />
      ))}
    </div>
  )
}

