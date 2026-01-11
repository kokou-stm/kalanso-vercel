"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PlayCircle, RotateCcw } from "lucide-react"
import { useTranslation } from "@/lib/i18n/use-translation"
import { AssessmentInterface } from "@/components/assessment-interface"
import type { AssessmentQuestion, AssessmentResult } from "@/types/assessment"

interface AssessmentTabProps {
  questions: AssessmentQuestion[]
  masteryThreshold: number
  gloTitle: string
  taxonomyCell: string
  isCompleted: boolean
  currentScore: number
  attempts: number
  onAssessmentSubmit: (result: AssessmentResult) => void
}

export function AssessmentTab({
  questions,
  masteryThreshold,
  gloTitle,
  taxonomyCell,
  isCompleted,
  currentScore,
  attempts,
  onAssessmentSubmit,
}: AssessmentTabProps) {
  const { t } = useTranslation()
  const [assessmentStarted, setAssessmentStarted] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [lastResult, setLastResult] = useState<AssessmentResult | null>(null)

  const handleStartAssessment = () => {
    setAssessmentStarted(true)
    setShowResults(false)
  }

  const handleAssessmentComplete = (result: AssessmentResult) => {
    setLastResult(result)
    setShowResults(true)
    setAssessmentStarted(false)
    onAssessmentSubmit(result)
  }

  const handleRetake = () => {
    setAssessmentStarted(true)
    setShowResults(false)
  }

  if (assessmentStarted) {
    return (
      <AssessmentInterface
        questions={questions}
        masteryThreshold={masteryThreshold}
        gloTitle={gloTitle}
        taxonomyCell={taxonomyCell}
        onComplete={handleAssessmentComplete}
      />
    )
  }

  if (showResults && lastResult) {
    return (
      <Card className="p-8 text-center">
        <h3 className="text-2xl font-bold mb-4">
          {lastResult.mastered ? t("study.masteryAchieved") : t("study.assessmentComplete")}
        </h3>
        <div className="text-6xl font-bold mb-6">{Math.round(lastResult.score)}%</div>
        <p className="text-gray-600 mb-8">
          {t("study.scored")} {lastResult.earnedPoints} {t("points.outOf")} {lastResult.totalPoints}{" "}
          {t("study.pointsAvailable")}
        </p>
        <Button size="lg" onClick={handleRetake}>
          <RotateCcw className="w-5 h-5 mr-2" />
          {t("actions.retakeAssessment")}
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="p-8 text-center">
        <h3 className="text-2xl font-bold mb-4">{t("study.readyForAssessment")}</h3>
        <p className="text-gray-600 mb-6">
          {t("study.assessmentInfo", { threshold: masteryThreshold, count: questions.length })}
        </p>

        {isCompleted && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-700">
              {t("study.previousAttempts")}: {attempts}
            </p>
            <p className="text-sm text-gray-700">
              {t("study.bestScore")}: {currentScore}%
            </p>
          </div>
        )}

        <Button size="lg" onClick={handleStartAssessment} className="min-w-[200px]">
          <PlayCircle className="w-5 h-5 mr-2" />
          {isCompleted ? t("study.retakeAssessment") : t("study.startAssessment")}
        </Button>
      </Card>
    </div>
  )
}
