"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTranslation } from "@/lib/i18n/use-translation"
import type { LevelMastery } from "@/types/taxonomy"
import { ChevronRight } from "lucide-react"

interface SimplifiedTaxonomyViewProps {
  levelMasteries: LevelMastery[]
  onLevelClick?: (level: number) => void
}

export function SimplifiedTaxonomyView({ levelMasteries, onLevelClick }: SimplifiedTaxonomyViewProps) {
  const { t } = useTranslation()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "mastered":
        return "bg-green-500/10 text-green-700 border-green-500/20"
      case "proficient":
        return "bg-orange-500/10 text-orange-700 border-orange-500/20"
      case "developing":
        return "bg-red-500/10 text-red-700 border-red-500/20"
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-500/20"
    }
  }

  const getProgressColor = (averageScore: number) => {
    if (averageScore >= 85) return "bg-green-500"
    if (averageScore >= 70) return "bg-orange-500"
    if (averageScore > 0) return "bg-red-500"
    return "bg-gray-300"
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "mastered":
        return "✓"
      case "proficient":
        return "◐"
      default:
        return "○"
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center space-y-1 mb-6">
        <h2 className="text-xl font-semibold text-gray-900">{t("taxonomy.simplified.title")}</h2>
        <p className="text-sm text-gray-600">{t("taxonomy.simplified.subtitle")}</p>
      </div>

      {/* Level Cards */}
      <div className="space-y-3">
        {levelMasteries.map((level) => (
          <Card
            key={level.level}
            className="p-4 hover:shadow-md transition-all duration-200 cursor-pointer group"
            onClick={() => onLevelClick?.(level.level)}
          >
            <div className="space-y-3">
              {/* Header Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-bold text-lg">
                    {level.level}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{level.name}</h3>
                    <p className="text-xs text-gray-500">
                      {level.cellsMastered}/{level.totalCells} {t("taxonomy.simplified.cellsMastered")} •{" "}
                      {level.cellsStarted} {t("taxonomy.simplified.started")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{level.averageScore}%</p>
                    <Badge variant="outline" className={getStatusColor(level.status)}>
                      {getStatusIcon(level.status)} {t(`taxonomy.simplified.${level.status}`)}
                    </Badge>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${getProgressColor(
                      level.averageScore,
                    )}`}
                    style={{ width: `${level.averageScore}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Footer Hint */}
      <p className="text-center text-sm text-gray-500 mt-6">{t("taxonomy.simplified.clickToExpand")}</p>
    </div>
  )
}
