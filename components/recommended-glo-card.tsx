"use client"

import { Sparkles } from "lucide-react"
import { GLOCard } from "@/components/glo-card"
import { useTranslation } from "@/lib/i18n/use-translation"
import type { DashboardGLO } from "@/types/learner"

interface RecommendedGLOCardProps {
  dashboardGLO: DashboardGLO
  onStartContinue: (gloId: string) => void
}

export function RecommendedGLOCard({ dashboardGLO, onStartContinue }: RecommendedGLOCardProps) {
  const { t } = useTranslation()

  return (
    <div className="relative">
      {/* Recommended Badge */}
      <div className="absolute -top-3 left-4 z-10 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-1 text-xs font-semibold text-white shadow-md">
        <Sparkles className="h-3 w-3" />
        {t("dashboard.recommended")}
      </div>

      {/* Animated Border */}
      <div className="relative rounded-lg p-[2px] bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 animate-pulse">
        <div className="rounded-lg bg-white">
          <GLOCard glo={dashboardGLO.glo} progress={dashboardGLO.progress} onStartContinue={onStartContinue} />
        </div>
      </div>
    </div>
  )
}
