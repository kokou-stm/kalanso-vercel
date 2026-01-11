"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, Loader2 } from "lucide-react"
import { useTranslation } from "@/lib/i18n/use-translation"

const taxonomyLevels = [
  {
    level: 1,
    name: "Remember",
    dimensions: [
      { code: "A", name: "Factual", description: "Recall basic facts and terms" },
      { code: "B", name: "Conceptual", description: "Recall concepts and principles" },
      { code: "C", name: "Procedural", description: "Recall procedures and techniques" },
      { code: "D", name: "Metacognitive", description: "Recall strategies and self-knowledge" },
    ],
  },
  {
    level: 2,
    name: "Understand",
    dimensions: [
      { code: "A", name: "Factual", description: "Explain facts and basic information" },
      { code: "B", name: "Conceptual", description: "Explain concepts and relationships" },
      { code: "C", name: "Procedural", description: "Explain procedures and methods" },
      { code: "D", name: "Metacognitive", description: "Explain learning strategies" },
    ],
  },
  {
    level: 3,
    name: "Apply",
    dimensions: [
      { code: "A", name: "Factual", description: "Use facts in new situations" },
      { code: "B", name: "Conceptual", description: "Apply concepts and principles" },
      { code: "C", name: "Procedural", description: "Execute procedures and techniques" },
      { code: "D", name: "Metacognitive", description: "Use learning strategies" },
    ],
  },
  {
    level: 4,
    name: "Analyze",
    dimensions: [
      { code: "A", name: "Factual", description: "Break down facts into parts" },
      { code: "B", name: "Conceptual", description: "Analyze concepts and relationships" },
      { code: "C", name: "Procedural", description: "Analyze procedures and methods" },
      { code: "D", name: "Metacognitive", description: "Analyze learning strategies" },
    ],
  },
  {
    level: 5,
    name: "Evaluate",
    dimensions: [
      { code: "A", name: "Factual", description: "Judge facts against criteria" },
      { code: "B", name: "Conceptual", description: "Evaluate concepts and theories" },
      { code: "C", name: "Procedural", description: "Assess procedures and techniques" },
      { code: "D", name: "Metacognitive", description: "Evaluate learning strategies" },
    ],
  },
  {
    level: 6,
    name: "Create",
    dimensions: [
      { code: "A", name: "Factual", description: "Generate new factual knowledge" },
      { code: "B", name: "Conceptual", description: "Create new concepts and theories" },
      { code: "C", name: "Procedural", description: "Design new procedures and methods" },
      { code: "D", name: "Metacognitive", description: "Develop new learning strategies" },
    ],
  },
]

interface TaxonomyCellSelectorProps {
  selectedLevel: string
  selectedDimension: string
  onLevelChange: (level: string) => void
  onDimensionChange: (dimension: string) => void
  onAISuggest?: () => void
}

export function TaxonomyCellSelector({
  selectedLevel,
  selectedDimension,
  onLevelChange,
  onDimensionChange,
  onAISuggest,
}: TaxonomyCellSelectorProps) {
  const { t } = useTranslation()
  const [isAIGenerating, setIsAIGenerating] = useState(false)

  const selectedLevelData = taxonomyLevels.find((l) => l.level.toString() === selectedLevel)
  const selectedDimensionData = selectedLevelData?.dimensions.find((d) => d.code === selectedDimension)

  const handleAISuggest = async () => {
    setIsAIGenerating(true)
    // Mock AI delay
    await new Promise((resolve) => setTimeout(resolve, 1500))
    // For MVP, just suggest "3C"
    onLevelChange("3")
    onDimensionChange("C")
    setIsAIGenerating(false)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cognitive-level">{t("instructor.upload.cognitiveLevel")}</Label>
          <Select value={selectedLevel} onValueChange={onLevelChange}>
            <SelectTrigger id="cognitive-level">
              <SelectValue placeholder={t("instructor.upload.selectLevel")} />
            </SelectTrigger>
            <SelectContent>
              {taxonomyLevels.map((level) => (
                <SelectItem key={level.level} value={level.level.toString()}>
                  {level.level} - {level.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="knowledge-dimension">{t("instructor.upload.knowledgeDimension")}</Label>
          <Select value={selectedDimension} onValueChange={onDimensionChange} disabled={!selectedLevel}>
            <SelectTrigger id="knowledge-dimension">
              <SelectValue placeholder={t("instructor.upload.selectDimension")} />
            </SelectTrigger>
            <SelectContent>
              {selectedLevelData?.dimensions.map((dim) => (
                <SelectItem key={dim.code} value={dim.code}>
                  {dim.code} - {dim.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedLevel && selectedDimension && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-900">
                {t("instructor.upload.selectedCell")}: {selectedLevel}
                {selectedDimension} - {selectedLevelData?.name} × {selectedDimensionData?.name}
              </p>
              <p className="text-xs text-blue-700 mt-1">{selectedDimensionData?.description}</p>
            </div>
          </div>
        </Card>
      )}

      {onAISuggest && (
        <Button
          type="button"
          variant="outline"
          className="w-full border-purple-300 text-purple-700 hover:bg-purple-50 bg-transparent"
          onClick={handleAISuggest}
          disabled={isAIGenerating}
        >
          {isAIGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t("instructor.upload.analyzing")}
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              {t("instructor.upload.aiSuggest")}
            </>
          )}
        </Button>
      )}
    </div>
  )
}
