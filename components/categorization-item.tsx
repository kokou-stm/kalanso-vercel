"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface CategorizationItemProps {
  id: string
  text: string
  imageUrl?: string
  isDragging?: boolean
  isCorrect?: boolean
  showFeedback?: boolean
}

export function CategorizationItem({
  id,
  text,
  imageUrl,
  isDragging,
  isCorrect,
  showFeedback,
}: CategorizationItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "p-3 cursor-grab active:cursor-grabbing transition-all",
        isDragging && "opacity-50 scale-105",
        showFeedback && isCorrect && "border-green-500 bg-green-50",
        showFeedback && isCorrect === false && "border-red-500 bg-red-50",
      )}
    >
      <div className="flex items-center gap-2">
        <div {...attributes} {...listeners} className="text-gray-400 hover:text-gray-600">
          <GripVertical className="h-4 w-4" />
        </div>
        {imageUrl && <img src={imageUrl || "/placeholder.svg"} alt={text} className="w-12 h-12 object-cover rounded" />}
        <span className="text-sm font-medium">{text}</span>
      </div>
    </Card>
  )
}
