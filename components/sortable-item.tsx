"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"

interface SortableItemProps {
  id: string
  text: string
  index?: number // Made index optional since it's not always provided
  isCorrect?: boolean
  showFeedback?: boolean
}

export function SortableItem({ id, text, index, isCorrect, showFeedback }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 p-4 bg-white dark:bg-gray-900 border-2 rounded-lg",
        isDragging && "z-50 shadow-xl opacity-90",
        showFeedback && isCorrect && "border-green-500 bg-green-50 dark:bg-green-950",
        showFeedback && !isCorrect && "border-red-500 bg-red-50 dark:bg-red-950",
        !showFeedback && "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700",
      )}
    >
      {!showFeedback && (
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <GripVertical className="w-5 h-5" />
        </div>
      )}
      <div className="flex-1">
        <p className="text-sm md:text-base">{text}</p>
      </div>
      {index !== undefined && (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 font-semibold text-sm">
          {index + 1}
        </div>
      )}
    </div>
  )
}
