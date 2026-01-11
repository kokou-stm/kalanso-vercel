"use client"

import { Trophy, Flame, BarChart3 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useTranslation } from "@/lib/i18n/use-translation"
import type { LearnerProgress } from "@/types/learner"

interface WelcomeHeaderProps {
  firstName: string
  studentId: string
  language: string
  progress: LearnerProgress
}

export function WelcomeHeader({ firstName, studentId, progress }: WelcomeHeaderProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
        {t("dashboard.welcome")}, {firstName}!
      </h1>

      {/* Student ID display can be added if needed */}
      <p className="text-sm text-gray-600">Student ID: {studentId}</p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Cells Mastered */}
        <Card className="p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-purple-100">
              <Trophy className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{progress.cellsMastered} / 24</div>
              <div className="text-sm text-gray-600">{t("dashboard.cellsMastered")}</div>
            </div>
          </div>
        </Card>

        {/* Current Streak */}
        <Card className="p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-orange-100">
              <Flame className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {progress.currentStreak} {t("dashboard.days")}
              </div>
              <div className="text-sm text-gray-600">{t("dashboard.currentStreak")}</div>
            </div>
          </div>
        </Card>

        {/* Average Score */}
        <Card className="p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-100">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{progress.averageScore}%</div>
              <div className="text-sm text-gray-600">{t("dashboard.avgScore")}</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
