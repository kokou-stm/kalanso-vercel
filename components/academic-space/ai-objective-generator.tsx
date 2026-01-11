"use client"

import { useState } from "react"
import { useTranslation } from "@/lib/i18n/use-translation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Pencil,
  Plus,
  Target,
  BookOpen,
  Lightbulb,
  TrendingUp,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface AIObjective {
  id: string
  statement: string
  bloom_cognitive: string
  bloom_knowledge: string
  success_criteria: Array<{ id: string; text: string; measurable: boolean }>
  confidence: number
  reasoning: string
  smart_analysis: {
    specific: boolean
    measurable: boolean
    achievable: boolean
    relevant: boolean
    time_bound: boolean
  }
}

interface AIGeneratorProps {
  sessionTitle: string
  sessionDescription: string
  onSelect: (objectives: AIObjective[]) => void
  onManual: () => void
  language: string
}

const confidenceConfig = {
  high: { threshold: 0.85, stars: 3, color: "text-green-600", label: "High Confidence" },
  medium: { threshold: 0.6, stars: 2, color: "text-yellow-600", label: "Medium Confidence" },
  low: { threshold: 0, stars: 1, color: "text-orange-600", label: "Low Confidence" },
}

const cognitiveColors = {
  remember: "bg-gray-100 text-gray-800 border-gray-300",
  understand: "bg-blue-100 text-blue-800 border-blue-300",
  apply: "bg-green-100 text-green-800 border-green-300",
  analyze: "bg-yellow-100 text-yellow-800 border-yellow-300",
  evaluate: "bg-orange-100 text-orange-800 border-orange-300",
  create: "bg-purple-100 text-purple-800 border-purple-300",
}

export function AIObjectiveGenerator({
  sessionTitle,
  sessionDescription,
  onSelect,
  onManual,
  language,
}: AIGeneratorProps) {
  const { t } = useTranslation()
  const [mode, setMode] = useState<"choice" | "generating" | "suggestions">("choice")
  const [suggestions, setSuggestions] = useState<AIObjective[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [progress, setProgress] = useState(0)
  const [isRegenerating, setIsRegenerating] = useState(false)

  const generateObjectives = async () => {
    setMode("generating")
    setProgress(0)

    // Simulate AI analysis with progress
    const steps = [
      { delay: 500, progress: 25, message: "Examining session description" },
      { delay: 800, progress: 50, message: "Identifying key skills and concepts" },
      { delay: 600, progress: 75, message: "Mapping to Bloom's taxonomy" },
      { delay: 700, progress: 100, message: "Generating success criteria" },
    ]

    for (const step of steps) {
      await new Promise((resolve) => setTimeout(resolve, step.delay))
      setProgress(step.progress)
    }

    // Mock AI API call
    const mockObjectives: AIObjective[] = [
      {
        id: "obj_1",
        statement: `Students will be able to implement ${sessionTitle.toLowerCase()} using industry-standard tools and methodologies.`,
        bloom_cognitive: "apply",
        bloom_knowledge: "procedural",
        success_criteria: [
          { id: "sc_1", text: "Correctly implements core functionality", measurable: true },
          { id: "sc_2", text: "Follows best practices and coding standards", measurable: true },
          { id: "sc_3", text: "Validates output format and accuracy", measurable: true },
        ],
        confidence: 0.95,
        reasoning:
          "This objective targets hands-on application skills essential for mastery. Focuses on procedural steps rather than theory.",
        smart_analysis: {
          specific: true,
          measurable: true,
          achievable: true,
          relevant: true,
          time_bound: true,
        },
      },
      {
        id: "obj_2",
        statement:
          "Students will be able to evaluate outcomes using appropriate metrics and interpret results correctly.",
        bloom_cognitive: "evaluate",
        bloom_knowledge: "procedural",
        success_criteria: [
          { id: "sc_4", text: "Calculates relevant performance metrics", measurable: true },
          { id: "sc_5", text: "Interprets results in context", measurable: true },
          { id: "sc_6", text: "Identifies areas for improvement", measurable: true },
        ],
        confidence: 0.88,
        reasoning: "Evaluation skills are crucial for understanding effectiveness and making informed decisions.",
        smart_analysis: {
          specific: true,
          measurable: true,
          achievable: true,
          relevant: true,
          time_bound: true,
        },
      },
      {
        id: "obj_3",
        statement: "Students will be able to debug common implementation errors and apply troubleshooting strategies.",
        bloom_cognitive: "analyze",
        bloom_knowledge: "metacognitive",
        success_criteria: [
          { id: "sc_7", text: "Identifies root causes of errors", measurable: true },
          { id: "sc_8", text: "Applies systematic debugging approaches", measurable: true },
          { id: "sc_9", text: "Documents solutions for future reference", measurable: true },
        ],
        confidence: 0.75,
        reasoning: "Problem-solving and debugging develop critical thinking and metacognitive awareness.",
        smart_analysis: {
          specific: true,
          measurable: true,
          achievable: true,
          relevant: true,
          time_bound: false,
        },
      },
      {
        id: "obj_4",
        statement: "Students will understand the underlying principles and theoretical foundations.",
        bloom_cognitive: "understand",
        bloom_knowledge: "conceptual",
        success_criteria: [
          { id: "sc_10", text: "Explains key concepts accurately", measurable: true },
          { id: "sc_11", text: "Connects theory to practice", measurable: true },
        ],
        confidence: 0.55,
        reasoning:
          "While important, this may be better suited for a theory-focused session rather than hands-on implementation.",
        smart_analysis: {
          specific: false,
          measurable: true,
          achievable: true,
          relevant: true,
          time_bound: true,
        },
      },
    ]

    setSuggestions(mockObjectives)
    setMode("suggestions")
  }

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selected)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelected(newSelected)
  }

  const handleAddSelected = () => {
    const selectedObjectives = suggestions.filter((obj) => selected.has(obj.id))
    onSelect(selectedObjectives)
  }

  const getConfidenceLevel = (score: number): "high" | "medium" | "low" => {
    if (score >= confidenceConfig.high.threshold) return "high"
    if (score >= confidenceConfig.medium.threshold) return "medium"
    return "low"
  }

  // Choice Screen
  if (mode === "choice") {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Create Learning Objective</h2>
          <p className="text-gray-600">Choose your approach:</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Manual Mode */}
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={onManual}>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Pencil className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold">Write Manually</h3>
              <p className="text-sm text-gray-600">I know exactly what students should learn</p>
              <div className="text-xs text-gray-500">
                <strong>Best for:</strong> Specific, unique objectives
              </div>
              <Button variant="outline" className="w-full bg-transparent">
                Start Writing
              </Button>
            </div>
          </Card>

          {/* AI Assistant Mode */}
          <Card
            className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-purple-200"
            onClick={generateObjectives}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold">AI Assistant</h3>
              <p className="text-sm text-gray-600">Generate smart suggestions based on session</p>
              <div className="text-xs text-gray-500">
                <strong>Best for:</strong> Quick start, learning pedagogy
              </div>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">Get Suggestions</Button>
            </div>
          </Card>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <Lightbulb className="w-5 h-5 text-blue-600 inline mr-2" />
          <span className="text-sm text-blue-800">Tip: You can always edit AI suggestions</span>
        </div>
      </motion.div>
    )
  }

  // Generating Screen
  if (mode === "generating") {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="text-center mb-8">
          <Sparkles className="w-12 h-12 text-purple-600 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold mb-2">AI Learning Objective Generator</h2>
          <p className="text-gray-600">Analyzing session context...</p>
        </div>

        <Card className="p-6 space-y-6">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Target className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <p className="font-medium">Session: "{sessionTitle}"</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">{sessionDescription || "No description provided"}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="space-y-2 text-sm">
            <div className={`flex items-center gap-2 ${progress >= 25 ? "text-green-600" : "text-gray-400"}`}>
              {progress >= 25 ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
              )}
              Examining session description
            </div>
            <div className={`flex items-center gap-2 ${progress >= 50 ? "text-green-600" : "text-gray-400"}`}>
              {progress >= 50 ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
              )}
              Identifying key skills and concepts
            </div>
            <div className={`flex items-center gap-2 ${progress >= 75 ? "text-green-600" : "text-gray-400"}`}>
              {progress >= 75 ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
              )}
              Mapping to Bloom's taxonomy
            </div>
            <div className={`flex items-center gap-2 ${progress >= 100 ? "text-green-600" : "text-gray-400"}`}>
              {progress >= 100 ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
              )}
              Generating success criteria
            </div>
          </div>
        </Card>
      </motion.div>
    )
  }

  // Suggestions Screen
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            AI-Generated Learning Objectives ({suggestions.length})
          </h2>
          <p className="text-sm text-gray-600 mt-1">For: "{sessionTitle}"</p>
        </div>
        <Button variant="outline" onClick={generateObjectives} disabled={isRegenerating}>
          <TrendingUp className="w-4 h-4 mr-2" />
          Regenerate
        </Button>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {suggestions.map((objective, index) => {
            const confidenceLevel = getConfidenceLevel(objective.confidence)
            const config = confidenceConfig[confidenceLevel]
            const isSelected = selected.has(objective.id)

            return (
              <motion.div
                key={objective.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`p-6 transition-all ${isSelected ? "ring-2 ring-purple-500 shadow-lg" : ""}`}>
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="font-bold text-lg">OBJECTIVE {index + 1}</div>
                        <div className={`flex items-center gap-1 ${config.color}`}>
                          {Array.from({ length: config.stars }).map((_, i) => (
                            <span key={i}>⭐</span>
                          ))}
                          <span className="text-xs ml-1 uppercase">{config.label}</span>
                        </div>
                      </div>
                    </div>

                    {/* Objective Statement */}
                    <div className="text-base leading-relaxed">"{objective.statement}"</div>

                    {/* Taxonomy Classification */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Target className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">Taxonomy Classification:</span>
                      <Badge className={cognitiveColors[objective.bloom_cognitive as keyof typeof cognitiveColors]}>
                        {objective.bloom_cognitive.charAt(0).toUpperCase() + objective.bloom_cognitive.slice(1)}
                      </Badge>
                      <span className="text-sm text-gray-500">×</span>
                      <Badge variant="outline">
                        {objective.bloom_knowledge.charAt(0).toUpperCase() + objective.bloom_knowledge.slice(1)}
                      </Badge>
                    </div>

                    {/* Success Criteria */}
                    <div className="space-y-2">
                      <div className="text-sm font-medium flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        Auto-Generated Success Criteria ({objective.success_criteria.length}):
                      </div>
                      <ul className="space-y-1 ml-6">
                        {objective.success_criteria.map((criterion) => (
                          <li key={criterion.id} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-green-600 mt-0.5">✓</span>
                            {criterion.text}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* AI Reasoning */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="text-sm font-medium text-blue-900 mb-1 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" />
                        AI Reasoning:
                      </div>
                      <p className="text-sm text-blue-800 italic">"{objective.reasoning}"</p>
                    </div>

                    {/* SMART Analysis Warning */}
                    {!Object.values(objective.smart_analysis).every((v) => v) && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="text-sm text-yellow-800 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          <span>Note: Consider refining to meet all SMART criteria</span>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant={isSelected ? "default" : "outline"}
                        onClick={() => toggleSelect(objective.id)}
                        className={isSelected ? "bg-purple-600 hover:bg-purple-700" : ""}
                      >
                        {isSelected ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                        {isSelected ? "Selected" : "Add"}
                      </Button>
                      <Button variant="ghost">
                        <Pencil className="w-4 h-4 mr-2" />
                        Customize
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-500">
                        <XCircle className="w-4 h-4 mr-2" />
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Pedagogical Analysis */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          Pedagogical Analysis
        </h3>
        <div className="space-y-3 text-sm">
          <div>
            <strong>Bloom Distribution:</strong> Apply (50%), Evaluate (25%), Analyze (18%), Understand (7%)
          </div>
          <div className="flex items-start gap-2 text-green-700">
            <CheckCircle2 className="w-4 h-4 mt-0.5" />
            <span>Well-balanced for hands-on session</span>
          </div>
          <div className="flex items-start gap-2 text-yellow-700">
            <AlertCircle className="w-4 h-4 mt-0.5" />
            <span>Consider adding Analyze-level objective for critical thinking</span>
          </div>
        </div>
      </Card>

      {/* Bottom Actions */}
      <div className="flex justify-between items-center pt-4 border-t">
        <div className="text-sm text-gray-600">
          Selected: <strong>{selected.size}</strong> of {suggestions.length}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setMode("choice")}>
            Back
          </Button>
          <Button
            onClick={handleAddSelected}
            disabled={selected.size === 0}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Add Selected ({selected.size})
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
