"use client"

import type React from "react"
import { useRef, useState, useCallback, useMemo, useEffect } from "react"
import type { CanvasImage } from "@/types"
import { useImageScale } from "@/hooks/useImageScale"
import { useImageRotation } from "@/hooks/useImageRotation"
import { ChevronUp, ChevronDown, ChevronsUp, ChevronsDown } from "lucide-react"

interface DraggableImageProps {
  image: CanvasImage
  isSelected: boolean
  onSelect: () => void
  onTransform: (id: string, transform: Partial<CanvasImage>) => void
  onBringToFront: () => void
  onSendToBack: () => void
  onBringForward: () => void
  onSendBackward: () => void
}

export function DraggableImage({
  image,
  isSelected,
  onSelect,
  onTransform,
  onBringToFront,
  onSendToBack,
  onBringForward,
  onSendBackward,
}: DraggableImageProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const [isShiftPressed, setIsShiftPressed] = useState(false)

  const handleTransform = useCallback(
    (transform: Partial<CanvasImage>) => {
      onTransform(image.id, transform)
    },
    [image.id, onTransform],
  )

  const { handleScaleStart, handleScale } = useImageScale(image.scale, handleTransform)
  const { handleRotationStart, handleRotation } = useImageRotation(image.rotation, handleTransform)

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault()
      onSelect()
      const startX = e.clientX
      const startY = e.clientY

      const updateOverlayPosition = () => {
        if (containerRef.current && overlayRef.current) {
          const rect = containerRef.current.getBoundingClientRect()
          overlayRef.current.style.left = `${rect.left + window.pageXOffset}px`
          overlayRef.current.style.top = `${rect.top + window.pageYOffset}px`
        }
      }

      const handleMouseMove = (e: MouseEvent) => {
        const dx = e.clientX - startX
        const dy = e.clientY - startY
        handleTransform({ x: image.x + dx, y: image.y + dy })
        requestAnimationFrame(updateOverlayPosition)
      }

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
        updateOverlayPosition()
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

  useEffect(() => {
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

  useEffect(() => {
    if (!isSelected || !containerRef.current || !overlayRef.current) return

    const updateOverlayPosition = () => {
      const containerRect = containerRef.current!.getBoundingClientRect()
      overlayRef.current!.style.left = `${containerRect.left + window.pageXOffset}px`
      overlayRef.current!.style.top = `${containerRect.top + window.pageYOffset}px`
      overlayRef.current!.style.width = `${containerRect.width}px`
      overlayRef.current!.style.height = `${containerRect.height}px`
    }

    updateOverlayPosition()
    window.addEventListener("resize", updateOverlayPosition)
    window.addEventListener("scroll", updateOverlayPosition)

    return () => {
      window.removeEventListener("resize", updateOverlayPosition)
      window.removeEventListener("scroll", updateOverlayPosition)
    }
  }, [isSelected])

  const handleStyle = useMemo(
    () => ({
      width: "20px",
      height: "20px",
      border: "2px solid #3B82F6",
      backgroundColor: "white",
      position: "absolute" as const,
      borderRadius: "4px",
      pointerEvents: "auto" as const,
    }),
    [],
  )

  const imageWidth = 300 * image.scale
  const imageHeight = 300 * image.scale

  return (
    <>
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
          zIndex: image.zIndex,
        }}
      >
        <img
          src={image.src || "/placeholder.svg"}
          alt="Canvas image"
          className="w-full h-full object-cover select-none"
          onMouseDown={handleMouseDown}
        />
      </div>

      {isSelected && (
        <div ref={overlayRef} className="fixed pointer-events-none" style={{ zIndex: 9999 }}>
          <div
            className="absolute inset-0"
            style={{
              transform: `rotate(${image.rotation}deg)`,
              transformOrigin: "center center",
            }}
          >
            {/* Rotation handle */}
            <div
              className={`absolute left-1/2 w-6 h-6 -ml-3 -mt-12 rounded-full border-2 cursor-crosshair transition-all duration-200 pointer-events-auto ${
                isShiftPressed ? "bg-blue-500 border-white" : "bg-white border-blue-500"
              }`}
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

            {/* Layer controls */}
            <div className="absolute top-0 right-0 bg-white border border-gray-300 rounded-md p-2 flex items-center pointer-events-auto">
              <button
                className="p-1 bg-blue-500 text-white rounded-md mr-1 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                onClick={onBringToFront}
                title="Bring to Front"
              >
                <ChevronsUp className="w-4 h-4" />
              </button>
              <button
                className="p-1 bg-blue-500 text-white rounded-md mr-1 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                onClick={onBringForward}
                title="Bring Forward"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                className="p-1 bg-blue-500 text-white rounded-md mr-1 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                onClick={onSendBackward}
                title="Send Backward"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                className="p-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                onClick={onSendToBack}
                title="Send to Back"
              >
                <ChevronsDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

