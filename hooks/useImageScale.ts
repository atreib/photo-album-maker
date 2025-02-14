"use client"

import { useState, useCallback } from "react"
import { calculateDistance } from "@/utils/geometry"
import type { CanvasImage } from "@/types"

export const useImageScale = (initialScale: number, onTransform: (transform: Partial<CanvasImage>) => void) => {
  const [startScale, setStartScale] = useState(initialScale)

  const handleScaleStart = useCallback((scale: number) => {
    setStartScale(scale)
  }, [])

  const handleScale = useCallback(
    (
      startX: number,
      startY: number,
      currentX: number,
      currentY: number,
      centerX: number,
      centerY: number,
      direction: "corner" | "horizontal" | "vertical",
    ) => {
      let newScale = startScale
      switch (direction) {
        case "corner":
          const startDiagonal = calculateDistance(startX, startY, centerX, centerY)
          const currentDiagonal = calculateDistance(currentX, currentY, centerX, centerY)
          newScale = startScale * (currentDiagonal / startDiagonal)
          break
        case "horizontal":
          newScale = startScale * (Math.abs(currentX - centerX) / Math.abs(startX - centerX))
          break
        case "vertical":
          newScale = startScale * (Math.abs(currentY - centerY) / Math.abs(startY - centerY))
          break
      }

      // Prevent scaling below a minimum size
      const minScale = 0.1
      newScale = Math.max(minScale, newScale)

      onTransform({ scale: newScale })
    },
    [startScale, onTransform],
  )

  return { handleScaleStart, handleScale }
}

