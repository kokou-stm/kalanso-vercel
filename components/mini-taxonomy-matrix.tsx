"use client"

import { useTranslation } from "@/lib/i18n/use-translation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import { useState } from "react"
import { BloomPracticeGenerator } from "@/components/bloom-practice-generator"
import type { BloomCell } from "@/types/bloom-cell"

interface MiniTaxonomyMatrixProps {
  cellScores: Record<string, number>
  onViewFull: () => void
}

export function MiniTaxonomyMatrix({ cellScores, onViewFull }: MiniTaxonomyMatrixProps) {
  const { t } = useTranslation()
  const [selectedCell, setSelectedCell] = useState<BloomCell | null>(null)
  const [showPracticeGenerator, setShowPracticeGenerator] = useState(false)

  const cognitiveProcesses = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"]
  const knowledgeDimensions = ["Factual", "Conceptual", "Procedural", "Metacognitive"]

  const getCellColor = (score: number) => {
    if (score === 0) return "bg-gray-200"
    if (score < 70) return "bg-red-300"
    if (score < 85) return "bg-orange-300"
    return "bg-green-400"
  }

  const getCellCode = (cogIndex: number, knowIndex: number) => {
    return `${cogIndex + 1}${String.fromCharCode(65 + knowIndex)}`
  }

  const handleCellClick = (cogIndex: number, knowIndex: number) => {
    const cellCode = getCellCode(cogIndex, knowIndex)
    const score = cellScores[cellCode] || 0

    setSelectedCell({
      cognitive: cognitiveProcesses[cogIndex],
      knowledge: knowledgeDimensions[knowIndex],
      currentMastery: score,
      courseName: "Introduction to Machine Learning",
      moduleName: "Neural Networks Fundamentals",
    })
    setShowPracticeGenerator(true)
  }

  const handlePracticeComplete = (masteryGain: number) => {
    console.log(`[v0] Practice complete! Mastery gain: +${masteryGain}%`)
    // TODO: Update mastery in database and refresh UI
  }

  return (
    <>
      <Card className="p-4 bg-white shadow-sm">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">{t("dashboard.competencyMatrix")}</h3>
            <Button variant="ghost" size="sm" onClick={onViewFull} className="text-xs">
              {t("dashboard.viewFull")}
              <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          </div>

          {/* Compact Grid */}
          <div className="grid grid-cols-4 gap-1">
            {cognitiveProcesses.map((_, cogIndex) =>
              knowledgeDimensions.map((_, knowIndex) => {
                const cellCode = getCellCode(cogIndex, knowIndex)
                const score = cellScores[cellCode] || 0
                return (
                  <div
                    key={cellCode}
                    onClick={() => handleCellClick(cogIndex, knowIndex)}
                    className={`aspect-square rounded ${getCellColor(score)} flex items-center justify-center text-[10px] font-medium text-gray-700 hover:ring-2 hover:ring-purple-400 cursor-pointer transition-all`}
                    title={`${cellCode}: ${score}%`}
                  >
                    {cellCode}
                  </div>
                )
              }),
            )}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded bg-gray-200" />
              <span>{t("dashboard.notStarted")}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded bg-red-300" />
              <span>&lt;70%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded bg-orange-300" />
              <span>70-84%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded bg-green-400" />
              <span>≥85%</span>
            </div>
          </div>
        </div>
      </Card>

      <BloomPracticeGenerator
        isOpen={showPracticeGenerator}
        onClose={() => setShowPracticeGenerator(false)}
        cell={selectedCell}
        studentId="student_123"
        onComplete={handlePracticeComplete}
      />
    </>
  )
}
