"use client"

import type React from "react"

import { useDroppable } from "@dnd-kit/core"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface DroppableCategoryProps {
  id: string
  label: string
  description?: string
  color?: string
  children: React.ReactNode
  showFeedback?: boolean
  allCorrect?: boolean
  hasIncorrect?: boolean
}

export function DroppableCategory({
  id,
  label,
  description,
  color,
  children,
  showFeedback,
  allCorrect,
  hasIncorrect,
}: DroppableCategoryProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  })

  return (
    <Card
      ref={setNodeRef}
      className={cn(
        "p-4 min-h-[150px] transition-all",
        isOver && "ring-2 ring-blue-500 bg-blue-50",
        showFeedback && allCorrect && "border-green-500 bg-green-50",
        showFeedback && hasIncorrect && "border-red-500 bg-red-50",
      )}
      style={{
        borderColor: isOver ? "#3b82f6" : color || undefined,
        borderWidth: color || isOver ? "2px" : undefined,
      }}
    >
      <div className="space-y-3">
        <div>
          <h4 className="font-semibold text-base">{label}</h4>
          {description && <p className="text-sm text-gray-600">{description}</p>}
        </div>
        {children}
      </div>
    </Card>
  )
}
