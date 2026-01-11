"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Clock, FileText, Info, Sparkles } from "lucide-react"
import { useTranslation } from "@/lib/i18n/use-translation"

interface ReadinessCheckGeneratorProps {
  isOpen: boolean
  onClose: () => void
  assessment: {
    title: string
    questionCount: number
    timeLimit: number
  }
  onStart: (config: {
    mode: "timed" | "practice"
    showAnswers: boolean
    allowHints: boolean
    skipKnown: boolean
  }) => void
}

export function ReadinessCheckGenerator({ isOpen, onClose, assessment, onStart }: ReadinessCheckGeneratorProps) {
  const { t, locale } = useTranslation()
  const [mode, setMode] = useState<"timed" | "practice">("practice")
  const [showAnswers, setShowAnswers] = useState(true)
  const [allowHints, setAllowHints] = useState(true)
  const [skipKnown, setSkipKnown] = useState(false)

  const handleStart = () => {
    onStart({ mode, showAnswers, allowHints, skipKnown })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-purple-600" />
            {locale === "fr"
              ? "Configuration du contrôle de préparation"
              : locale === "de"
                ? "Bereitschaftscheck-Konfiguration"
                : "Readiness Check Configuration"}
          </DialogTitle>
          <p className="text-sm text-gray-600 font-normal">{assessment.title}</p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Benefits */}
          <Alert className="bg-purple-50 border-purple-200">
            <Info className="h-4 w-4 text-purple-600" />
            <AlertDescription>
              <p className="font-semibold text-sm mb-2">
                {locale === "fr"
                  ? "Cette pratique va :"
                  : locale === "de"
                    ? "Diese Übung wird:"
                    : "This practice will:"}
              </p>
              <ul className="text-sm space-y-1">
                <li>
                  ✓{" "}
                  {locale === "fr"
                    ? "Correspondre au format réel de l'évaluation"
                    : locale === "de"
                      ? "Das echte Bewertungsformat anpassen"
                      : "Match the real assessment format"}
                </li>
                <li>
                  ✓{" "}
                  {locale === "fr"
                    ? "Tester les mêmes sujets et difficulté"
                    : locale === "de"
                      ? "Die gleichen Themen und Schwierigkeiten testen"
                      : "Test the same topics and difficulty"}
                </li>
                <li>
                  ✓{" "}
                  {locale === "fr"
                    ? "Fournir un feedback immédiat"
                    : locale === "de"
                      ? "Sofortiges Feedback geben"
                      : "Provide immediate feedback"}
                </li>
                <li>
                  ✓{" "}
                  {locale === "fr"
                    ? "Montrer votre score prédit"
                    : locale === "de"
                      ? "Ihr vorhergesagtes Ergebnis zeigen"
                      : "Show your predicted score"}
                </li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Format Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">
              {locale === "fr" ? "Format :" : locale === "de" ? "Format:" : "Format:"}
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                {assessment.questionCount} {locale === "fr" ? "questions" : locale === "de" ? "Fragen" : "questions"}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {assessment.timeLimit} {locale === "fr" ? "minutes" : locale === "de" ? "Minuten" : "minutes"}
              </span>
            </div>
          </div>

          {/* Mode Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              {locale === "fr" ? "Mode :" : locale === "de" ? "Modus:" : "Mode:"}
            </Label>
            <RadioGroup value={mode} onValueChange={(v) => setMode(v as "timed" | "practice")}>
              <div className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="timed" id="timed" />
                <div className="flex-1">
                  <Label htmlFor="timed" className="font-semibold cursor-pointer">
                    {locale === "fr" ? "Mode chronométré" : locale === "de" ? "Zeitgesteuerter Modus" : "Timed Mode"}
                  </Label>
                  <p className="text-sm text-gray-600">
                    {locale === "fr"
                      ? "Correspond aux conditions réelles"
                      : locale === "de"
                        ? "Echte Bedingungen entsprechen"
                        : "Match real conditions"}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer bg-purple-50 border-purple-200">
                <RadioGroupItem value="practice" id="practice" />
                <div className="flex-1">
                  <Label htmlFor="practice" className="font-semibold cursor-pointer">
                    {locale === "fr" ? "Mode pratique" : locale === "de" ? "Übungsmodus" : "Practice Mode"}
                  </Label>
                  <p className="text-sm text-gray-600">
                    {locale === "fr"
                      ? "Sans chronomètre, afficher les réponses"
                      : locale === "de"
                        ? "Ohne Timer, Antworten anzeigen"
                        : "Untimed, show answers"}
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              {locale === "fr" ? "Options :" : locale === "de" ? "Optionen:" : "Options:"}
            </Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showAnswers"
                  checked={showAnswers}
                  onCheckedChange={(c) => setShowAnswers(c as boolean)}
                />
                <Label htmlFor="showAnswers" className="text-sm cursor-pointer">
                  {locale === "fr"
                    ? "Afficher les réponses correctes après chaque question"
                    : locale === "de"
                      ? "Korrekte Antworten nach jeder Frage anzeigen"
                      : "Show correct answers after each question"}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="allowHints" checked={allowHints} onCheckedChange={(c) => setAllowHints(c as boolean)} />
                <Label htmlFor="allowHints" className="text-sm cursor-pointer">
                  {locale === "fr"
                    ? "Obtenir des indices si je suis bloqué"
                    : locale === "de"
                      ? "Hinweise erhalten, wenn ich feststecke"
                      : "Get hints if I'm stuck"}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="skipKnown" checked={skipKnown} onCheckedChange={(c) => setSkipKnown(c as boolean)} />
                <Label htmlFor="skipKnown" className="text-sm cursor-pointer">
                  {locale === "fr"
                    ? "Ignorer les questions que je connais déjà"
                    : locale === "de"
                      ? "Fragen überspringen, die ich bereits kenne"
                      : "Skip questions I already know"}
                </Label>
              </div>
            </div>
          </div>

          {/* Info */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {locale === "fr"
                ? "Vous pouvez faire un nombre illimité de contrôles de préparation"
                : locale === "de"
                  ? "Sie können unbegrenzt Bereitschaftschecks durchführen"
                  : "You can take unlimited readiness checks"}
            </AlertDescription>
          </Alert>

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={handleStart} className="flex-1 bg-purple-600 hover:bg-purple-700">
              <Sparkles className="h-4 w-4 mr-2" />
              {locale === "fr" ? "Démarrer le contrôle" : locale === "de" ? "Check starten" : "Start Readiness Check"}
            </Button>
            <Button onClick={onClose} variant="outline">
              {locale === "fr" ? "Annuler" : locale === "de" ? "Abbrechen" : "Cancel"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
