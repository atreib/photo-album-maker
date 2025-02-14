"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { calculateDistance, calculateAngle, snapAngleTo45Degrees } from "@/utils/geometry"
import type { CanvasImage } from "@/types"

interface ImageTransformContextType {
  handleScaleStart: (scale: number) => void
  handleScale: (
    startX: number,
    startY: number,
    currentX: number,
    currentY: number,
    centerX: number,
    centerY: number,
    direction: "corner" | "horizontal" | "vertical",
  ) => void
  handleRotationStart: (rotation: number) => void
  handleRotation: (
    startX: number,
    startY: number,
    currentX: number,
    currentY: number,
    centerX: number,
    centerY: number,
    isShiftPressed: boolean,
  ) => void
}

const ImageTransformContext = createContext<ImageTransformContextType | undefined>(undefined)

export function ImageTransformProvider({
  children,
  onTransform,
}: { children: ReactNode; onTransform: (transform: Partial<CanvasImage>) => void }) {
  const [startScale, setStartScale] = useState(1)
  const [startRotation, setStartRotation] = useState(0)

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

      const minScale = 0.1
      newScale = Math.max(minScale, newScale)

      onTransform({ scale: newScale })
    },
    [startScale, onTransform],
  )

  const handleRotationStart = useCallback((rotation: number) => {
    setStartRotation(rotation)
  }, [])

  const handleRotation = useCallback(
    (
      startX: number,
      startY: number,
      currentX: number,
      currentY: number,
      centerX: number,
      centerY: number,
      isShiftPressed: boolean,
    ) => {
      const startAngle = calculateAngle(centerX, centerY, startX, startY)
      const currentAngle = calculateAngle(centerX, centerY, currentX, currentY)
      let angleDiff = currentAngle - startAngle

      if (isShiftPressed) {
        angleDiff = snapAngleTo45Degrees(angleDiff)
      }

      const newRotation = (startRotation + angleDiff + 360) % 360
      onTransform({ rotation: newRotation })
    },
    [startRotation, onTransform],
  )

  return (
    <ImageTransformContext.Provider value={{ handleScaleStart, handleScale, handleRotationStart, handleRotation }}>
      {children}
    </ImageTransformContext.Provider>
  )
}

export function useImageTransform() {
  const context = useContext(ImageTransformContext)
  if (context === undefined) {
    throw new Error("useImageTransform must be used within an ImageTransformProvider")
  }
  return context
}

