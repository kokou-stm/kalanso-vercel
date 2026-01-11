"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Clock, Target, TrendingUp, Home } from "lucide-react"
import { useTranslation } from "@/lib/i18n/use-translation"
import type { FullGLO, GLOProgress } from "@/types/glo"

interface StudySidebarProps {
  glo: FullGLO
  progress: GLOProgress
  timeSpent: number
  onBackToDashboard: () => void
}

export function StudySidebar({ glo, progress, timeSpent, onBackToDashboard }: StudySidebarProps) {
  const { t } = useTranslation()

  return (
    <aside className="space-y-6">
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          {t("study.learningObjectives")}
        </h3>
        <div className="space-y-3">
          {glo.learningObjectivesChecklist.map((objective, index) => (
            <div key={index} className="flex items-start gap-2">
              <Checkbox id={`obj-${index}`} className="mt-1" />
              <label htmlFor={`obj-${index}`} className="text-sm text-gray-700 cursor-pointer">
                {objective}
              </label>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">{t("study.quickTips")}</h3>
        <ul className="space-y-2">
          {glo.tips.map((tip, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-blue-600">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-600" />
          {t("study.timeTracking")}
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{t("study.timeOnGLO")}</span>
            <span className="text-2xl font-bold">{timeSpent}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{t("study.estimated")}</span>
            <span className="text-sm text-gray-500">
              {glo.estimatedTime} {t("glo.estimatedTime")}
            </span>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          {t("study.masteryInfo")}
        </h3>
        <div className="space-y-2 text-sm">
          <p className="text-gray-700">{t("study.needMastery", { threshold: glo.masteryThreshold })}</p>
          {progress.currentScore > 0 && (
            <p className="text-gray-700">
              {t("study.yourBest")}: {progress.currentScore}%
            </p>
          )}
        </div>
      </Card>

      <Button variant="outline" className="w-full bg-transparent" onClick={onBackToDashboard}>
        <Home className="w-4 h-4 mr-2" />
        {t("study.returnToDashboard")}
      </Button>
    </aside>
  )
}
