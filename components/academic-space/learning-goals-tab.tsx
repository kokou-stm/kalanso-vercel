"use client"

import { useTranslation } from "@/lib/i18n/use-translation"
import type { Course } from "@/types/academic"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HelpButton, HelpPanel } from "@/lib/help/HelpPanel"
import { ContextualHelp } from "@/lib/help/HelpModal"
import { FieldWithHelp } from "@/components/ui/field-with-help"
import { HelpTooltip } from "@/components/ui/help-tooltip"
import { EmptyStateWithHelp } from "@/lib/help/HelpModal"
import { Target } from "lucide-react"
import {
  Plus,
  GripVertical,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Home,
  ChevronRight,
} from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { AIObjectiveGenerator } from "./ai-objective-generator"

interface LearningObjective {
  id: string
  session_id: string
  objective_text: string
  cognitive_dimension: string
  knowledge_dimension: string
  ai_confidence_score: number
  ai_suggested_cognitive: string | null
  ai_suggested_knowledge: string | null
  ai_reasoning: string | null
  success_criteria: string[]
  mastery_threshold: number
  required_for_progression: boolean
  sequence_order: number
  manually_overridden: boolean
}

interface LearningGoalsTabProps {
  course: Course
  onSave: (courseData: any) => void
}

// Bloom's Taxonomy color mapping
const cognitiveColors = {
  remember: "bg-gray-100 text-gray-800 border-gray-300",
  understand: "bg-blue-100 text-blue-800 border-blue-300",
  apply: "bg-green-100 text-green-800 border-green-300",
  analyze: "bg-yellow-100 text-yellow-800 border-yellow-300",
  evaluate: "bg-orange-100 text-orange-800 border-orange-300",
  create: "bg-purple-100 text-purple-800 border-purple-300",
}

const confidenceConfig = {
  high: { threshold: 0.85, color: "text-green-600", icon: CheckCircle2 },
  medium: { threshold: 0.7, color: "text-yellow-600", icon: AlertCircle },
  low: { threshold: 0, color: "text-red-600", icon: XCircle },
}

export function LearningGoalsTab({ course, onSave }: LearningGoalsTabProps) {
  const { t, locale } = useTranslation()
  const { toast } = useToast()
  const supabase = createClient()

  const [objectives, setObjectives] = useState<LearningObjective[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isObjectiveModalOpen, setIsObjectiveModalOpen] = useState(false)
  const [editingObjective, setEditingObjective] = useState<LearningObjective | null>(null)
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
  const [helpPanelOpen, setHelpPanelOpen] = useState(false)
  const [showAIGenerator, setShowAIGenerator] = useState(false)
  const [sessionForAI, setSessionForAI] = useState<{ title: string; description: string } | null>(null)

  // Modal form state
  const [modalForm, setModalForm] = useState({
    objectiveText: "",
    cognitive: "",
    knowledge: "",
    successCriteria: [""],
    masteryThreshold: 80,
    requiredForProgression: true,
    aiSuggested: { cognitive: "", knowledge: "", reasoning: "" },
  })

  useEffect(() => {
    fetchObjectives()
  }, [course.id])

  const fetchObjectives = async () => {
    try {
      setLoading(true)

      // Get all sessions for this course
      const { data: classes } = await supabase.from("classes").select("id").eq("course_id", course.id)

      if (!classes || classes.length === 0) {
        setObjectives([])
        return
      }

      const classIds = classes.map((c) => c.id)

      const { data: sessions } = await supabase.from("sessions").select("id").in("class_id", classIds)

      if (!sessions || sessions.length === 0) {
        setObjectives([])
        return
      }

      const sessionIds = sessions.map((s) => s.id)

      const { data, error } = await supabase
        .from("learning_objectives")
        .select("*")
        .in("session_id", sessionIds)
        .order("sequence_order", { ascending: true })

      if (error) throw error
      setObjectives(data || [])
    } catch (error: any) {
      console.error("[v0] Error fetching objectives:", error)
      toast({
        title: t("academic.learningGoals.error"),
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddObjective = () => {
    // Get session info for AI
    const sessionInfo = {
      title: course.title || "New Session",
      description: course.description || "",
    }
    setSessionForAI(sessionInfo)
    setShowAIGenerator(true)
  }

  const handleEditObjective = (objective: LearningObjective) => {
    setEditingObjective(objective)
    setModalForm({
      objectiveText: objective.objective_text,
      cognitive: objective.cognitive_dimension,
      knowledge: objective.knowledge_dimension,
      successCriteria: objective.success_criteria.length > 0 ? objective.success_criteria : [""],
      masteryThreshold: objective.mastery_threshold,
      requiredForProgression: objective.required_for_progression,
      aiSuggested: {
        cognitive: objective.ai_suggested_cognitive || "",
        knowledge: objective.ai_suggested_knowledge || "",
        reasoning: objective.ai_reasoning || "",
      },
    })
    setIsObjectiveModalOpen(true)
  }

  const handleSaveObjective = async () => {
    try {
      // Get first session for this course (or allow user to select)
      const { data: classes } = await supabase.from("classes").select("id").eq("course_id", course.id).limit(1)

      if (!classes || classes.length === 0) {
        toast({
          title: t("academic.learningGoals.error"),
          description: "Please create a class first",
          variant: "destructive",
        })
        return
      }

      const { data: sessions } = await supabase.from("sessions").select("id").eq("class_id", classes[0].id).limit(1)

      if (!sessions || sessions.length === 0) {
        toast({
          title: t("academic.learningGoals.error"),
          description: "Please create a session first",
          variant: "destructive",
        })
        return
      }

      const objectiveData = {
        session_id: sessions[0].id,
        objective_text: modalForm.objectiveText,
        cognitive_dimension: modalForm.cognitive,
        knowledge_dimension: modalForm.knowledge,
        success_criteria: modalForm.successCriteria.filter((c) => c.trim() !== ""),
        mastery_threshold: modalForm.masteryThreshold,
        required_for_progression: modalForm.requiredForProgression,
        ai_confidence_score: 0,
        sequence_order: objectives.length + 1,
        manually_overridden: false,
      }

      if (editingObjective) {
        const { error } = await supabase.from("learning_objectives").update(objectiveData).eq("id", editingObjective.id)

        if (error) throw error

        toast({
          title: t("academic.learningGoals.success"),
          description: t("academic.learningGoals.objectiveUpdated"),
        })
      } else {
        const { error } = await supabase.from("learning_objectives").insert([objectiveData])

        if (error) throw error

        toast({
          title: t("academic.learningGoals.success"),
          description: t("academic.learningGoals.objectiveAdded"),
        })
      }

      setIsObjectiveModalOpen(false)
      fetchObjectives()
    } catch (error: any) {
      console.error("[v0] Error saving objective:", error)
      toast({
        title: t("academic.learningGoals.error"),
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleDeleteObjective = async (id: string) => {
    try {
      const { error } = await supabase.from("learning_objectives").delete().eq("id", id)

      if (error) throw error

      toast({
        title: t("academic.learningGoals.success"),
        description: t("academic.learningGoals.objectiveDeleted"),
      })

      fetchObjectives()
    } catch (error: any) {
      console.error("[v0] Error deleting objective:", error)
      toast({
        title: t("academic.learningGoals.error"),
        description: error.message,
        variant: "destructive",
      })
    }
  }

  // Mock AI classification based on keyword matching
  const handleAIClassify = async () => {
    const text = modalForm.objectiveText.toLowerCase()

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    let cognitive = "understand"
    let knowledge = "conceptual"
    let confidence = 0.72

    // Keyword matching
    if (text.includes("define")) {
      cognitive = "remember"
      knowledge = "factual"
      confidence = 0.88
    } else if (text.includes("explain")) {
      cognitive = "understand"
      knowledge = "conceptual"
      confidence = 0.85
    } else if (text.includes("apply")) {
      cognitive = "apply"
      knowledge = "procedural"
      confidence = 0.92
    } else if (text.includes("analyze")) {
      cognitive = "analyze"
      knowledge = "conceptual"
      confidence = 0.9
    } else if (text.includes("evaluate")) {
      cognitive = "evaluate"
      knowledge = "metacognitive"
      confidence = 0.87
    } else if (text.includes("create")) {
      cognitive = "create"
      knowledge = "conceptual"
      confidence = 0.91
    }

    const mockClassification = {
      cognitive,
      knowledge,
      confidence,
      reasoning: `Based on the verb usage and context, this objective appears to focus on ${cognitive}-level cognitive processes with ${knowledge} knowledge.`,
    }

    setModalForm({
      ...modalForm,
      cognitive_level: cognitive,
      knowledge_dimension: knowledge,
      ai_confidence: confidence,
      aiSuggested: mockClassification,
    })

    toast({
      title: t("academic.learningGoals.aiClassified"),
      description: `Classified as ${cognitive} (${knowledge}) with ${Math.round(confidence * 100)}% confidence`,
    })
  }

  const handleAIObjectivesSelected = (objectives: any[]) => {
    // Convert AI objectives to modal form and open modal for each
    objectives.forEach((obj, index) => {
      setTimeout(() => {
        setModalForm({
          objectiveText: obj.statement,
          cognitive: obj.bloom_cognitive,
          knowledge: obj.bloom_knowledge,
          successCriteria: obj.success_criteria.map((c: any) => c.text),
          masteryThreshold: 80,
          requiredForProgression: true,
          aiSuggested: {
            cognitive: obj.bloom_cognitive,
            knowledge: obj.bloom_knowledge,
            reasoning: obj.reasoning,
          },
        })
        setIsObjectiveModalOpen(true)
      }, index * 100)
    })
    setShowAIGenerator(false)
  }

  const handleManualMode = () => {
    setShowAIGenerator(false)
    setEditingObjective(null)
    setModalForm({
      objectiveText: "",
      cognitive: "",
      knowledge: "",
      successCriteria: [""],
      masteryThreshold: 80,
      requiredForProgression: true,
      aiSuggested: { cognitive: "", knowledge: "", reasoning: "" },
    })
    setIsObjectiveModalOpen(true)
  }

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedCards)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedCards(newExpanded)
  }

  const getConfidenceLevel = (score: number) => {
    if (score >= confidenceConfig.high.threshold) return "high"
    if (score >= confidenceConfig.medium.threshold) return "medium"
    return "low"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <Home className="w-4 h-4" />
        <ChevronRight className="w-4 h-4" />
        <span>Academic Space</span>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900">
          {course.code} : {course.title}
        </span>
        <ChevronRight className="w-4 h-4" />
        <span className="text-purple-600 font-medium">{t("academic.learningGoals.title")}</span>
        <div className="ml-auto">
          <HelpButton language={locale} onClick={() => setHelpPanelOpen(true)} />
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t("academic.learningGoals.title")}</h2>
          <p className="text-gray-600 mt-1">{t("academic.learningGoals.subtitle")}</p>
        </div>
        <Button onClick={handleAddObjective} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          {t("academic.learningGoals.addObjective")}
        </Button>
      </div>

      {/* Objectives List */}
      <div className="space-y-4">
        {objectives.map((objective, index) => {
          const confidenceLevel = getConfidenceLevel(objective.ai_confidence_score)
          const ConfidenceIcon = confidenceConfig[confidenceLevel].icon
          const isExpanded = expandedCards.has(objective.id)

          return (
            <Card key={objective.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex gap-4">
                {/* Drag Handle */}
                <div className="flex-shrink-0 cursor-move text-gray-400 hover:text-gray-600">
                  <GripVertical className="w-5 h-5" />
                </div>

                {/* Sequence Number */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-semibold flex items-center justify-center">
                  {index + 1}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-3">
                  {/* Objective Text */}
                  <p className="text-gray-900 font-medium">{objective.objective_text}</p>

                  {/* Badges Row */}
                  <div className="flex flex-wrap gap-2 items-center">
                    {/* Cognitive Badge */}
                    <Badge
                      className={`border ${cognitiveColors[objective.cognitive_dimension as keyof typeof cognitiveColors] || cognitiveColors.remember}`}
                    >
                      {t(`academic.learningGoals.${objective.cognitive_dimension}`)}
                    </Badge>

                    {/* Knowledge Badge */}
                    <Badge variant="outline" className="border-gray-300">
                      {t(`academic.learningGoals.${objective.knowledge_dimension}`)}
                    </Badge>

                    {/* AI Confidence */}
                    <div className={`flex items-center gap-1 text-sm ${confidenceConfig[confidenceLevel].color}`}>
                      <ConfidenceIcon className="w-4 h-4" />
                      <span className="font-medium">{Math.round(objective.ai_confidence_score * 100)}%</span>
                    </div>
                  </div>

                  {/* Collapsible Success Criteria */}
                  {objective.success_criteria.length > 0 && (
                    <div className="border-t pt-3">
                      <button
                        onClick={() => toggleExpanded(objective.id)}
                        className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        {t("academic.learningGoals.successCriteria")}
                      </button>
                      {isExpanded && (
                        <ul className="mt-2 space-y-1 ml-6 list-disc text-sm text-gray-600">
                          {objective.success_criteria.map((criterion, idx) => (
                            <li key={idx}>{criterion}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {/* Collapsible Mastery Settings */}
                  <div className="border-t pt-3">
                    <button
                      onClick={() => toggleExpanded(`${objective.id}-mastery`)}
                      className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                    >
                      {expandedCards.has(`${objective.id}-mastery`) ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                      {t("academic.learningGoals.masterySettings")}
                    </button>
                    {expandedCards.has(`${objective.id}-mastery`) && (
                      <div className="mt-3 space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">{t("academic.learningGoals.threshold")}:</span>
                          <span className="font-medium">{objective.mastery_threshold}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">{t("academic.learningGoals.required")}:</span>
                          <Badge variant={objective.required_for_progression ? "default" : "outline"}>
                            {objective.required_for_progression ? t("common.yes") : t("common.no")}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex-shrink-0 flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEditObjective(objective)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleAIClassify()}>
                    <Sparkles className="w-4 h-4 text-purple-600" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteObjective(objective.id)}>
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </Card>
          )
        })}

        {objectives.length === 0 && (
          <EmptyStateWithHelp
            section="objectives"
            item="emptyState"
            icon={<Target className="h-12 w-12 text-gray-400" />}
            language={locale}
            primaryAction={{
              label: locale === "fr" ? "Ajouter un Objectif" : locale === "de" ? "Ziel Hinzufügen" : "Add Objective",
              onClick: () => setIsObjectiveModalOpen(true),
            }}
            secondaryAction={{
              label:
                locale === "fr"
                  ? "En savoir plus sur Bloom"
                  : locale === "de"
                    ? "Mehr über Bloom"
                    : "Learn about Bloom's Taxonomy",
              onClick: () => setHelpPanelOpen(true),
            }}
          />
        )}
      </div>

      <Dialog open={showAIGenerator} onOpenChange={setShowAIGenerator}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Create Learning Objective</DialogTitle>
          </DialogHeader>
          {sessionForAI && (
            <AIObjectiveGenerator
              sessionTitle={sessionForAI.title}
              sessionDescription={sessionForAI.description}
              onSelect={handleAIObjectivesSelected}
              onManual={handleManualMode}
              language={locale}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingObjective ? t("academic.learningGoals.editObjective") : t("academic.learningGoals.addObjective")}
            </DialogTitle>
            <DialogDescription>{t("academic.learningGoals.objectiveDescription")}</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="objective" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="objective">{t("academic.learningGoals.objectiveTab")}</TabsTrigger>
              <TabsTrigger value="classification">{t("academic.learningGoals.classificationTab")}</TabsTrigger>
              <TabsTrigger value="criteria">{t("academic.learningGoals.criteriaTab")}</TabsTrigger>
              <TabsTrigger value="mastery">{t("academic.learningGoals.masteryTab")}</TabsTrigger>
              <TabsTrigger value="taxonomy">{t("academic.learningGoals.taxonomyTab")}</TabsTrigger>
            </TabsList>

            {/* Objective Tab */}
            <TabsContent value="objective" className="space-y-4">
              <FieldWithHelp
                label={t("academic.learningGoals.objectiveText")}
                section="objectives"
                item="addObjective"
                language={locale}
                required
              >
                <Textarea
                  value={modalForm.objectiveText}
                  onChange={(e) => setModalForm({ ...modalForm, objectiveText: e.target.value })}
                  placeholder={t("academic.learningGoals.objectivePlaceholder")}
                  rows={4}
                />
              </FieldWithHelp>

              <div className="relative">
                <Button onClick={handleAIClassify} variant="outline" className="w-full bg-transparent">
                  <Sparkles className="w-4 h-4 mr-2" />
                  {t("academic.learningGoals.classifyWithAI")}
                  <HelpTooltip section="objectives" item="classifyAI" language={locale} side="right" />
                </Button>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">{t("academic.learningGoals.examples")}</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• {t("academic.learningGoals.example1")}</li>
                  <li>• {t("academic.learningGoals.example2")}</li>
                  <li>• {t("academic.learningGoals.example3")}</li>
                </ul>
              </div>
            </TabsContent>

            {/* Classification Tab */}
            <TabsContent value="classification" className="space-y-4">
              <p className="text-sm text-gray-600">{t("academic.learningGoals.classificationDesc")}</p>

              {/* Help labels for matrix dimensions */}
              <div className="space-y-2 mb-4">
                <FieldWithHelp
                  label={t("academic.learningGoals.cognitiveDimension")}
                  section="objectives"
                  item="cognitiveLevel"
                  language={locale}
                >
                  <div className="text-sm text-gray-600">
                    {modalForm.cognitive ? t(`academic.learningGoals.${modalForm.cognitive}`) : t("common.notSelected")}
                  </div>
                </FieldWithHelp>

                <FieldWithHelp
                  label={t("academic.learningGoals.knowledgeDimension")}
                  section="objectives"
                  item="knowledgeDimension"
                  language={locale}
                >
                  <div className="text-sm text-gray-600">
                    {modalForm.knowledge ? t(`academic.learningGoals.${modalForm.knowledge}`) : t("common.notSelected")}
                  </div>
                </FieldWithHelp>
              </div>

              {/* Bloom's Taxonomy Matrix */}
              <div className="border rounded-lg overflow-hidden">
                <div className="grid grid-cols-7 text-xs font-medium bg-gray-50">
                  <div className="p-2 border-r border-b"></div>
                  <div className="p-2 border-r border-b text-center">Factual</div>
                  <div className="p-2 border-r border-b text-center">Conceptual</div>
                  <div className="p-2 border-r border-b text-center">Procedural</div>
                  <div className="p-2 border-b text-center">Metacognitive</div>
                </div>

                {["create", "evaluate", "analyze", "apply", "understand", "remember"].map((cognitive) => (
                  <div key={cognitive} className="grid grid-cols-7 text-xs">
                    <div
                      className={`p-2 border-r font-medium ${cognitiveColors[cognitive as keyof typeof cognitiveColors]}`}
                    >
                      {t(`academic.learningGoals.${cognitive}`)}
                    </div>
                    {["factual", "conceptual", "procedural", "metacognitive"].map((knowledge) => {
                      const isSelected = modalForm.cognitive === cognitive && modalForm.knowledge === knowledge
                      const isAISuggested =
                        modalForm.aiSuggested.cognitive === cognitive && modalForm.aiSuggested.knowledge === knowledge

                      return (
                        <button
                          key={knowledge}
                          onClick={() => setModalForm({ ...modalForm, cognitive, knowledge })}
                          className={`p-3 border-r border-t hover:bg-gray-50 transition-colors ${
                            isSelected ? "bg-purple-100 ring-2 ring-purple-500" : ""
                          } ${isAISuggested ? "ring-2 ring-blue-300" : ""}`}
                        >
                          {isSelected && "✓"}
                          {isAISuggested && !isSelected && "🤖"}
                        </button>
                      )
                    })}
                  </div>
                ))}
              </div>

              {modalForm.aiSuggested.reasoning && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">{t("academic.learningGoals.aiReasoning")}</h4>
                  <p className="text-sm text-blue-800">{modalForm.aiSuggested.reasoning}</p>
                </div>
              )}
            </TabsContent>

            {/* Success Criteria Tab */}
            <TabsContent value="criteria" className="space-y-4">
              <FieldWithHelp
                label={t("academic.learningGoals.successCriteria")}
                section="objectives"
                item="successCriteria"
                language={locale}
              >
                <p className="text-sm text-gray-600 mb-4">{t("academic.learningGoals.criteriaDesc")}</p>

                <div className="space-y-3">
                  {modalForm.successCriteria.map((criterion, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={criterion}
                        onChange={(e) => {
                          const newCriteria = [...modalForm.successCriteria]
                          newCriteria[index] = e.target.value
                          setModalForm({ ...modalForm, successCriteria: newCriteria })
                        }}
                        placeholder={t("academic.learningGoals.criterionPlaceholder")}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newCriteria = modalForm.successCriteria.filter((_, i) => i !== index)
                          setModalForm({ ...modalForm, successCriteria: newCriteria })
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button
                  variant="outline"
                  onClick={() =>
                    setModalForm({
                      ...modalForm,
                      successCriteria: [...modalForm.successCriteria, ""],
                    })
                  }
                  className="w-full mt-3"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t("academic.learningGoals.addCriterion")}
                </Button>
              </FieldWithHelp>
            </TabsContent>

            {/* Mastery Tab */}
            <TabsContent value="mastery" className="space-y-6">
              <FieldWithHelp
                label={t("academic.learningGoals.masteryThreshold")}
                section="objectives"
                item="masteryThreshold"
                language={locale}
              >
                <div className="space-y-4">
                  <Slider
                    value={[modalForm.masteryThreshold]}
                    onValueChange={(value) => setModalForm({ ...modalForm, masteryThreshold: value[0] })}
                    min={0}
                    max={100}
                    step={5}
                  />
                  <div className="text-center text-2xl font-bold text-purple-600">{modalForm.masteryThreshold}%</div>
                </div>
              </FieldWithHelp>

              <FieldWithHelp
                label={t("academic.learningGoals.requiredForProgression")}
                section="objectives"
                item="requiredProgression"
                language={locale}
              >
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">{t("academic.learningGoals.requiredDesc")}</p>
                  </div>
                  <Switch
                    checked={modalForm.requiredForProgression}
                    onCheckedChange={(checked) => setModalForm({ ...modalForm, requiredForProgression: checked })}
                  />
                </div>
              </FieldWithHelp>
            </TabsContent>

            {/* Bloom's Taxonomy Tab */}
            <TabsContent value="taxonomy" className="space-y-4">
              <p className="text-sm text-gray-600">{t("academic.learningGoals.taxonomyDesc")}</p>

              <ContextualHelp section="objectives" item="bloomMatrix" language={locale} defaultOpen={true} />

              {/* Bloom's Taxonomy Matrix */}
              <div className="border rounded-lg overflow-hidden">
                <div className="grid grid-cols-7 text-xs font-medium bg-gray-50">
                  <div className="p-2 border-r border-b"></div>
                  <div className="p-2 border-r border-b text-center">Factual</div>
                  <div className="p-2 border-r border-b text-center">Conceptual</div>
                  <div className="p-2 border-r border-b text-center">Procedural</div>
                  <div className="p-2 border-b text-center">Metacognitive</div>
                </div>

                {["create", "evaluate", "analyze", "apply", "understand", "remember"].map((cognitive) => (
                  <div key={cognitive} className="grid grid-cols-7 text-xs">
                    <div
                      className={`p-2 border-r font-medium ${cognitiveColors[cognitive as keyof typeof cognitiveColors]}`}
                    >
                      {t(`academic.learningGoals.${cognitive}`)}
                    </div>
                    {["factual", "conceptual", "procedural", "metacognitive"].map((knowledge) => {
                      const isSelected = modalForm.cognitive === cognitive && modalForm.knowledge === knowledge
                      const isAISuggested =
                        modalForm.aiSuggested.cognitive === cognitive && modalForm.aiSuggested.knowledge === knowledge

                      return (
                        <button
                          key={knowledge}
                          onClick={() => setModalForm({ ...modalForm, cognitive, knowledge })}
                          className={`p-3 border-r border-t hover:bg-gray-50 transition-colors ${
                            isSelected ? "bg-purple-100 ring-2 ring-purple-500" : ""
                          } ${isAISuggested ? "ring-2 ring-blue-300" : ""}`}
                        >
                          {isSelected && "✓"}
                          {isAISuggested && !isSelected && "🤖"}
                        </button>
                      )
                    })}
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleSaveObjective} className="bg-purple-600 hover:bg-purple-700">
              {t("common.save")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Help Panel */}
      <HelpPanel
        isOpen={helpPanelOpen}
        onClose={() => setHelpPanelOpen(false)}
        section="objectives"
        language={locale}
      />
    </div>
  )
}
