"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Sparkles,
  Check,
  Pencil,
  X,
  Clock,
  Target,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Loader2,
  BookOpen,
} from "lucide-react"
import { useTranslation } from "@/lib/i18n/use-translation"
import { toast } from "@/hooks/use-toast"

interface AISessionSuggestion {
  id: string
  title: string
  description: string
  duration_minutes: number
  week: number
  day: number
  bloom_levels: string[]
  learning_objectives: string[]
  ai_confidence: number
  pedagogical_reasoning: string
  focus: string
}

interface PedagogicalAnalysis {
  bloom_distribution: Record<string, number>
  theory_practice_ratio: number
  warnings: string[]
  strengths: string[]
  gaps: string[]
}

interface AISessionGeneratorProps {
  isOpen: boolean
  onClose: () => void
  classTitle: string
  classDescription: string
  courseContext: {
    title: string
    level: string
    domain: string
  }
  onAccept: (sessions: AISessionSuggestion[]) => void
}

const bloomColors = {
  remember: "bg-blue-100 text-blue-700 border-blue-300",
  understand: "bg-green-100 text-green-700 border-green-300",
  apply: "bg-orange-100 text-orange-700 border-orange-300",
  analyze: "bg-purple-100 text-purple-700 border-purple-300",
  evaluate: "bg-red-100 text-red-700 border-red-300",
  create: "bg-pink-100 text-pink-700 border-pink-300",
}

export function AISessionGenerator({
  isOpen,
  onClose,
  classTitle,
  classDescription,
  courseContext,
  onAccept,
}: AISessionGeneratorProps) {
  const { t, locale } = useTranslation()
  const [generationMethod, setGenerationMethod] = useState<"quick" | "ai">("ai")
  const [numSessions, setNumSessions] = useState(5)
  const [userContext, setUserContext] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [suggestions, setSuggestions] = useState<AISessionSuggestion[]>([])
  const [pedagogicalAnalysis, setPedagogicalAnalysis] = useState<PedagogicalAnalysis | null>(null)
  const [selectedSessions, setSelectedSessions] = useState<Set<string>>(new Set())
  const [editingSession, setEditingSession] = useState<string | null>(null)
  const [showReasoningFor, setShowReasoningFor] = useState<string | null>(null)
  const [showAnalysis, setShowAnalysis] = useState(false)

  async function handleGenerateSuggestions() {
    setIsGenerating(true)
    setGenerationProgress(0)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setGenerationProgress((prev) => Math.min(prev + 20, 90))
      }, 500)

      // Call AI API
      const response = await fetch("/api/ai/generate-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          class_title: classTitle,
          class_description: classDescription,
          course_context: courseContext,
          num_sessions: numSessions,
          user_context: userContext,
          generation_method: generationMethod,
        }),
      })

      clearInterval(progressInterval)
      setGenerationProgress(100)

      if (!response.ok) throw new Error("Generation failed")

      const data = await response.json()
      setSuggestions(data.sessions)
      setPedagogicalAnalysis(data.pedagogical_analysis)

      // Auto-select all sessions
      setSelectedSessions(new Set(data.sessions.map((s: AISessionSuggestion) => s.id)))

      toast({
        title: "Sessions Generated",
        description: `${data.sessions.length} pedagogically optimized sessions ready`,
      })
    } catch (error) {
      console.error("[v0] AI generation error:", error)
      toast({
        title: "Generation Failed",
        description: "Unable to generate suggestions. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
      setGenerationProgress(0)
    }
  }

  function toggleSessionSelection(sessionId: string) {
    setSelectedSessions((prev) => {
      const next = new Set(prev)
      if (next.has(sessionId)) {
        next.delete(sessionId)
      } else {
        next.add(sessionId)
      }
      return next
    })
  }

  function handleAcceptAll() {
    const acceptedSessions = suggestions.filter((s) => selectedSessions.has(s.id))
    onAccept(acceptedSessions)
    onClose()
  }

  function handleRegenerate() {
    if (confirm("This will replace current suggestions. Continue?")) {
      setSuggestions([])
      setPedagogicalAnalysis(null)
      setSelectedSessions(new Set())
      handleGenerateSuggestions()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            AI-Powered Session Generation
          </DialogTitle>
        </DialogHeader>

        {suggestions.length === 0 ? (
          // Configuration Panel
          <div className="space-y-6">
            <div>
              <Label className="text-base font-semibold mb-3 block">Session Generation Method</Label>
              <RadioGroup value={generationMethod} onValueChange={(v) => setGenerationMethod(v as "quick" | "ai")}>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="quick" id="quick" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="quick" className="cursor-pointer font-medium">
                        Quick Setup
                      </Label>
                      <p className="text-sm text-gray-500 mt-1">{numSessions} generic sessions with basic titles</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-4 border-2 border-purple-200 bg-purple-50 rounded-lg cursor-pointer">
                    <RadioGroupItem value="ai" id="ai" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="ai" className="cursor-pointer font-medium flex items-center gap-2">
                        AI-Powered (Recommended)
                        <Sparkles className="h-4 w-4 text-purple-600" />
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">Pedagogically optimized for your topic</p>
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="numSessions">Number of sessions</Label>
              <Input
                id="numSessions"
                type="number"
                value={numSessions}
                onChange={(e) => setNumSessions(Number(e.target.value))}
                min={1}
                max={10}
                className="mt-2"
              />
            </div>

            {generationMethod === "ai" && (
              <div>
                <Label htmlFor="context">Context for AI (optional)</Label>
                <Textarea
                  id="context"
                  value={userContext}
                  onChange={(e) => setUserContext(e.target.value)}
                  placeholder='e.g., "Focus on practical coding examples with Python"'
                  className="mt-2 h-24"
                />
              </div>
            )}

            <Button onClick={handleGenerateSuggestions} disabled={isGenerating} className="w-full" size="lg">
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating session {Math.floor((generationProgress / 100) * numSessions)} of {numSessions}...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate AI Suggestions
                </>
              )}
            </Button>

            {isGenerating && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-purple-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${generationProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            )}
          </div>
        ) : (
          // Suggestions Panel
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Based on: "{classTitle}"</p>
                <p>Pedagogical approach: Progressive skill building</p>
              </div>
              <Badge variant="outline" className="text-purple-700 border-purple-300">
                {selectedSessions.size} of {suggestions.length} selected
              </Badge>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              <AnimatePresence>
                {suggestions.map((session, index) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    index={index}
                    isSelected={selectedSessions.has(session.id)}
                    isEditing={editingSession === session.id}
                    showReasoning={showReasoningFor === session.id}
                    onToggleSelect={() => toggleSessionSelection(session.id)}
                    onEdit={() => setEditingSession(session.id)}
                    onSaveEdit={() => setEditingSession(null)}
                    onCancelEdit={() => setEditingSession(null)}
                    onToggleReasoning={() => setShowReasoningFor(showReasoningFor === session.id ? null : session.id)}
                  />
                ))}
              </AnimatePresence>
            </div>

            {pedagogicalAnalysis && (
              <Card className="p-4">
                <button
                  onClick={() => setShowAnalysis(!showAnalysis)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-600" />
                    <span className="font-semibold">Pedagogical Analysis</span>
                  </div>
                  {showAnalysis ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>

                {showAnalysis && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-4 space-y-3 text-sm"
                  >
                    <div>
                      <h4 className="font-medium mb-2">Strengths:</h4>
                      <ul className="space-y-1">
                        {pedagogicalAnalysis.strengths.map((strength, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {pedagogicalAnalysis.warnings.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Suggestions:</h4>
                        <ul className="space-y-1">
                          {pedagogicalAnalysis.warnings.map((warning, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
                              <span>{warning}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                )}
              </Card>
            )}

            <div className="flex gap-2 pt-4 border-t">
              <Button variant="outline" onClick={handleRegenerate} className="flex-1 bg-transparent">
                <RefreshCw className="mr-2 h-4 w-4" />
                Regenerate
              </Button>
              <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                Back
              </Button>
              <Button
                onClick={handleAcceptAll}
                disabled={selectedSessions.size === 0}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Check className="mr-2 h-4 w-4" />
                Accept {selectedSessions.size > 0 && `(${selectedSessions.size})`}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function SessionCard({
  session,
  index,
  isSelected,
  isEditing,
  showReasoning,
  onToggleSelect,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  onToggleReasoning,
}: {
  session: AISessionSuggestion
  index: number
  isSelected: boolean
  isEditing: boolean
  showReasoning: boolean
  onToggleSelect: () => void
  onEdit: () => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onToggleReasoning: () => void
}) {
  const primaryBloomLevel = session.bloom_levels[0]
  const borderColor = bloomColors[primaryBloomLevel as keyof typeof bloomColors]?.split(" ")[2] || "border-gray-300"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: isSelected ? 1 : 0.6,
        y: 0,
        scale: isSelected ? 1 : 0.98,
      }}
      exit={{ opacity: 0, x: -20 }}
      className={`
        border-l-4 ${borderColor} bg-white rounded-lg shadow-sm hover:shadow-md transition-all
        ${isSelected ? "ring-2 ring-green-200 bg-green-50/30" : ""}
        ${isEditing ? "ring-2 ring-blue-500" : ""}
      `}
    >
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="outline" className="font-semibold">
                Session {index + 1}
              </Badge>
              <h3 className="font-semibold text-lg">{session.title}</h3>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {session.duration_minutes} min
              </div>
              <div>
                Week {session.week}, Day {session.day}
              </div>
              <div className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                {session.bloom_levels.map((level) => level.charAt(0).toUpperCase() + level.slice(1)).join(" → ")}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {session.bloom_levels.map((level) => (
                <Badge key={level} className={bloomColors[level as keyof typeof bloomColors]}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Badge>
              ))}
            </div>

            <p className="text-sm text-gray-700 mb-3">
              <span className="font-medium">Focus:</span> {session.focus}
            </p>

            {session.learning_objectives.length > 0 && (
              <div className="text-sm">
                <p className="font-medium mb-2">Learning Objectives:</p>
                <ul className="space-y-1 ml-4">
                  {session.learning_objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-gray-400">•</span>
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {showReasoning && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className="mt-4 p-3 bg-purple-50 rounded-lg text-sm"
              >
                <p className="font-medium flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  AI Pedagogical Reasoning
                </p>
                <p className="text-gray-700">{session.pedagogical_reasoning}</p>
                <p className="text-xs text-gray-500 mt-2">Confidence: {(session.ai_confidence * 100).toFixed(0)}%</p>
              </motion.div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 pt-4 border-t">
          <Button
            size="sm"
            variant={isSelected ? "default" : "outline"}
            onClick={onToggleSelect}
            className={isSelected ? "bg-green-600 hover:bg-green-700" : ""}
          >
            {isSelected ? (
              <>
                <Check className="h-4 w-4 mr-1" />
                Included
              </>
            ) : (
              "Include"
            )}
          </Button>
          <Button size="sm" variant="outline" onClick={onEdit}>
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button size="sm" variant="ghost" onClick={onToggleReasoning}>
            <BookOpen className="h-4 w-4 mr-1" />
            {showReasoning ? "Hide" : "Why?"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onToggleSelect}
            className="ml-auto text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
