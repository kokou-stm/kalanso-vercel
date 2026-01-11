"use client"

import { Book, Dumbbell, CheckCircle2, Check } from "lucide-react"
import { useTranslation } from "@/lib/i18n/use-translation"

interface GLOProgressIndicatorProps {
  contentCompleted: boolean
  practiceCompleted: boolean
  assessmentCompleted: boolean
  status: "not_started" | "in_progress" | "completed" | "mastered"
}

export function GLOProgressIndicator({
  contentCompleted,
  practiceCompleted,
  assessmentCompleted,
  status,
}: GLOProgressIndicatorProps) {
  const { t } = useTranslation()

  const sections = [
    {
      key: "content",
      icon: Book,
      label: t("glo.progress.content"),
      completed: contentCompleted,
      isCurrent: status === "in_progress" && !contentCompleted,
    },
    {
      key: "practice",
      icon: Dumbbell,
      label: t("glo.progress.practice"),
      completed: practiceCompleted,
      isCurrent: status === "in_progress" && contentCompleted && !practiceCompleted,
    },
    {
      key: "assessment",
      icon: CheckCircle2,
      label: t("glo.progress.assessment"),
      completed: assessmentCompleted,
      isCurrent: status === "in_progress" && contentCompleted && practiceCompleted && !assessmentCompleted,
    },
  ]

  return (
    <div className="flex items-center gap-2">
      {sections.map((section, index) => {
        const Icon = section.icon
        return (
          <div key={section.key} className="flex items-center gap-2">
            <div
              className={`relative flex items-center gap-1.5 rounded-lg border px-3 py-2 ${
                section.isCurrent
                  ? "border-blue-500 bg-blue-50"
                  : section.completed
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 bg-gray-50"
              }`}
              aria-label={`${section.label}: ${section.completed ? t("glo.progress.completed") : section.isCurrent ? t("glo.progress.current") : t("glo.progress.notStarted")}`}
            >
              <Icon
                className={`h-4 w-4 ${
                  section.isCurrent ? "text-blue-600" : section.completed ? "text-green-600" : "text-gray-400"
                }`}
              />
              <span
                className={`text-xs font-medium ${
                  section.isCurrent ? "text-blue-700" : section.completed ? "text-green-700" : "text-gray-500"
                }`}
              >
                {section.label}
              </span>
              {section.completed && (
                <Check className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-green-500 p-0.5 text-white" />
              )}
            </div>
            {index < sections.length - 1 && (
              <div className={`h-px w-4 ${section.completed ? "bg-green-500" : "bg-gray-300"}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
