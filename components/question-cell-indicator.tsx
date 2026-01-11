"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTranslation } from "@/lib/i18n/use-translation"
import { Book, Brain, Cog, Eye, MapPin } from "lucide-react"

interface QuestionCellIndicatorProps {
  cellCode: string // e.g., "3C"
  position?: "sidebar" | "top" | "inline"
  showDescription?: boolean
}

export function QuestionCellIndicator({
  cellCode,
  position = "sidebar",
  showDescription = false,
}: QuestionCellIndicatorProps) {
  const { t } = useTranslation()

  // Parse cell code
  const cognitiveLevel = Number.parseInt(cellCode[0])
  const knowledgeDimension = cellCode[1]

  // Get cognitive level name
  const cognitiveNames = ["remember", "understand", "apply", "analyze", "evaluate", "create"]
  const cognitiveName = t(`taxonomy.cognitive.${cognitiveNames[cognitiveLevel - 1]}`)

  // Get knowledge dimension name
  const knowledgeNames: Record<string, string> = {
    A: "factual",
    B: "conceptual",
    C: "procedural",
    D: "metacognitive",
  }
  const knowledgeName = t(`taxonomy.knowledge.${knowledgeNames[knowledgeDimension]}`)

  // Get description
  const description = t(`taxonomy.indicator.description.${cellCode}`)

  // Get icon based on dimension
  const getDimensionIcon = () => {
    switch (knowledgeDimension) {
      case "A":
        return <Book className="w-6 h-6 text-blue-500" />
      case "B":
        return <Brain className="w-6 h-6 text-blue-500" />
      case "C":
        return <Cog className="w-6 h-6 text-blue-500" />
      case "D":
        return <Eye className="w-6 h-6 text-blue-500" />
      default:
        return null
    }
  }

  // SIDEBAR POSITION
  if (position === "sidebar") {
    return (
      <Card className="w-[200px] p-4 bg-blue-50 border-blue-200 sticky top-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{t("taxonomy.indicator.assessing")}:</span>
          </div>

          {/* Icon */}
          <div className="flex justify-center">{getDimensionIcon()}</div>

          {/* Cell Code */}
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">{t("taxonomy.indicator.cell")}</p>
            <Badge variant="outline" className="text-2xl font-bold px-4 py-2 bg-white border-blue-300 text-blue-700">
              {cellCode}
            </Badge>
          </div>

          <div className="border-t border-blue-200 pt-3 space-y-2">
            {/* Cognitive Level */}
            <div>
              <p className="text-xs text-gray-500">{t("taxonomy.cognitiveLevel")}</p>
              <p className="text-sm font-semibold text-gray-900">{cognitiveName}</p>
            </div>

            {/* Knowledge Dimension */}
            <div>
              <p className="text-xs text-gray-500">{t("taxonomy.knowledgeDimension")}</p>
              <p className="text-sm font-semibold text-gray-900">{knowledgeName}</p>
            </div>
          </div>

          {/* Description */}
          {showDescription && (
            <div className="pt-3 border-t border-blue-200">
              <p className="text-xs text-gray-600 italic">&quot;{description}&quot;</p>
            </div>
          )}
        </div>
      </Card>
    )
  }

  // TOP POSITION
  if (position === "top") {
    return (
      <div className="w-full bg-blue-50 border-b border-blue-200 py-2 px-4">
        <div className="flex items-center justify-center gap-3">
          <MapPin className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-gray-700">
            {t("taxonomy.indicator.cell")} {cellCode} - {cognitiveName} × {knowledgeName}
          </span>
        </div>
      </div>
    )
  }

  // INLINE POSITION
  return (
    <Badge variant="outline" className="bg-gray-100 text-gray-700 text-xs">
      {cellCode} - {cognitiveName} × {knowledgeName}
    </Badge>
  )
}
