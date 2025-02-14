"use client"

import { useState, useCallback } from "react"
import { calculateAngle, snapAngleTo45Degrees } from "@/utils/geometry"
import type { CanvasImage } from "@/types"

export const useImageRotation = (initialRotation: number, onTransform: (transform: Partial<CanvasImage>) => void) => {
  const [startRotation, setStartRotation] = useState(initialRotation)

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

  return { handleRotationStart, handleRotation }
}

