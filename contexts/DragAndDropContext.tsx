"use client"

import type React from "react"
import { createContext, useContext, useState, type ReactNode } from "react"
import type { DraggedItem } from "@/types"

interface DragAndDropContextType {
  draggedItem: DraggedItem | null
  handleDragStart: (e: React.DragEvent<HTMLImageElement>, src: string) => void
  handleDragEnd: () => void
}

const DragAndDropContext = createContext<DragAndDropContextType | undefined>(undefined)

export function DragAndDropProvider({ children }: { children: ReactNode }) {
  const [draggedItem, setDraggedItem] = useState<DraggedItem | null>(null)

  const handleDragStart = (e: React.DragEvent<HTMLImageElement>, src: string) => {
    setDraggedItem({ src })
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
  }

  return (
    <DragAndDropContext.Provider value={{ draggedItem, handleDragStart, handleDragEnd }}>
      {children}
    </DragAndDropContext.Provider>
  )
}

export function useDragAndDrop() {
  const context = useContext(DragAndDropContext)
  if (context === undefined) {
    throw new Error("useDragAndDrop must be used within a DragAndDropProvider")
  }
  return context
}

