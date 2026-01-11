"use client"

import type React from "react"

import { Clock, Trophy, BarChart, ChevronRight } from "lucide-react"
import { useTranslation } from "@/lib/i18n/use-translation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { GLOProgressIndicator } from "@/components/glo-progress-indicator"
import { GLOStatusBadge } from "@/components/glo-status-badge"
import type { GLOCardProps } from "@/types/glo"

export function GLOCard({ glo, progress, onStartContinue, variant = "default" }: GLOCardProps) {
  const { t } = useTranslation()

  const difficultyStyles = {
    easy: { color: "text-green-600", bg: "bg-green-100", dot: "bg-green-500" },
    medium: { color: "text-orange-600", bg: "bg-orange-100", dot: "bg-orange-500" },
    hard: { color: "text-red-600", bg: "bg-red-100", dot: "bg-red-500" },
  }

  const difficulty = difficultyStyles[glo.difficulty]

  const getActionButton = () => {
    switch (progress.status) {
      case "not_started":
        return {
          label: t("glo.actions.startLearning"),
          variant: "default" as const,
        }
      case "in_progress":
        return {
          label: t("glo.actions.continue"),
          variant: "default" as const,
        }
      case "completed":
        return {
          label: t("glo.actions.review"),
          variant: "outline" as const,
        }
      case "mastered":
        return {
          label: t("glo.actions.view"),
          variant: "outline" as const,
        }
    }
  }

  const actionButton = getActionButton()

  const handleCardClick = () => {
    console.log("[v0] Card clicked:", glo.id)
    onStartContinue(glo.id)
  }

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click
    console.log("[v0] Button clicked:", glo.id)
    onStartContinue(glo.id)
  }

  if (variant === "compact") {
    return (
      <Card
        className="group cursor-pointer transition-all hover:shadow-md"
        onClick={handleCardClick}
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onStartContinue(glo.id)}
      >
        <div className="flex items-center gap-4 p-4">
          {/* Title and Badge */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm truncate">{glo.title}</h3>
              <span className="shrink-0 rounded-full bg-gradient-to-r from-purple-500 to-purple-700 px-2 py-0.5 text-xs font-medium text-white">
                {glo.taxonomyCell}
              </span>
            </div>
          </div>

          {/* Progress Mini */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex gap-1">
              <div className={`h-2 w-2 rounded-full ${progress.contentCompleted ? "bg-green-500" : "bg-gray-300"}`} />
              <div className={`h-2 w-2 rounded-full ${progress.practiceCompleted ? "bg-green-500" : "bg-gray-300"}`} />
              <div
                className={`h-2 w-2 rounded-full ${progress.assessmentCompleted ? "bg-green-500" : "bg-gray-300"}`}
              />
            </div>
          </div>

          {/* Status */}
          <GLOStatusBadge status={progress.status} />

          {/* Button */}
          <Button
            size="sm"
            variant={actionButton.variant}
            className="shrink-0 cursor-pointer"
            onClick={handleButtonClick}
          >
            {actionButton.label}
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card
      className="group cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
      onClick={handleCardClick}
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onStartContinue(glo.id)}
    >
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-xl font-bold leading-tight flex-1">{glo.title}</h3>
            <span className="shrink-0 rounded-full bg-gradient-to-r from-purple-500 to-purple-700 px-3 py-1 text-xs font-medium text-white shadow-sm">
              {glo.taxonomyCell} - {glo.taxonomyCellName}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${difficulty.bg} ${difficulty.color}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${difficulty.dot}`} />
              {t(`difficulty.${glo.difficulty}`)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{glo.learningObjective}</p>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>
              {glo.estimatedTime} {t("glo.estimatedTime")}
            </span>
          </div>
        </div>

        {/* Progress Section */}
        <div className="space-y-3 pt-2 border-t">
          <GLOProgressIndicator
            contentCompleted={progress.contentCompleted}
            practiceCompleted={progress.practiceCompleted}
            assessmentCompleted={progress.assessmentCompleted}
            status={progress.status}
          />
        </div>

        {/* Status Section */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-3">
            <GLOStatusBadge status={progress.status} />
            {progress.attempts > 0 && (
              <div className="flex items-center gap-4 text-sm">
                {progress.currentScore > 0 && (
                  <div className="flex items-center gap-1.5">
                    {progress.status === "mastered" ? (
                      <Trophy className="h-4 w-4 text-green-600" />
                    ) : (
                      <BarChart className="h-4 w-4 text-gray-500" />
                    )}
                    <span className={progress.status === "mastered" ? "font-semibold text-green-700" : "text-gray-700"}>
                      {progress.status === "mastered" ? t("glo.mastered") : t("glo.current")}: {progress.currentScore}%
                    </span>
                  </div>
                )}
                <span className="text-gray-500">
                  {progress.attempts} {progress.attempts === 1 ? t("glo.attempt") : t("glo.attempts")}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer/Action */}
        <div className="flex items-center gap-3 pt-2">
          <Button className="flex-1 cursor-pointer" variant={actionButton.variant} onClick={handleButtonClick}>
            {actionButton.label}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          >
            {t("actions.viewDetails")}
          </Button>
        </div>
      </div>
    </Card>
  )
}
