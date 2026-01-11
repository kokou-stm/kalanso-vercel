"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useTranslation } from "@/lib/i18n/use-translation"
import {
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  BookOpen,
  Video,
  FileText,
  GraduationCap,
  Youtube,
  Globe,
  ExternalLink,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Clock,
  Target,
} from "lucide-react"
import { useState } from "react"
import type { InternalResource, ExternalResource, GeneratedExercise } from "@/types/taxonomy"

interface CellDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cellDetail: any | null
  onStartGLO?: (gloId: string) => void
  onStartExercise?: (exerciseId: string) => void
  onGenerateExercises?: () => void
}

function ResourceCard({
  resource,
  type,
  onAction,
}: {
  resource: InternalResource | ExternalResource
  type: "internal" | "external"
  onAction: () => void
}) {
  const { t } = useTranslation()

  const getIcon = () => {
    if (type === "internal") {
      const internalResource = resource as InternalResource
      switch (internalResource.type) {
        case "video":
          return <Video className="h-5 w-5 text-blue-600" />
        case "document":
          return <FileText className="h-5 w-5 text-blue-600" />
        case "module":
          return <GraduationCap className="h-5 w-5 text-blue-600" />
        default:
          return <BookOpen className="h-5 w-5 text-blue-600" />
      }
    } else {
      const externalResource = resource as ExternalResource
      switch (externalResource.type) {
        case "youtube":
          return <Youtube className="h-5 w-5 text-red-600" />
        case "article":
          return <FileText className="h-5 w-5 text-gray-600" />
        case "course":
          return <GraduationCap className="h-5 w-5 text-purple-600" />
        default:
          return <Globe className="h-5 w-5 text-gray-600" />
      }
    }
  }

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-orange-100 text-orange-800"
      case "hard":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div
      className={`border rounded-lg p-4 mb-3 transition-all hover:shadow-md hover:-translate-y-0.5 ${
        type === "internal" ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"
      }`}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-1">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-lg text-gray-900 mb-1">{resource.title}</h4>
          <p className="text-sm text-gray-600 mb-2">{resource.description}</p>
          <p className="text-xs text-gray-500 italic mb-3">{resource.source}</p>

          <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
            {resource.estimatedTime && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {resource.estimatedTime} {t("taxonomy.modal.minutes")}
              </span>
            )}
            {resource.difficulty && (
              <Badge variant="secondary" className={getDifficultyColor(resource.difficulty)}>
                {resource.difficulty}
              </Badge>
            )}
            {type === "internal" && "relevanceScore" in resource && (
              <span className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                {t("taxonomy.modal.relevance")}: {resource.relevanceScore}%
              </span>
            )}
          </div>

          <Button
            size="sm"
            onClick={onAction}
            className={type === "internal" ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-600 hover:bg-gray-700"}
          >
            {type === "internal" ? (
              t("taxonomy.modal.studyNow")
            ) : (
              <>
                {t("taxonomy.modal.viewOn")} {(resource as ExternalResource).platform}{" "}
                <ExternalLink className="h-3 w-3 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

function ExerciseCard({
  exercise,
  number,
  onStart,
}: {
  exercise: GeneratedExercise
  number: number
  onStart: () => void
}) {
  const { t } = useTranslation()
  const [showHints, setShowHints] = useState(false)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-orange-100 text-orange-800"
      case "hard":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "reflection":
        return "💭"
      case "scenario":
        return "🎬"
      case "practice":
        return "🔧"
      case "problem_solving":
        return "🧩"
      default:
        return "✏️"
    }
  }

  return (
    <div className="border border-purple-200 rounded-lg p-6 mb-4 bg-purple-50">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getTypeIcon(exercise.type)}</span>
          <h4 className="font-semibold text-lg text-gray-900">
            {t("taxonomy.modal.exercise")} {number}: {exercise.title || t(`taxonomy.exerciseType.${exercise.type}`)}
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className={getDifficultyColor(exercise.difficulty)}>
            {exercise.difficulty}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {exercise.estimatedTime} {t("taxonomy.modal.minutes")}
          </Badge>
        </div>
      </div>

      <p className="text-gray-700 leading-relaxed mb-4 whitespace-pre-wrap">{exercise.prompt}</p>

      <div className="mb-4">
        <button
          onClick={() => setShowHints(!showHints)}
          className="flex items-center gap-2 text-sm text-purple-700 hover:text-purple-900 font-medium"
        >
          {showHints ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {showHints ? t("taxonomy.modal.hideHints") : `${t("taxonomy.modal.showHints")} (${exercise.hints.length})`}
        </button>

        {showHints && (
          <div className="mt-3 pl-4 border-l-4 border-purple-300 bg-white p-3 rounded">
            <ol className="list-decimal list-inside space-y-2">
              {exercise.hints.map((hint, idx) => (
                <li key={idx} className="text-sm text-gray-700">
                  {hint}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-600 italic mb-4">
        <Target className="h-4 w-4" />
        <span>
          {t("taxonomy.modal.learningObjective")}: {exercise.learningObjective}
        </span>
      </div>

      <Button onClick={onStart} className="bg-purple-600 hover:bg-purple-700">
        <Lightbulb className="h-4 w-4 mr-2" />
        {t("taxonomy.modal.startExercise")}
      </Button>
    </div>
  )
}

export function CellDetailModal({
  open,
  onOpenChange,
  cellDetail,
  onStartGLO,
  onStartExercise,
  onGenerateExercises,
}: CellDetailModalProps) {
  const { t } = useTranslation()

  if (!cellDetail) {
    return null
  }

  const {
    code: cellCode,
    cognitiveName,
    knowledgeName,
    description,
    typicalVerbs = [],
    example = "",
    masteryPercentage = 0,
    glosCompleted = 0,
    glosTotal = 0,
    lastUpdated,
    recommendations,
    exercises,
  } = cellDetail

  const getMasteryLevel = () => {
    if (masteryPercentage >= 85)
      return {
        label: t("taxonomy.mastery.mastered"),
        icon: CheckCircle2,
        color: "text-green-600",
        bgColor: "bg-green-50",
      }
    if (masteryPercentage >= 70)
      return {
        label: t("taxonomy.mastery.approaching"),
        icon: TrendingUp,
        color: "text-orange-600",
        bgColor: "bg-orange-50",
      }
    return {
      label: t("taxonomy.mastery.needsWork"),
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    }
  }

  const masteryLevel = getMasteryLevel()
  const MasteryIcon = masteryLevel.icon
  const gapToMastery = Math.max(0, 85 - masteryPercentage)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className={`${masteryLevel.bgColor} -m-6 mb-0 p-6 rounded-t-lg`}>
          <DialogTitle className="flex items-center gap-3">
            <Badge variant="outline" className="text-lg font-bold px-3 py-1 bg-white">
              {cellCode}
            </Badge>
            <span className="text-xl">
              {cognitiveName} × {knowledgeName}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MasteryIcon className={`h-5 w-5 ${masteryLevel.color}`} />
                <span className={`font-semibold ${masteryLevel.color}`}>{masteryLevel.label}</span>
              </div>
              <span className="text-3xl font-bold text-gray-900">{Math.round(masteryPercentage)}%</span>
            </div>

            <Progress value={masteryPercentage} className="h-4" />

            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                {glosCompleted} / {glosTotal} {t("taxonomy.modal.glosCompleted")}
              </span>
              {masteryPercentage < 85 && (
                <span className={masteryLevel.color}>
                  {t("taxonomy.modal.needMastery")} (+{gapToMastery}% {t("taxonomy.modal.toGo")})
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900">{t("taxonomy.modal.whatIsThis")}</h3>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700 leading-relaxed">{description}</p>
            </div>
          </div>

          {typicalVerbs.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900">{t("taxonomy.modal.typicalVerbs")}</h3>
              <div className="flex flex-wrap gap-2">
                {typicalVerbs.map((verb, index) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1">
                    {verb}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {example && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900">{t("taxonomy.modal.exampleGLO")}</h3>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-blue-900 leading-relaxed italic">{example}</p>
              </div>
            </div>
          )}

          {lastUpdated && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900">{t("taxonomy.modal.recentActivity")}</h3>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-900">
                  {t("taxonomy.modal.lastPracticed")}: {lastUpdated.toLocaleDateString()}
                </p>
              </div>
            </div>
          )}

          {recommendations && (recommendations.internal.length > 0 || recommendations.external.length > 0) && (
            <div className="pt-6 border-t space-y-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                {t("taxonomy.modal.learningMaterials")}
              </h3>

              {recommendations.internal.length > 0 && (
                <div>
                  <p className="text-xs uppercase font-semibold text-gray-500 mb-3 tracking-wide">
                    {t("taxonomy.modal.internalContent")}
                  </p>
                  {recommendations.internal.map((resource) => (
                    <ResourceCard
                      key={resource.id}
                      resource={resource}
                      type="internal"
                      onAction={() => onStartGLO?.(resource.id)}
                    />
                  ))}
                </div>
              )}

              {recommendations.external.length > 0 && (
                <div>
                  <p className="text-xs uppercase font-semibold text-gray-500 mb-3 tracking-wide">
                    {t("taxonomy.modal.externalResources")}
                  </p>
                  {recommendations.external.map((resource) => (
                    <ResourceCard
                      key={resource.id}
                      resource={resource}
                      type="external"
                      onAction={() => window.open(resource.url, "_blank")}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {exercises && exercises.length > 0 && (
            <div className="pt-6 border-t space-y-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-purple-600" />
                {t("taxonomy.modal.practiceExercises")}
              </h3>

              {exercises.map((exercise, idx) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  number={idx + 1}
                  onStart={() => onStartExercise?.(exercise.id)}
                />
              ))}

              {onGenerateExercises && (
                <Button
                  onClick={onGenerateExercises}
                  variant="outline"
                  className="w-full border-purple-300 text-purple-700 hover:bg-purple-50 bg-transparent"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {t("taxonomy.modal.generateExercises")}
                </Button>
              )}
            </div>
          )}

          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t("taxonomy.modal.close")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
