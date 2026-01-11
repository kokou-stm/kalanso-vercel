"use client"

import { useState } from "react"
import { ThumbsUp, ThumbsDown, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface InsightFeedbackBarProps {
  insightId: string
  section: string
  studentId: string
  language: string
}

type FeedbackState = "idle" | "positive" | "negative" | "suggestion"

const ENABLE_FEEDBACK_TRACKING = true // Set to true after running scripts/create-insight-feedback-tables.sql

export function InsightFeedbackBar({ insightId, section, studentId, language }: InsightFeedbackBarProps) {
  const [feedbackState, setFeedbackState] = useState<FeedbackState>("idle")
  const [feedbackGiven, setFeedbackGiven] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [commentText, setCommentText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const getText = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      question: {
        en: "Was this helpful?",
        fr: "Était-ce utile?",
        de: "War das hilfreich?",
      },
      yes: {
        en: "Yes",
        fr: "Oui",
        de: "Ja",
      },
      no: {
        en: "No",
        fr: "Non",
        de: "Nein",
      },
      suggest: {
        en: "Suggest Improvement",
        fr: "Suggérer une amélioration",
        de: "Verbesserung vorschlagen",
      },
      whatBetter: {
        en: "What could be better? (optional)",
        fr: "Qu'est-ce qui pourrait être amélioré? (facultatif)",
        de: "Was könnte besser sein? (optional)",
      },
      skip: {
        en: "Skip",
        fr: "Passer",
        de: "Überspringen",
      },
      submit: {
        en: "Submit Feedback",
        fr: "Envoyer le retour",
        de: "Feedback senden",
      },
      thanks: {
        en: "Thanks for your feedback! 💙",
        fr: "Merci pour votre retour! 💙",
        de: "Danke für Ihr Feedback! 💙",
      },
    }
    return translations[key]?.[language] || translations[key]?.en || ""
  }

  const categories = {
    negative: [
      {
        value: "not_relevant",
        label: {
          en: "Not relevant to my learning",
          fr: "Non pertinent pour mon apprentissage",
          de: "Nicht relevant für mein Lernen",
        },
      },
      {
        value: "outdated",
        label: {
          en: "Information is outdated",
          fr: "Les informations sont obsolètes",
          de: "Informationen sind veraltet",
        },
      },
      {
        value: "too_technical",
        label: {
          en: "Too technical / hard to understand",
          fr: "Trop technique / difficile à comprendre",
          de: "Zu technisch / schwer zu verstehen",
        },
      },
      {
        value: "missing_details",
        label: { en: "Missing important details", fr: "Détails importants manquants", de: "Wichtige Details fehlen" },
      },
      {
        value: "poor_example",
        label: {
          en: "Example doesn't match the concept",
          fr: "L'exemple ne correspond pas au concept",
          de: "Beispiel passt nicht zum Konzept",
        },
      },
      {
        value: "incorrect_facts",
        label: {
          en: "Numbers/facts seem incorrect",
          fr: "Les chiffres/faits semblent incorrects",
          de: "Zahlen/Fakten scheinen falsch",
        },
      },
    ],
    suggestion: [
      {
        value: "add_more_examples",
        label: { en: "Add more examples", fr: "Ajouter plus d'exemples", de: "Mehr Beispiele hinzufügen" },
      },
      {
        value: "simplify_explanation",
        label: { en: "Simplify explanation", fr: "Simplifier l'explication", de: "Erklärung vereinfachen" },
      },
      {
        value: "update_numbers",
        label: {
          en: "Update numbers/statistics",
          fr: "Mettre à jour les chiffres/statistiques",
          de: "Zahlen/Statistiken aktualisieren",
        },
      },
      {
        value: "add_video",
        label: { en: "Add video content", fr: "Ajouter du contenu vidéo", de: "Videoinhalte hinzufügen" },
      },
      {
        value: "different_example",
        label: { en: "Use a different example", fr: "Utiliser un exemple différent", de: "Anderes Beispiel verwenden" },
      },
    ],
  }

  const handleThumbsUp = async () => {
    setFeedbackState("positive")
    setFeedbackGiven(true)
    setIsSubmitting(true)

    if (!ENABLE_FEEDBACK_TRACKING) {
      console.log("[v0] Feedback tracking disabled - run scripts/create-insight-feedback-tables.sql to enable")
      toast.success(getText("thanks"))
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch("/api/insights/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          insight_id: insightId,
          student_id: studentId,
          feedback_type: "thumbs_up",
          section,
        }),
      })

      if (!response.ok) {
        throw new Error(`Feedback failed: ${response.statusText}`)
      }

      toast.success(getText("thanks"))
    } catch (error) {
      console.warn("[v0] Feedback submission failed:", error)
      toast.success(getText("thanks"))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleThumbsDown = () => {
    setFeedbackGiven(true)
    setFeedbackState("negative")
  }

  const handleSuggest = () => {
    setFeedbackGiven(true)
    setFeedbackState("suggestion")
  }

  const handleSubmit = async () => {
    if (!selectedCategory && feedbackState !== "positive") return

    setIsSubmitting(true)

    if (!ENABLE_FEEDBACK_TRACKING) {
      console.log("[v0] Feedback tracking disabled - run scripts/create-insight-feedback-tables.sql to enable")
      toast.success(getText("thanks"))
      setFeedbackState("idle")
      setSelectedCategory("")
      setCommentText("")
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch("/api/insights/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          insight_id: insightId,
          student_id: studentId,
          feedback_type: feedbackState === "negative" ? "thumbs_down" : "suggestion",
          section,
          category: selectedCategory,
          comment: commentText,
        }),
      })

      if (!response.ok) {
        throw new Error(`Feedback failed: ${response.statusText}`)
      }

      toast.success(getText("thanks"))
      setFeedbackState("idle")
      setSelectedCategory("")
      setCommentText("")
    } catch (error) {
      console.warn("[v0] Feedback submission failed:", error)
      toast.success(getText("thanks"))
      setFeedbackState("idle")
      setSelectedCategory("")
      setCommentText("")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkip = () => {
    setFeedbackState("idle")
    setSelectedCategory("")
    setCommentText("")
  }

  return (
    <div className="border-t border-gray-200 bg-gray-50 p-4 rounded-b-lg">
      <p className="text-sm font-medium text-gray-700 mb-3">{getText("question")}</p>

      {!feedbackGiven && feedbackState === "idle" && (
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="bg-white hover:bg-green-50 hover:border-green-500 hover:text-green-700 transition-all"
            onClick={handleThumbsUp}
            disabled={isSubmitting}
          >
            <ThumbsUp className="h-4 w-4 mr-2" />
            {getText("yes")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-white hover:bg-red-50 hover:border-red-500 hover:text-red-700 transition-all"
            onClick={handleThumbsDown}
            disabled={isSubmitting}
          >
            <ThumbsDown className="h-4 w-4 mr-2" />
            {getText("no")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-white hover:bg-blue-50 hover:border-blue-500 hover:text-blue-700 transition-all"
            onClick={handleSuggest}
            disabled={isSubmitting}
          >
            <Lightbulb className="h-4 w-4 mr-2" />
            {getText("suggest")}
          </Button>
        </div>
      )}

      {feedbackGiven && feedbackState === "positive" && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-3 animate-in slide-in-from-top duration-300">
          <ThumbsUp className="h-5 w-5 text-green-600" />
          <p className="text-sm font-medium text-green-700">{getText("thanks")}</p>
        </div>
      )}

      {(feedbackState === "negative" || feedbackState === "suggestion") && (
        <div className="space-y-4 bg-white p-4 rounded-lg border border-gray-300 animate-in slide-in-from-top duration-300">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">{getText("whatBetter")}</p>
            <RadioGroup value={selectedCategory} onValueChange={setSelectedCategory}>
              {categories[feedbackState].map((cat) => (
                <div key={cat.value} className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value={cat.value} id={cat.value} />
                  <Label htmlFor={cat.value} className="text-sm cursor-pointer">
                    {cat.label[language as keyof typeof cat.label] || cat.label.en}
                  </Label>
                </div>
              ))}
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other" className="text-sm cursor-pointer">
                  Other:
                </Label>
              </div>
            </RadioGroup>
          </div>

          {selectedCategory === "other" && (
            <Textarea
              placeholder={
                language === "fr"
                  ? "Veuillez préciser..."
                  : language === "de"
                    ? "Bitte spezifizieren..."
                    : "Please specify..."
              }
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="min-h-[80px]"
            />
          )}

          <div className="flex items-center gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={handleSkip} disabled={isSubmitting}>
              {getText("skip")}
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!selectedCategory || isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {getText("submit")}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
