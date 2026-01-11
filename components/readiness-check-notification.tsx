"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert } from "@/components/ui/alert"
import { Clock, FileText, AlertCircle, CheckCircle2, Sparkles } from "lucide-react"
import { useTranslation } from "@/lib/i18n/use-translation"

interface ReadinessCheckNotificationProps {
  assessment: {
    id: string
    title: string
    sessionTitle: string
    dueDate: string
    timeRemaining: string
    format: string
    questionCount: number
    timeLimit: number
    type: "graded" | "practice"
    masteryThreshold: number
    topics: string[]
  }
  practiceHistory: {
    score: number
    dateTaken: string
    timeAgo: string
  }[]
  aiPrediction: {
    readinessScore: number
    readinessStatus: "ready" | "almost" | "not_ready"
  }
  onStartReadinessCheck: () => void
  onTakeRealAssessment: () => void
  onPracticeLater: () => void
}

export function ReadinessCheckNotification({
  assessment,
  practiceHistory,
  aiPrediction,
  onStartReadinessCheck,
  onTakeRealAssessment,
  onPracticeLater,
}: ReadinessCheckNotificationProps) {
  const { t, locale } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)

  const getReadinessColor = () => {
    if (aiPrediction.readinessScore >= assessment.masteryThreshold) return "text-green-600"
    if (aiPrediction.readinessScore >= assessment.masteryThreshold - 10) return "text-amber-600"
    return "text-red-600"
  }

  const getReadinessMessage = () => {
    if (aiPrediction.readinessScore >= assessment.masteryThreshold) {
      return locale === "fr" ? "Vous êtes prêt !" : locale === "de" ? "Sie sind bereit!" : "You're ready!"
    }
    if (aiPrediction.readinessScore >= assessment.masteryThreshold - 10) {
      return locale === "fr"
        ? "Presque prêt - recommandé de pratiquer"
        : locale === "de"
          ? "Fast bereit - Übung empfohlen"
          : "Almost ready - practice recommended"
    }
    return locale === "fr"
      ? "Plus de pratique nécessaire"
      : locale === "de"
        ? "Mehr Übung erforderlich"
        : "More practice needed"
  }

  const getTrendIcon = () => {
    if (practiceHistory.length < 2) return null
    const recent = practiceHistory[practiceHistory.length - 1].score
    const previous = practiceHistory[practiceHistory.length - 2].score
    return recent > previous ? "↗️" : recent < previous ? "↘️" : "→"
  }

  return (
    <Card className="p-6 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-semibold text-purple-900">
              {locale === "fr"
                ? "Évaluation à venir"
                : locale === "de"
                  ? "Bevorstehende Bewertung"
                  : "Upcoming Assessment"}
            </span>
          </div>
          <Badge variant="outline" className="bg-white">
            {assessment.timeRemaining}
          </Badge>
        </div>

        {/* Assessment Info */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">{assessment.title}</h3>
          <p className="text-sm text-gray-600 mb-2">{assessment.sessionTitle}</p>
          <div className="flex flex-wrap gap-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {assessment.questionCount} {locale === "fr" ? "questions" : locale === "de" ? "Fragen" : "questions"}
            </span>
            <span>•</span>
            <span>
              {assessment.timeLimit} {locale === "fr" ? "minutes" : locale === "de" ? "Minuten" : "minutes"}
            </span>
            <span>•</span>
            <span className="font-semibold">
              {locale === "fr" ? "Seuil" : locale === "de" ? "Schwelle" : "Threshold"}: {assessment.masteryThreshold}%
            </span>
          </div>
        </div>

        {/* Topics */}
        <div>
          <p className="text-xs font-semibold text-gray-700 mb-2">
            {locale === "fr" ? "Couvre :" : locale === "de" ? "Abdeckt:" : "Covers:"}
          </p>
          <div className="flex flex-wrap gap-2">
            {assessment.topics.map((topic, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {topic}
              </Badge>
            ))}
          </div>
        </div>

        <div className="border-t pt-4">
          {/* Readiness Check CTA */}
          <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-2">
              <Sparkles className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">
                  {locale === "fr"
                    ? "Vérifiez votre préparation"
                    : locale === "de"
                      ? "Überprüfen Sie Ihre Bereitschaft"
                      : "Check Your Readiness"}
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  {locale === "fr"
                    ? "Faites une version d'entraînement pour voir si vous êtes prêt pour la vraie évaluation."
                    : locale === "de"
                      ? "Machen Sie eine Übungsversion, um zu sehen, ob Sie für die echte Bewertung bereit sind."
                      : "Take a practice version to see if you're ready for the real thing."}
                </p>
                <ul className="text-xs text-gray-600 space-y-1 mb-3">
                  <li>
                    •{" "}
                    {locale === "fr"
                      ? "Même format et difficulté"
                      : locale === "de"
                        ? "Gleiches Format und Schwierigkeit"
                        : "Same format and difficulty"}
                  </li>
                  <li>
                    •{" "}
                    {locale === "fr"
                      ? "Feedback immédiat"
                      : locale === "de"
                        ? "Sofortiges Feedback"
                        : "Immediate feedback"}
                  </li>
                  <li>
                    •{" "}
                    {locale === "fr"
                      ? "Aucun impact sur la note"
                      : locale === "de"
                        ? "Keine Auswirkung auf Note"
                        : "No grade impact"}
                  </li>
                </ul>

                {/* Practice History */}
                {practiceHistory.length > 0 && (
                  <div className="bg-white rounded p-3 space-y-2">
                    <p className="text-xs font-semibold text-gray-700">
                      {locale === "fr"
                        ? "Votre pratique récente :"
                        : locale === "de"
                          ? "Ihre letzte Übung:"
                          : "Your recent practice:"}
                    </p>
                    {practiceHistory.map((practice, idx) => (
                      <div key={idx} className="flex justify-between text-xs">
                        <span className="text-gray-600">
                          {locale === "fr" ? "Pratique" : locale === "de" ? "Übung" : "Practice"} #{idx + 1}:{" "}
                          <span className="font-semibold">{practice.score}%</span>
                        </span>
                        <span className="text-gray-500">({practice.timeAgo})</span>
                      </div>
                    ))}
                    {getTrendIcon() && (
                      <p className="text-xs text-green-600 font-semibold">
                        {locale === "fr" ? "Tendance" : locale === "de" ? "Trend" : "Trend"}: {getTrendIcon()}{" "}
                        {locale === "fr"
                          ? "Amélioration constante !"
                          : locale === "de"
                            ? "Stetig verbessert!"
                            : "Improving steadily!"}
                      </p>
                    )}
                  </div>
                )}

                {/* AI Prediction */}
                <Alert className="mt-3 border-purple-200 bg-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">
                        {locale === "fr" ? "Prédiction IA" : locale === "de" ? "KI-Vorhersage" : "AI Prediction"}:{" "}
                        <span className={getReadinessColor()}>
                          {aiPrediction.readinessScore}%{" "}
                          {locale === "fr" ? "prêt" : locale === "de" ? "bereit" : "ready"}
                        </span>
                      </p>
                      <p className="text-xs text-gray-600">{getReadinessMessage()}</p>
                    </div>
                    {aiPrediction.readinessScore >= assessment.masteryThreshold ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-amber-600" />
                    )}
                  </div>
                </Alert>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              <Button onClick={onStartReadinessCheck} className="w-full bg-purple-600 hover:bg-purple-700">
                <Sparkles className="h-4 w-4 mr-2" />
                {locale === "fr"
                  ? "Générer un contrôle de préparation"
                  : locale === "de"
                    ? "Bereitschaftscheck erstellen"
                    : "Generate Readiness Check"}
              </Button>
              <div className="flex gap-2">
                <Button onClick={onPracticeLater} variant="outline" className="flex-1 bg-transparent" size="sm">
                  {locale === "fr"
                    ? "Je pratiquerai plus tard"
                    : locale === "de"
                      ? "Ich werde später üben"
                      : "I'll Practice Later"}
                </Button>
                <Button onClick={onTakeRealAssessment} variant="outline" className="flex-1 bg-transparent" size="sm">
                  {locale === "fr" ? "Faire l'évaluation" : locale === "de" ? "Bewertung machen" : "Take Assessment"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
