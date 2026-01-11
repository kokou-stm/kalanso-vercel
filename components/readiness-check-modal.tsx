"use client"

// =============================================================================
// ReadinessCheckModal.tsx - COMPLETE WORKING VERSION
// =============================================================================
// Copy this entire file to: components/ReadinessCheckModal.tsx

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"

interface ReadinessCheckModalProps {
  assessmentId: string
  studentId: string
  assessmentTitle?: string
  onClose: () => void
}

export function ReadinessCheckModal({
  assessmentId,
  studentId,
  assessmentTitle = "Assessment",
  onClose,
}: ReadinessCheckModalProps) {
  const [config, setConfig] = useState({
    numQuestions: 5,
    difficultyLevel: "adaptive" as const,
    timeLimit: 10,
    includeFeedback: true,
  })

  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [result, setResult] = useState<any>(null)

  async function handleGenerate() {
    console.log("[v0] Generate Readiness Check button clicked!")
    console.log("[v0] Configuration:", config)
    console.log("[v0] Student ID:", studentId)
    console.log("[v0] Assessment ID:", assessmentId)

    setError(null)
    setGenerating(true)

    try {
      console.log("[v0] Calling /api/readiness-check/generate...")

      const response = await fetch("/api/readiness-check/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          assessmentId,
          numQuestions: config.numQuestions,
          difficultyLevel: config.difficultyLevel,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate readiness check")
      }

      const generatedResult = await response.json()
      console.log("[v0] SUCCESS! Readiness check generated:", generatedResult)

      setResult(generatedResult)
      setSuccess(true)

      setTimeout(() => {
        onClose()
      }, 3000)
    } catch (err) {
      console.error("[v0] ERROR generating readiness check:", err)

      const errorMessage = err instanceof Error ? err.message : "Failed to generate readiness check. Please try again."

      setError(errorMessage)
    } finally {
      setGenerating(false)
    }
  }

  // Success screen
  if (success && result) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-green-600">✅ Readiness Check Generated!</DialogTitle>
            <DialogDescription>Your diagnostic questions are ready</DialogDescription>
          </DialogHeader>

          <div className="py-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🎉</div>
              <p className="text-xl font-semibold text-gray-800">{result.questions.length} Questions Created</p>
              <p className="text-sm text-gray-500 mt-1">
                Difficulty: <span className="font-medium capitalize">{config.difficultyLevel}</span>
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">AI Prediction</h4>
              <div className="space-y-1 text-sm text-blue-700">
                <p>
                  Expected Score: <strong>{(result.prediction.predicted_score * 100).toFixed(0)}%</strong>
                </p>
                <p>
                  Readiness:{" "}
                  <strong className="capitalize">{result.prediction.readiness_level.replace("_", " ")}</strong>
                </p>
                <p className="text-xs mt-2 text-blue-600">{result.prediction.recommendation}</p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">Sample Questions Preview:</h4>
              <ol className="text-sm text-gray-600 space-y-2">
                {result.questions.slice(0, 3).map((q: any, i: number) => (
                  <li key={q.id}>
                    <strong>{i + 1}.</strong> {q.prompt.substring(0, 60)}...
                  </li>
                ))}
              </ol>
              {result.questions.length > 3 && (
                <p className="text-xs text-gray-500 mt-2">+ {result.questions.length - 3} more questions</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  // Configuration screen
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Generate Readiness Check</DialogTitle>
          <DialogDescription>
            Create a diagnostic quiz for: <strong>{assessmentTitle}</strong>
          </DialogDescription>
        </DialogHeader>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-start">
              <span className="text-lg mr-2">⚠️</span>
              <div>
                <p className="font-semibold">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6 py-4">
          {/* Number of Questions */}
          <div className="space-y-2">
            <Label htmlFor="num-questions" className="text-sm font-medium">
              Number of Questions
            </Label>
            <Select
              value={config.numQuestions.toString()}
              onValueChange={(v) => setConfig({ ...config, numQuestions: Number.parseInt(v) })}
            >
              <SelectTrigger id="num-questions">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 questions (5-7 minutes)</SelectItem>
                <SelectItem value="5">5 questions (10-12 minutes) ⭐</SelectItem>
                <SelectItem value="10">10 questions (20-25 minutes)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">Recommended: 5 questions for a balanced assessment</p>
          </div>

          {/* Difficulty Level */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Difficulty Level</Label>
            <RadioGroup
              value={config.difficultyLevel}
              onValueChange={(v: any) => setConfig({ ...config, difficultyLevel: v })}
              className="space-y-2"
            >
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="easy" id="easy" />
                <Label htmlFor="easy" className="cursor-pointer flex-1">
                  <div className="font-medium">Easy</div>
                  <div className="text-xs text-gray-500">Basic recall and recognition</div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="medium" id="medium" />
                <Label htmlFor="medium" className="cursor-pointer flex-1">
                  <div className="font-medium">Medium</div>
                  <div className="text-xs text-gray-500">Application and analysis</div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer bg-blue-50 border-blue-200">
                <RadioGroupItem value="adaptive" id="adaptive" />
                <Label htmlFor="adaptive" className="cursor-pointer flex-1">
                  <div className="font-medium">Adaptive ⭐</div>
                  <div className="text-xs text-gray-500">AI adjusts difficulty based on your level</div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Time Limit */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Time Limit: <span className="text-blue-600">{config.timeLimit} minutes</span>
            </Label>
            <Slider
              min={5}
              max={30}
              step={5}
              value={[config.timeLimit]}
              onValueChange={([v]) => setConfig({ ...config, timeLimit: v })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>5 min</span>
              <span>30 min</span>
            </div>
          </div>

          {/* Include Feedback */}
          <div className="flex items-start space-x-3 p-3 border rounded-lg">
            <Checkbox
              id="feedback"
              checked={config.includeFeedback}
              onCheckedChange={(checked) => setConfig({ ...config, includeFeedback: !!checked })}
            />
            <Label htmlFor="feedback" className="cursor-pointer flex-1 leading-tight">
              <div className="font-medium">Show immediate feedback</div>
              <div className="text-xs text-gray-500 mt-1">Get explanations after each question to learn as you go</div>
            </Label>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={generating} className="flex-1 bg-transparent">
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={generating} className="flex-1">
            {generating ? (
              <>
                <span className="inline-block animate-spin mr-2">⏳</span>
                Generating...
              </>
            ) : (
              <>
                <span className="mr-2">✨</span>
                Generate Check
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
