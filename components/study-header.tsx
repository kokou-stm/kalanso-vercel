"use client"

import { ArrowLeft, BookOpen, Dumbbell, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/i18n/use-translation"
import type { FullGLO, GLOProgress } from "@/types/glo"

interface StudyHeaderProps {
  glo: FullGLO
  progress: GLOProgress
  onBack: () => void
}

export function StudyHeader({ glo, progress, onBack }: StudyHeaderProps) {
  const { t } = useTranslation()

  return (
    <header className="sticky top-0 z-10 bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-start gap-4">
          <Button variant="ghost" onClick={onBack} className="flex-shrink-0">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("study.backToDashboard")}
          </Button>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold">{glo.title}</h1>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                {glo.taxonomyCell} - {glo.taxonomyCellName}
              </Badge>
            </div>

            <p className="text-gray-600 text-sm mb-3">
              {t("study.learningObjective")}: {glo.learningObjective}
            </p>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    progress.contentCompleted ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  {progress.contentCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : (
                    <BookOpen className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className="w-12 h-1 bg-gray-300">
                  <div className={`h-full ${progress.practiceCompleted ? "bg-green-500" : "bg-gray-300"}`} />
                </div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    progress.practiceCompleted ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  {progress.practiceCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : (
                    <Dumbbell className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className="w-12 h-1 bg-gray-300">
                  <div className={`h-full ${progress.assessmentCompleted ? "bg-green-500" : "bg-gray-300"}`} />
                </div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    progress.assessmentCompleted ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  {progress.assessmentCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  )}
                </div>
              </div>
              <span className="text-sm text-gray-500">
                {t("study.progressLabel")}: {t("glo.progress.content")} {progress.contentCompleted ? "✓" : "○"},{" "}
                {t("glo.progress.practice")} {progress.practiceCompleted ? "✓" : "○"}, {t("glo.progress.assessment")}{" "}
                {progress.assessmentCompleted ? "✓" : "○"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
