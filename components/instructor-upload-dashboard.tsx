"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { BookOpen, Save, X } from "lucide-react"
import { useTranslation } from "@/lib/i18n/use-translation"
import { FileUploadZone } from "./file-upload-zone"
import { TaxonomyCellSelector } from "./taxonomy-cell-selector"
import { LearningObjectivesEditor } from "./learning-objectives-editor"
import type { NewGLO, UploadedFile, InstructorUploadProps } from "@/types/instructor"

export function InstructorUploadDashboard({ onSave, onCancel }: InstructorUploadProps) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState<Partial<NewGLO>>({
    title: "",
    taxonomyCell: "",
    learningObjectives: [""],
    contentType: "video",
    contentFiles: [],
    description: "",
    estimatedTime: 30,
    difficulty: "medium",
    prerequisites: [],
    practiceExercises: [],
    assessmentQuestions: [],
  })

  const [selectedLevel, setSelectedLevel] = useState("")
  const [selectedDimension, setSelectedDimension] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleFilesAdd = (files: File[]) => {
    const newFiles: UploadedFile[] = files.map((file) => ({
      id: `file_${Date.now()}_${Math.random()}`,
      name: file.name,
      type: file.type,
      size: file.size,
      uploadProgress: 0,
    }))

    // Simulate upload progress
    newFiles.forEach((file) => {
      let progress = 0
      const interval = setInterval(() => {
        progress += 10
        if (progress >= 100) {
          clearInterval(interval)
          file.uploadProgress = 100
        } else {
          file.uploadProgress = progress
        }
        setFormData((prev) => ({
          ...prev,
          contentFiles: [...(prev.contentFiles || [])],
        }))
      }, 200)
    })

    setFormData((prev) => ({
      ...prev,
      contentFiles: [...(prev.contentFiles || []), ...newFiles],
    }))
  }

  const handleFileRemove = (fileId: string) => {
    setFormData((prev) => ({
      ...prev,
      contentFiles: (prev.contentFiles || []).filter((f) => f.id !== fileId),
    }))
  }

  const handleLevelChange = (level: string) => {
    setSelectedLevel(level)
    setFormData((prev) => ({
      ...prev,
      taxonomyCell: level + (selectedDimension || ""),
    }))
  }

  const handleDimensionChange = (dimension: string) => {
    setSelectedDimension(dimension)
    setFormData((prev) => ({
      ...prev,
      taxonomyCell: (selectedLevel || "") + dimension,
    }))
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title?.trim()) {
      newErrors.title = t("instructor.upload.errorTitleRequired")
    }

    if (!formData.taxonomyCell || formData.taxonomyCell.length !== 2) {
      newErrors.taxonomyCell = t("instructor.upload.errorCellRequired")
    }

    if (!formData.learningObjectives || formData.learningObjectives.filter((o) => o.trim()).length === 0) {
      newErrors.learningObjectives = t("instructor.upload.errorObjectivesRequired")
    }

    if (!formData.contentFiles || formData.contentFiles.length === 0) {
      newErrors.contentFiles = t("instructor.upload.errorContentRequired")
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePublish = () => {
    if (validate()) {
      onSave(formData as NewGLO)
    }
  }

  const handleSaveDraft = () => {
    // Save as draft doesn't require full validation
    if (!formData.title?.trim()) {
      setErrors({ title: t("instructor.upload.errorTitleRequired") })
      return
    }
    console.log("Saving as draft:", formData)
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          {t("instructor.upload.title")}
        </h1>
        <p className="text-sm text-gray-600 mt-1">{t("instructor.upload.subtitle")}</p>
      </div>

      <div className="space-y-6">
        {/* Step 1: Basic Information */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("instructor.upload.step1")}</h2>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">
                {t("instructor.upload.gloTitle")} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={t("instructor.upload.titlePlaceholder")}
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
            </div>

            <div>
              <Label htmlFor="description">{t("instructor.upload.description")}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t("instructor.upload.descriptionPlaceholder")}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="time">{t("instructor.upload.estimatedTime")}</Label>
                <Input
                  id="time"
                  type="number"
                  value={formData.estimatedTime}
                  onChange={(e) => setFormData({ ...formData, estimatedTime: Number.parseInt(e.target.value) })}
                  placeholder="30"
                />
              </div>

              <div>
                <Label>{t("instructor.upload.difficulty")}</Label>
                <RadioGroup
                  value={formData.difficulty}
                  onValueChange={(value) => setFormData({ ...formData, difficulty: value as any })}
                  className="flex gap-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="easy" id="easy" />
                    <Label htmlFor="easy" className="font-normal cursor-pointer">
                      {t("difficulty.easy")}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="medium" />
                    <Label htmlFor="medium" className="font-normal cursor-pointer">
                      {t("difficulty.medium")}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hard" id="hard" />
                    <Label htmlFor="hard" className="font-normal cursor-pointer">
                      {t("difficulty.hard")}
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        </Card>

        {/* Step 2: Taxonomy Mapping */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("instructor.upload.step2")}</h2>
          <TaxonomyCellSelector
            selectedLevel={selectedLevel}
            selectedDimension={selectedDimension}
            onLevelChange={handleLevelChange}
            onDimensionChange={handleDimensionChange}
            onAISuggest={() => {}}
          />
          {errors.taxonomyCell && <p className="text-xs text-red-500 mt-2">{errors.taxonomyCell}</p>}
        </Card>

        {/* Step 3: Learning Objectives */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("instructor.upload.step3")}</h2>
          <LearningObjectivesEditor
            objectives={formData.learningObjectives || [""]}
            onObjectivesChange={(objectives) => setFormData({ ...formData, learningObjectives: objectives })}
          />
          {errors.learningObjectives && <p className="text-xs text-red-500 mt-2">{errors.learningObjectives}</p>}
        </Card>

        {/* Step 4: Content Upload */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("instructor.upload.step4")}</h2>

          <div className="space-y-4">
            <div>
              <Label>{t("instructor.upload.contentType")}</Label>
              <RadioGroup
                value={formData.contentType}
                onValueChange={(value) => setFormData({ ...formData, contentType: value as any })}
                className="flex gap-4 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="video" id="video" />
                  <Label htmlFor="video" className="font-normal cursor-pointer">
                    {t("instructor.upload.video")}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="document" id="document" />
                  <Label htmlFor="document" className="font-normal cursor-pointer">
                    {t("instructor.upload.document")}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mixed" id="mixed" />
                  <Label htmlFor="mixed" className="font-normal cursor-pointer">
                    {t("instructor.upload.mixed")}
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <FileUploadZone
              files={formData.contentFiles || []}
              onFilesAdd={handleFilesAdd}
              onFileRemove={handleFileRemove}
            />
            {errors.contentFiles && <p className="text-xs text-red-500 mt-2">{errors.contentFiles}</p>}
          </div>
        </Card>

        {/* Step 5: Practice Exercises (Optional) */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("instructor.upload.step5")}</h2>
          <p className="text-sm text-gray-600 mb-4">{t("instructor.upload.step5Hint")}</p>
          <Button variant="outline" disabled>
            <span className="text-gray-400">{t("instructor.upload.comingSoon")}</span>
          </Button>
        </Card>

        {/* Step 6: Assessment (Optional) */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("instructor.upload.step6")}</h2>
          <p className="text-sm text-gray-600 mb-4">{t("instructor.upload.step6Hint")}</p>
          <Button variant="outline" disabled>
            <span className="text-gray-400">{t("instructor.upload.comingSoon")}</span>
          </Button>
        </Card>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t">
        <Button variant="ghost" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          {t("actions.cancel")}
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleSaveDraft}>
            <Save className="h-4 w-4 mr-2" />
            {t("instructor.upload.saveDraft")}
          </Button>
          <Button onClick={handlePublish} className="bg-blue-600 hover:bg-blue-700">
            {t("instructor.upload.publish")}
          </Button>
        </div>
      </div>
    </div>
  )
}
