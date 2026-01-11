"use client"

import { useTranslation } from "@/lib/i18n/use-translation"
import type { GLOStatus } from "@/types/glo"

interface GLOStatusBadgeProps {
  status: GLOStatus
  className?: string
}

export function GLOStatusBadge({ status, className = "" }: GLOStatusBadgeProps) {
  const { t } = useTranslation()

  const styles = {
    not_started: "bg-gray-100 text-gray-700",
    in_progress: "bg-blue-100 text-blue-800",
    completed: "bg-orange-100 text-orange-800",
    mastered: "bg-green-100 text-green-800",
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${styles[status]} ${className}`}
    >
      {t(`glo.status.${status}`)}
    </span>
  )
}
