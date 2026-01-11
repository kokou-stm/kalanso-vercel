"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ChevronDown, ChevronUp, Lightbulb, CheckCircle2 } from "lucide-react"
import { useTranslation } from "@/lib/i18n/use-translation"
import type { GLOPractice } from "@/types/glo"

interface PracticeTabProps {
  practice: GLOPractice[]
  isCompleted: boolean
  onSubmitPractice: () => void
}

export function PracticeTab({ practice, isCompleted, onSubmitPractice }: PracticeTabProps) {
  const { t } = useTranslation()
  const [showHints, setShowHints] = useState<Record<number, boolean>>({})
  const [responses, setResponses] = useState<Record<number, string>>({})

  const toggleHints = (index: number) => {
    setShowHints((prev) => ({ ...prev, [index]: !prev[index] }))
  }

  const handleResponseChange = (index: number, value: string) => {
    setResponses((prev) => ({ ...prev, [index]: value }))
  }

  const getTypeIcon = (type: GLOPractice["type"]) => {
    const icons = {
      exercise: "🏋️",
      reflection: "💭",
      scenario: "🎬",
    }
    return icons[type]
  }

  return (
    <div className="space-y-6">
      {practice.map((item, index) => (
        <Card key={index} className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-2xl">{getTypeIcon(item.type)}</span>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">
                {t(`study.practiceType.${item.type}`)} {index + 1}
              </h3>
              <p className="text-gray-700 whitespace-pre-wrap">{item.prompt}</p>
            </div>
          </div>

          {item.hints && item.hints.length > 0 && (
            <div className="mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleHints(index)}
                className="text-amber-600 hover:text-amber-700"
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                {showHints[index] ? t("actions.hideHints") : t("actions.showHints")}
                {showHints[index] ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
              </Button>

              {showHints[index] && (
                <div className="mt-3 p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
                  {item.hints.map((hint, hintIndex) => (
                    <div key={hintIndex} className="flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-600 mt-1 flex-shrink-0" />
                      <p className="text-sm text-gray-700">{hint}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <Textarea
            placeholder={t("study.yourResponse")}
            value={responses[index] || ""}
            onChange={(e) => handleResponseChange(index, e.target.value)}
            rows={6}
            className="w-full"
          />
        </Card>
      ))}

      <div className="flex justify-center pt-4">
        <Button size="lg" onClick={onSubmitPractice} disabled={isCompleted} className="min-w-[200px]">
          {isCompleted ? (
            <>
              <CheckCircle2 className="w-5 h-5 mr-2" />
              {t("study.practiceCompleted")}
            </>
          ) : (
            t("study.submitPractice")
          )}
        </Button>
      </div>
    </div>
  )
}
