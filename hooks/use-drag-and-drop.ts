import { useState, type DragEvent } from "react"
import type { DraggedItem } from "@/types"

export function useDragAndDrop() {
  const [draggedItem, setDraggedItem] = useState<DraggedItem | null>(null)

  const handleDragStart = (e: DragEvent<HTMLImageElement>, src: string) => {
    setDraggedItem({ src })
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
  }

  return { draggedItem, handleDragStart, handleDragEnd }
}

