"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert } from "@/components/ui/alert"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CheckCircle2, XCircle, AlertTriangle, TrendingUp, BookOpen, Video, Target, Sparkles } from "lucide-react"
import { useTranslation } from "@/lib/i18n/use-translation"
import Confetti from "react-confetti"

interface TopicPerformance {
  topic: string
  score: number
  questionsCorrect: number
  questionsTotal: number
  status: "excellent" | "good" | "review" | "needs_work"
  recommendations?: {
    type: "review" | "practice" | "watch"
    title: string
    duration?: string
    count?: number
  }[]
}

interface ReadinessCheckResultsProps {
  score: number
  correctCount: number
  totalQuestions: number
  timeTaken: number
  masteryThreshold: number
  topicPerformance: TopicPerformance[]
  prediction: {
    likelyScore: number
    range: [number, number]
    confidenceLevel: "high" | "medium" | "low"
    riskLevel: "low" | "medium" | "high"
  }
  improvementPotential?: {
    targetTopic: string
    predictedScore: number
    predictedRange: [number, number]
  }
  practiceHistory: { score: number }[]
  onTakeRealAssessment: () => void
  onStartTargetedPractice: () => void
  onTakeAnotherPractice: () => void
}

export function ReadinessCheckResults({
  score,
  correctCount,
  totalQuestions,
  timeTaken,
  masteryThreshold,
  topicPerformance,
  prediction,
  improvementPotential,
  practiceHistory,
  onTakeRealAssessment,
  onStartTargetedPractice,
  onTakeAnotherPractice,
}: ReadinessCheckResultsProps) {
  const { locale } = useTranslation()
  const [showConfetti, setShowConfetti] = useState(score >= masteryThreshold)

  const isReady = score >= masteryThreshold
  const improvement = practiceHistory.length > 0 ? score - practiceHistory[0].score : 0

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "text-green-600 bg-green-50"
      case "good":
        return "text-blue-600 bg-blue-50"
      case "review":
        return "text-amber-600 bg-amber-50"
      case "needs_work":
        return "text-red-600 bg-red-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const getStatusLabel = (status: string) => {
    if (locale === "fr") {
      return {
        excellent: "Excellent",
        good: "Bon",
        review: "Révision recommandée",
        needs_work: "Besoin de travail",
      }[status]
    }
    if (locale === "de") {
      return {
        excellent: "Ausgezeichnet",
        good: "Gut",
        review: "Überprüfung empfohlen",
        needs_work: "Braucht Arbeit",
      }[status]
    }
    return {
      excellent: "Excellent",
      good: "Good",
      review: "Review Recommended",
      needs_work: "Needs Work",
    }[status]
  }

  return (
    <div className="space-y-6">
      {showConfetti && (
        <Confetti recycle={false} numberOfPieces={500} onConfettiComplete={() => setShowConfetti(false)} />
      )}

      {/* Overall Score Card */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-purple-600 text-white">
            <span className="text-3xl font-bold">{score}%</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {locale === "fr"
                ? "Contrôle de préparation terminé !"
                : locale === "de"
                  ? "Bereitschaftscheck abgeschlossen!"
                  : "Readiness Check Complete!"}
            </h2>
            <p className="text-gray-600 mt-1">
              {correctCount}/{totalQuestions} {locale === "fr" ? "correct" : locale === "de" ? "richtig" : "correct"} •{" "}
              {Math.floor(timeTaken / 60)} {locale === "fr" ? "minutes" : locale === "de" ? "Minuten" : "minutes"}
            </p>
          </div>

          {/* Readiness Status */}
          <Alert className={isReady ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}>
            <div className="flex items-center justify-center gap-2">
              {isReady ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              )}
              <div>
                <p className="font-bold text-lg">
                  {isReady
                    ? locale === "fr"
                      ? "VOUS ÊTES PRÊT !"
                      : locale === "de"
                        ? "SIE SIND BEREIT!"
                        : "YOU'RE READY!"
                    : locale === "fr"
                      ? "BESOIN DE PLUS DE PRATIQUE"
                      : locale === "de"
                        ? "MEHR ÜBUNG ERFORDERLICH"
                        : "NEEDS MORE PRACTICE"}
                </p>
                <p className="text-sm">
                  {isReady
                    ? locale === "fr"
                      ? `Vous avez dépassé le seuil de maîtrise de ${masteryThreshold}% !`
                      : locale === "de"
                        ? `Sie haben die ${masteryThreshold}% Meisterschaftsschwelle überschritten!`
                        : `You exceeded the ${masteryThreshold}% mastery threshold!`
                    : locale === "fr"
                      ? `Vous êtes en dessous du seuil de ${masteryThreshold}%, mais vous progressez !`
                      : locale === "de"
                        ? `Sie liegen unter der ${masteryThreshold}% Schwelle, aber Sie machen Fortschritte!`
                        : `You're below the ${masteryThreshold}% threshold, but you're making progress!`}
                </p>
              </div>
            </div>
          </Alert>
        </div>
      </Card>

      {/* Performance by Topic */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          {locale === "fr" ? "Performance par sujet" : locale === "de" ? "Leistung nach Thema" : "Performance by Topic"}
        </h3>
        <Accordion type="single" collapsible className="space-y-2">
          {topicPerformance.map((topic, idx) => (
            <AccordionItem
              key={idx}
              value={`topic-${idx}`}
              className={`border rounded-lg ${getStatusColor(topic.status)}`}
            >
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-3">
                    {topic.status === "excellent" && <CheckCircle2 className="h-5 w-5" />}
                    {topic.status === "good" && <CheckCircle2 className="h-5 w-5" />}
                    {topic.status === "review" && <AlertTriangle className="h-5 w-5" />}
                    {topic.status === "needs_work" && <XCircle className="h-5 w-5" />}
                    <div className="text-left">
                      <p className="font-semibold">{topic.topic}</p>
                      <p className="text-sm">
                        {topic.score}% ({topic.questionsCorrect}/{topic.questionsTotal})
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    {getStatusLabel(topic.status)}
                  </Badge>
                </div>
              </AccordionTrigger>
              {topic.recommendations && topic.recommendations.length > 0 && (
                <AccordionContent className="px-4 pb-4">
                  <div className="bg-white rounded-lg p-3 space-y-2">
                    {topic.recommendations.map((rec, recIdx) => (
                      <div key={recIdx} className="flex items-start gap-2 text-sm">
                        {rec.type === "review" && <BookOpen className="h-4 w-4 text-blue-600 mt-0.5" />}
                        {rec.type === "watch" && <Video className="h-4 w-4 text-purple-600 mt-0.5" />}
                        {rec.type === "practice" && <Target className="h-4 w-4 text-green-600 mt-0.5" />}
                        <div>
                          <p className="font-medium">{rec.title}</p>
                          {rec.duration && <p className="text-xs text-gray-500">({rec.duration})</p>}
                          {rec.count && (
                            <p className="text-xs text-gray-500">
                              ({rec.count} {locale === "fr" ? "exercices" : locale === "de" ? "Übungen" : "exercises"})
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              )}
            </AccordionItem>
          ))}
        </Accordion>
      </Card>

      {/* Confidence Prediction */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-white">
        <div className="flex items-start gap-3">
          <Sparkles className="h-6 w-6 text-blue-600 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              {locale === "fr"
                ? "Prédiction de confiance"
                : locale === "de"
                  ? "Konfidenzvorhersage"
                  : "Confidence Prediction"}
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  {locale === "fr"
                    ? "Basé sur cette pratique :"
                    : locale === "de"
                      ? "Basierend auf dieser Übung:"
                      : "Based on this practice:"}
                </p>
                <div className="bg-white rounded-lg p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {locale === "fr"
                        ? "Score réel prédit"
                        : locale === "de"
                          ? "Vorhergesagtes echtes Ergebnis"
                          : "Predicted real score"}
                      :
                    </span>
                    <span className="font-bold">
                      {prediction.range[0]}-{prediction.range[1]}% (likely {prediction.likelyScore}%)
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {locale === "fr"
                        ? "Niveau de confiance"
                        : locale === "de"
                          ? "Konfidenzniveau"
                          : "Confidence level"}
                      :
                    </span>
                    <Badge
                      className={
                        prediction.confidenceLevel === "high"
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }
                    >
                      {prediction.confidenceLevel === "high"
                        ? locale === "fr"
                          ? "Élevé"
                          : locale === "de"
                            ? "Hoch"
                            : "High"
                        : locale === "fr"
                          ? "Moyen"
                          : locale === "de"
                            ? "Mittel"
                            : "Medium"}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {locale === "fr" ? "Niveau de risque" : locale === "de" ? "Risikoniveau" : "Risk level"}:
                    </span>
                    <Badge
                      className={
                        prediction.riskLevel === "low" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                      }
                    >
                      {prediction.riskLevel === "low"
                        ? locale === "fr"
                          ? "Faible"
                          : locale === "de"
                            ? "Niedrig"
                            : "Low"
                        : locale === "fr"
                          ? "Moyen"
                          : locale === "de"
                            ? "Mittel"
                            : "Medium"}
                    </Badge>
                  </div>
                </div>
              </div>

              {improvementPotential && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    {locale === "fr"
                      ? `Si vous renforcez ${improvementPotential.targetTopic} :`
                      : locale === "de"
                        ? `Wenn Sie ${improvementPotential.targetTopic} stärken:`
                        : `If you strengthen ${improvementPotential.targetTopic}:`}
                  </p>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-sm">
                      {locale === "fr"
                        ? "Score prédit"
                        : locale === "de"
                          ? "Vorhergesagtes Ergebnis"
                          : "Predicted score"}
                      :{" "}
                      <span className="font-bold text-green-600">
                        {improvementPotential.predictedRange[0]}-{improvementPotential.predictedRange[1]}% (likely{" "}
                        {improvementPotential.predictedScore}%)
                      </span>
                    </p>
                    <p className="text-sm text-green-600 font-semibold mt-1">
                      {locale === "fr"
                        ? "Encore plus confiant ! 🎯"
                        : locale === "de"
                          ? "Noch zuversichtlicher! 🎯"
                          : "Even more confident! 🎯"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Next Steps */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          {locale === "fr" ? "Prochaines étapes" : locale === "de" ? "Nächste Schritte" : "Next Steps"}
        </h3>
        <div className="space-y-3">
          {isReady ? (
            <>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="font-semibold text-green-900 mb-2">
                  {locale === "fr"
                    ? "Option 1 : Faire l'évaluation réelle (Recommandé)"
                    : locale === "de"
                      ? "Option 1: Echte Bewertung machen (Empfohlen)"
                      : "Option 1: Take Real Assessment (Recommended)"}
                </p>
                <p className="text-sm text-green-700 mb-3">
                  {locale === "fr"
                    ? "Vous êtes prêt ! Allez-y en toute confiance."
                    : locale === "de"
                      ? "Sie sind bereit! Gehen Sie selbstbewusst vor."
                      : "You're ready! Go ahead with confidence."}
                </p>
                <Button onClick={onTakeRealAssessment} className="w-full bg-green-600 hover:bg-green-700">
                  {locale === "fr"
                    ? "Aller à l'évaluation réelle →"
                    : locale === "de"
                      ? "Zur echten Bewertung gehen →"
                      : "Go to Real Assessment →"}
                </Button>
              </div>
              <div className="border rounded-lg p-4">
                <p className="font-semibold text-gray-900 mb-2">
                  {locale === "fr"
                    ? "Option 2 : Faire une autre pratique"
                    : locale === "de"
                      ? "Option 2: Weitere Übung machen"
                      : "Option 2: Take Another Practice"}
                </p>
                <p className="text-sm text-gray-600 mb-3">
                  {locale === "fr"
                    ? "Pratiquez encore une fois pour renforcer la confiance."
                    : locale === "de"
                      ? "Üben Sie noch einmal, um das Vertrauen zu stärken."
                      : "Practice one more time to build confidence."}
                </p>
                <Button onClick={onTakeAnotherPractice} variant="outline" className="w-full bg-transparent">
                  {locale === "fr"
                    ? "Générer un nouveau contrôle"
                    : locale === "de"
                      ? "Neuen Check erstellen"
                      : "Generate New Readiness Check"}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="font-semibold text-amber-900 mb-2">
                  {locale === "fr"
                    ? "Option 1 : Renforcer d'abord les zones faibles (Recommandé)"
                    : locale === "de"
                      ? "Option 1: Schwache Bereiche zuerst stärken (Empfohlen)"
                      : "Option 1: Strengthen Weak Areas First (Recommended)"}
                </p>
                <p className="text-sm text-amber-700 mb-3">
                  {locale === "fr"
                    ? `Travaillez sur ${improvementPotential?.targetTopic || "vos zones faibles"} pour de meilleurs résultats.`
                    : locale === "de"
                      ? `Arbeiten Sie an ${improvementPotential?.targetTopic || "Ihren schwachen Bereichen"} für bessere Ergebnisse.`
                      : `Work on ${improvementPotential?.targetTopic || "your weak areas"} for even better results.`}
                </p>
                <Button onClick={onStartTargetedPractice} className="w-full bg-amber-600 hover:bg-amber-700">
                  {locale === "fr"
                    ? "Démarrer la pratique ciblée"
                    : locale === "de"
                      ? "Gezielte Übung starten"
                      : "Start Targeted Practice"}
                </Button>
              </div>
              <div className="border rounded-lg p-4">
                <p className="font-semibold text-gray-900 mb-2">
                  {locale === "fr"
                    ? "Option 2 : Faire une autre pratique"
                    : locale === "de"
                      ? "Option 2: Weitere Übung machen"
                      : "Option 2: Take Another Practice"}
                </p>
                <p className="text-sm text-gray-600 mb-3">
                  {locale === "fr"
                    ? "Pratiquez encore pour améliorer votre score."
                    : locale === "de"
                      ? "Üben Sie weiter, um Ihr Ergebnis zu verbessern."
                      : "Practice again to improve your score."}
                </p>
                <Button onClick={onTakeAnotherPractice} variant="outline" className="w-full bg-transparent">
                  {locale === "fr"
                    ? "Générer un nouveau contrôle"
                    : locale === "de"
                      ? "Neuen Check erstellen"
                      : "Generate New Readiness Check"}
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Practice History */}
      {practiceHistory.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">
            {locale === "fr"
              ? "Votre historique de préparation"
              : locale === "de"
                ? "Ihr Bereitschaftsverlauf"
                : "Your Readiness History"}
          </h3>
          <div className="flex items-center gap-2 text-sm">
            {practiceHistory.map((p, idx) => (
              <div key={idx} className="flex items-center">
                <span className={idx === practiceHistory.length - 1 ? "font-bold text-purple-600" : "text-gray-600"}>
                  {locale === "fr" ? "Pratique" : locale === "de" ? "Übung" : "Practice"} #{idx + 1}: {p.score}%
                </span>
                {idx < practiceHistory.length - 1 && <span className="mx-2">→</span>}
              </div>
            ))}
            {improvement > 0 && <span className="ml-2 text-green-600 font-semibold">🔥</span>}
          </div>
          {improvement > 0 && (
            <p className="text-sm text-green-600 font-semibold mt-2 flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              {locale === "fr" ? "Amélioration" : locale === "de" ? "Verbesserung" : "Improvement"}: +{improvement}%{" "}
              {locale === "fr" ? "sur" : locale === "de" ? "über" : "over"} {practiceHistory.length}{" "}
              {locale === "fr" ? "pratiques" : locale === "de" ? "Übungen" : "practices"}
            </p>
          )}
        </Card>
      )}
    </div>
  )
}
