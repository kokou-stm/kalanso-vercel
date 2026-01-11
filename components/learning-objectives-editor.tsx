"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Plus, Sparkles, Loader2 } from "lucide-react"
import { useTranslation } from "@/lib/i18n/use-translation"

interface LearningObjectivesEditorProps {
  objectives: string[]
  onObjectivesChange: (objectives: string[]) => void
}

export function LearningObjectivesEditor({ objectives, onObjectivesChange }: LearningObjectivesEditorProps) {
  const { t } = useTranslation()
  const [isAIGenerating, setIsAIGenerating] = useState(false)

  const handleAdd = () => {
    if (objectives.length < 6) {
      onObjectivesChange([...objectives, ""])
    }
  }

  const handleRemove = (index: number) => {
    const newObjectives = objectives.filter((_, i) => i !== index)
    onObjectivesChange(newObjectives)
  }

  const handleChange = (index: number, value: string) => {
    const newObjectives = [...objectives]
    newObjectives[index] = value
    onObjectivesChange(newObjectives)
  }

  const handleAIGenerate = async () => {
    setIsAIGenerating(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    // Mock AI-generated objectives
    onObjectivesChange([
      "Execute julienne cuts with 3mm × 3mm × 5cm precision",
      "Demonstrate proper knife grip and hand positioning",
      "Apply consistent cutting rhythm for efficiency",
      "Identify common cutting errors and correct them",
    ])
    setIsAIGenerating(false)
  }

  return (
    <div className="space-y-4">
      <Label>{t("instructor.upload.learningObjectives")}</Label>
      <p className="text-sm text-gray-600">{t("instructor.upload.objectivesHint")}</p>

      <div className="space-y-3">
        {objectives.map((objective, index) => (
          <div key={index} className="flex items-start gap-2">
            <span className="text-sm font-medium text-gray-500 mt-2">{index + 1}.</span>
            <Input
              value={objective}
              onChange={(e) => handleChange(index, e.target.value)}
              placeholder={t("instructor.upload.objectivePlaceholder")}
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleRemove(index)}
              disabled={objectives.length === 1}
              className="mt-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleAdd}
          disabled={objectives.length >= 6}
          className="flex-1"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t("instructor.upload.addObjective")}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleAIGenerate}
          disabled={isAIGenerating}
          className="flex-1 border-purple-300 text-purple-700 hover:bg-purple-50 bg-transparent"
        >
          {isAIGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t("instructor.upload.generating")}
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              {t("instructor.upload.aiGenerate")}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
