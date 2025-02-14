import type { CanvasImage } from "@/types"

export function scaleImage(image: CanvasImage, scaleFactor: number): CanvasImage {
  return {
    ...image,
    scale: Math.max(0.1, Math.min(3, image.scale * scaleFactor)),
  }
}

export function rotateImage(image: CanvasImage, angle: number): CanvasImage {
  return {
    ...image,
    rotation: (image.rotation + angle) % 360,
  }
}

export function moveImage(image: CanvasImage, dx: number, dy: number): CanvasImage {
  return {
    ...image,
    x: image.x + dx,
    y: image.y + dy,
  }
}

