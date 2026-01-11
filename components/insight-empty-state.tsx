"use client"

import { Card } from "@/components/ui/card"
import { Lightbulb } from "lucide-react"

export function InsightEmptyState() {
  return (
    <Card className="p-8 text-center bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <div className="flex justify-center mb-4">
        <div className="bg-blue-100 rounded-full p-4">
          <Lightbulb className="h-8 w-8 text-blue-600" />
        </div>
      </div>
      <h3 className="font-semibold text-lg mb-2 text-gray-900">No insights right now</h3>
      <p className="text-sm text-gray-600 max-w-md mx-auto">
        Keep learning! We'll show relevant real-world connections as you progress through your course.
      </p>
    </Card>
  )
}
