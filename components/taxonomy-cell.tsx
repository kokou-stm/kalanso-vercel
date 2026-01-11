"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { ProgressCircle } from "@/components/progress-circle"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useTranslation } from "@/lib/i18n/use-translation"
import type { TaxonomyCell as TaxonomyCellType, LearnerCellScore } from "@/types/taxonomy"

interface TaxonomyCellProps {
  cell: TaxonomyCellType
  score?: LearnerCellScore
  onClick?: () => void
}

export function TaxonomyCell({ cell, score, onClick }: TaxonomyCellProps) {
  const { t, interpolate } = useTranslation()
  const [isHovered, setIsHovered] = useState(false)

  const masteryPercentage = score?.masteryPercentage || 0
  const glosCompleted = score?.glosCompleted || 0

  // Get mastery level color
  const getMasteryColor = () => {
    if (masteryPercentage >= 85) return "from-green-50 to-green-100 border-green-300"
    if (masteryPercentage >= 70) return "from-orange-50 to-orange-100 border-orange-300"
    if (masteryPercentage > 0) return "from-red-50 to-red-100 border-red-300"
    return "from-gray-50 to-gray-100 border-gray-200"
  }

  // Get primary verb
  const primaryVerb = cell.typicalVerbs[0] || ""

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card
            className={`relative cursor-pointer p-4 transition-all duration-200 bg-gradient-to-br ${getMasteryColor()} ${
              isHovered ? "scale-102 shadow-lg" : "shadow"
            }`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onClick}
          >
            {/* Cell code in top-left */}
            <div className="absolute top-2 left-2 text-xs font-semibold text-gray-600">{cell.code}</div>

            {/* Primary verb - centered */}
            <div className="flex items-center justify-center min-h-[80px]">
              <p className="text-xl font-bold text-gray-900 text-center leading-tight">{primaryVerb}</p>
            </div>

            {/* Progress circle in bottom-right */}
            <div className="absolute bottom-2 right-2">
              <ProgressCircle percentage={masteryPercentage} size={40} strokeWidth={3} showPercentage={false} />
            </div>

            {/* Mastery percentage below verb */}
            <div className="mt-2 text-center">
              <p className="text-sm font-medium text-gray-700">{Math.round(masteryPercentage)}%</p>
            </div>
          </Card>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-sm p-4">
          <div className="space-y-2">
            <div>
              <p className="font-semibold text-purple-600">{cell.code}</p>
              <p className="text-sm font-medium">
                {cell.cognitiveName} - {cell.knowledgeName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-700">{cell.description}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600">{t("taxonomy.modal.typicalVerbs")}:</p>
              <p className="text-xs text-gray-600">{cell.typicalVerbs.join(", ")}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600">{t("taxonomy.modal.example")}:</p>
              <p className="text-xs text-gray-600 italic">{cell.example}</p>
            </div>
            <div className="pt-2 border-t">
              <p className="text-sm font-medium">
                {interpolate(t("taxonomy.masteryPercentage"), { percentage: Math.round(masteryPercentage) })}
              </p>
              <p className="text-xs text-gray-600">
                {glosCompleted === 0
                  ? t("taxonomy.noGlos")
                  : interpolate(
                      glosCompleted === 1 ? t("taxonomy.glosCompleted") : t("taxonomy.glosCompleted_plural"),
                      { count: glosCompleted },
                    )}
              </p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
