// hooks/draggable-image.ts
import React, { useRef, useState, useCallback, useMemo } from "react"
import type { CanvasImage } from "@/types"
import { useCanvasImages } from "@/contexts/CanvasImagesContext"
import { useImageTransform } from "@/contexts/ImageTransformContext"

interface DraggableImageProps {
  image: CanvasImage
  isSelected: boolean
  onSelect: () => void
}

export function DraggableImage({ image, isSelected, onSelect }: DraggableImageProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isShiftPressed, setIsShiftPressed] = useState(false)
  const { handleImageTransform } = useCanvasImages()
  const { handleScaleStart, handleScale, handleRotationStart, handleRotation } = useImageTransform()

  const handleTransform = useCallback(
    (transform: Partial<CanvasImage>) => {
      handleImageTransform(image.id, transform)
    },
    [image.id, handleImageTransform],
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault()
      onSelect()
      const startX = e.clientX
      const startY = e.clientY

      const handleMouseMove = (e: MouseEvent) => {
        const dx = e.clientX - startX
        const dy = e.clientY - startY
        handleTransform({ x: image.x + dx, y: image.y + dy })
      }

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }

      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    },
    [image.x, image.y, onSelect, handleTransform],
  )

  const handleScaleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, direction: "corner" | "horizontal" | "vertical") => {
      e.stopPropagation()
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      const startX = e.clientX
      const startY = e.clientY
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      handleScaleStart(image.scale)

      const handleMouseMove = (e: MouseEvent) => {
        handleScale(startX, startY, e.clientX, e.clientY, centerX, centerY, direction)
      }

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }

      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    },
    [image.scale, handleScaleStart, handleScale],
  )

  const handleRotateMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation()
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      const startX = e.clientX
      const startY = e.clientY
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      handleRotationStart(image.rotation)

      const handleMouseMove = (e: MouseEvent) => {
        handleRotation(startX, startY, e.clientX, e.clientY, centerX, centerY, e.shiftKey)
        setIsShiftPressed(e.shiftKey)
      }

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }

      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    },
    [image.rotation, handleRotationStart, handleRotation],
  )

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift") setIsShiftPressed(true)
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") setIsShiftPressed(false)
    }
    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [])

  const handleStyle = useMemo(
    () => ({
      width: "20px",
      height: "20px",
      border: "2px solid #3B82F6",
      backgroundColor: "white",
      position: "absolute" as const,
      borderRadius: "4px",
      zIndex: 10,
      pointerEvents: "auto" as const,
    }),
    [],
  )

  const imageWidth = 300 * image.scale
  const imageHeight = 300 * image.scale

  return (
    <div
      ref={containerRef}
      className={`absolute ${isSelected ? "ring-2 ring-blue-500" : ""}`}
      style={{
        left: `${image.x}px`,
        top: `${image.y}px`,
        width: `${imageWidth}px`,
        height: `${imageHeight}px`,
        transform: `rotate(${image.rotation}deg)`,
        transformOrigin: "center center",
        overflow: "visible",
      }}
    >
      <img
        src={image.src || "/placeholder.svg"}
        alt="Canvas image"
        className="w-full h-full object-cover select-none"
        onMouseDown={handleMouseDown}
      />

      {isSelected && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Rotation handle */}
          <div
            className={`absolute left-1/2 w-6 h-6 -ml-3 -mt-12 rounded-full border-2 cursor-crosshair transition-all duration-200 pointer-events-auto ${isShiftPressed ? "bg-blue-500 border-white" : "bg-white border-blue-500"}`}
            style={{
              top: "-20px",
            }}
            onMouseDown={handleRotateMouseDown}
          />

          {/* Corner handles */}
          <div
            style={{ ...handleStyle, top: "-10px", left: "-10px", cursor: "nw-resize" }}
            onMouseDown={(e) => handleScaleMouseDown(e, "corner")}
          />
          <div
            style={{ ...handleStyle, top: "-10px", right: "-10px", cursor: "ne-resize" }}
            onMouseDown={(e) => handleScaleMouseDown(e, "corner")}
          />
          <div
            style={{ ...handleStyle, bottom: "-10px", left: "-10px", cursor: "sw-resize" }}
            onMouseDown={(e) => handleScaleMouseDown(e, "corner")}
          />
          <div
            style={{ ...handleStyle, bottom: "-10px", right: "-10px", cursor: "se-resize" }}
            onMouseDown={(e) => handleScaleMouseDown(e, "corner")}
          />

          {/* Side handles */}
          <div
            style={{ ...handleStyle, top: "50%", left: "-10px", marginTop: "-10px", cursor: "w-resize" }}
            onMouseDown={(e) => handleScaleMouseDown(e, "horizontal")}
          />
          <div
            style={{ ...handleStyle, top: "50%", right: "-10px", marginTop: "-10px", cursor: "e-resize" }}
            onMouseDown={(e) => handleScaleMouseDown(e, "horizontal")}
          />
          <div
            style={{ ...handleStyle, top: "-10px", left: "50%", marginLeft: "-10px", cursor: "n-resize" }}
            onMouseDown={(e) => handleScaleMouseDown(e, "vertical")}
          />
          <div
            style={{ ...handleStyle, bottom: "-10px", left: "50%", marginLeft: "-10px", cursor: "s-resize" }}
            onMouseDown={(e) => handleScaleMouseDown(e, "vertical")}
          />
        </div>
      )}
    </div>
  )
}

