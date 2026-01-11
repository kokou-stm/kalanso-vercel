"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  CheckCircle,
  XCircle,
  Clock,
  Trophy,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Upload,
  X,
  Home,
  ChevronRight,
  Info,
  HelpCircle,
  ClockIcon,
  BookOpen,
  MessageCircle,
  BarChart3,
  Target,
  SeparatorVertical as Separator,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card" // Import CardContent
import { cn } from "@/lib/utils"
import { useTranslation } from "@/lib/i18n/use-translation"
import { LanguageSelector } from "@/components/language-selector"
import { SortableItem } from "@/components/sortable-item"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import type {
  AssessmentInterfaceProps,
  QuestionResponse,
  FillBlankResponse,
  OrderingResponse,
  CategorizationResponse, // Added
  ImageUploadResponse, // Added
  AssessmentResult,
  MultipleChoiceSingle,
  TrueFalse,
  ShortAnswer,
  NumericalAnswer,
  FillBlank,
  Ordering,
  Categorization, // Added
  ImageUpload, // Added
} from "@/types/assessment"
import { CategorizationItem } from "@/components/categorization-item"
import { DroppableCategory } from "@/components/droppable-category"
import { createBrowserClient } from "@/lib/supabase/client"

type AssessmentState = "taking" | "feedback" | "results"

// Helper functions for rendering question types and difficulty
const getQuestionTypeLabel = (type: string): string => {
  switch (type) {
    case "multiple_choice_single":
      return "Multiple Choice"
    case "true_false":
      return "True/False"
    case "short_answer":
      return "Short Answer"
    case "numerical":
      return "Numerical"
    case "fill_blank":
      return "Fill in the Blank"
    case "ordering":
      return "Ordering"
    case "categorization":
      return "Categorization"
    case "image_upload":
      return "Image Upload"
    default:
      return "Unknown Type"
  }
}

const getDifficultyColor = (difficulty: string | undefined): string => {
  switch (difficulty) {
    case "easy":
      return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
    case "medium":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
    case "hard":
      return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
  }
}

const formatCellCode = (cellCode: string, t: (key: string) => string): string => {
  // Parse cell code like "3C" into cognitive level (3) and knowledge dimension (C)
  const cognitiveLevel = cellCode.charAt(0)
  const knowledgeDimension = cellCode.charAt(1)

  const cognitiveMap: Record<string, string> = {
    "1": "remember",
    "2": "understand",
    "3": "apply",
    "4": "analyze",
    "5": "evaluate",
    "6": "create",
  }

  const knowledgeMap: Record<string, string> = {
    A: "factual",
    B: "conceptual",
    C: "procedural",
    D: "metacognitive",
  }

  const cognitiveKey = cognitiveMap[cognitiveLevel]
  const knowledgeKey = knowledgeMap[knowledgeDimension]

  if (cognitiveKey && knowledgeKey) {
    const cognitiveName = t(`taxonomy.cognitive.${cognitiveKey}`)
    const knowledgeName = t(`taxonomy.knowledge.${knowledgeKey}`)
    return `${cellCode} - ${cognitiveName} × ${knowledgeName}`
  }

  return cellCode
}

export function AssessmentInterface({
  questions,
  masteryThreshold,
  gloTitle,
  taxonomyCell,
  onComplete,
  onRetake,
}: AssessmentInterfaceProps) {
  const { t, interpolate } = useTranslation()

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [assessmentState, setAssessmentState] = useState<AssessmentState>("taking")
  const [responses, setResponses] = useState<
    (QuestionResponse | FillBlankResponse | OrderingResponse | CategorizationResponse | ImageUploadResponse)[]
  >([]) // Added new response types
  const [currentAnswer, setCurrentAnswer] = useState<string | number | boolean | null>(null)
  const [fillBlankAnswers, setFillBlankAnswers] = useState<{ [blankId: string]: string }>({})
  const [orderedItems, setOrderedItems] = useState<string[]>([])
  const [categorizations, setCategorizations] = useState<{ [itemId: string]: string }>({})
  const [uncategorizedItems, setUncategorizedItems] = useState<string[]>([])
  const [uploadedImages, setUploadedImages] = useState<
    { url: string; filename: string; uploadedAt: string; angle?: string }[]
  >([])
  const [isDraggingFile, setIsDraggingFile] = useState(false)
  const [uploadErrors, setUploadErrors] = useState<string[]>([])
  const [showRubric, setShowRubric] = useState(false)

  const [totalTime, setTotalTime] = useState(0)
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())
  const [showHints, setShowHints] = useState(false)
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set())

  const [sessionProgressId, setSessionProgressId] = useState<string | null>(null)
  const [nextSession, setNextSession] = useState<{ id: string; title: string; session_number: string } | null>(null)
  const [retryAvailableAt, setRetryAvailableAt] = useState<Date | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  const currentQuestion = questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === questions.length - 1

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // Timer effect
  useEffect(() => {
    if (assessmentState === "taking") {
      const interval = setInterval(() => {
        setTotalTime((prev) => prev + 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [assessmentState])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Reset question start time when moving to next question
  useEffect(() => {
    if (assessmentState === "taking") {
      setQuestionStartTime(Date.now())
      setCurrentAnswer(null)
      setShowHints(false)
      setUploadErrors([])

      if (currentQuestion.type === "ordering") {
        const orderingQ = currentQuestion as Ordering
        setOrderedItems(orderingQ.items.map((item) => item.id))
      }
      if (currentQuestion.type === "fill_blank") {
        setFillBlankAnswers({})
      }
      if (currentQuestion.type === "categorization") {
        const categQ = currentQuestion as Categorization
        setUncategorizedItems(categQ.items.map((item) => item.id))
        setCategorizations({})
      }
      if (currentQuestion.type === "image_upload") {
        setUploadedImages([])
        setShowRubric(false)
      }
    }
  }, [currentQuestionIndex, assessmentState, currentQuestion])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const countWords = (text: string) => {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleFileSelect = async (files: FileList, question: ImageUpload) => {
    const newErrors: string[] = []
    const validFiles: File[] = []

    Array.from(files).forEach((file) => {
      // Check count
      if (uploadedImages.length + validFiles.length >= question.maxImages) {
        newErrors.push(
          interpolate(t("imageUpload.errorMaxReached"), {
            max: question.maxImages,
          }),
        )
        return
      }

      // Check format
      const fileExt = file.name.split(".").pop()?.toLowerCase()
      const isValidFormat = question.acceptedFormats.some((format) => format.toLowerCase() === fileExt)

      if (!isValidFormat) {
        newErrors.push(
          interpolate(t("imageUpload.errorInvalidFormat"), {
            filename: file.name,
            formats: question.acceptedFormats.join(", "),
          }),
        )
        return
      }

      // Check size (convert MB to bytes)
      const isValidSize = file.size <= question.maxFileSize * 1024 * 1024

      if (!isValidSize) {
        newErrors.push(
          interpolate(t("imageUpload.errorTooLarge"), {
            filename: file.name,
            size: question.maxFileSize,
          }),
        )
        return
      }

      validFiles.push(file)
    })

    setUploadErrors(newErrors)

    // Convert valid files to base64
    const base64Images = await Promise.all(
      validFiles.map(async (file) => ({
        url: await fileToBase64(file),
        filename: file.name,
        uploadedAt: new Date().toISOString(),
      })),
    )

    setUploadedImages((prev) => [...prev, ...base64Images])
  }

  const handleDrop = (e: React.DragEvent, question: ImageUpload) => {
    e.preventDefault()
    setIsDraggingFile(false)
    const files = e.dataTransfer.files
    handleFileSelect(files, question)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingFile(true)
  }

  const handleDragLeave = () => {
    setIsDraggingFile(false)
  }

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setOrderedItems((items) => {
        const oldIndex = items.indexOf(active.id as string)
        const newIndex = items.indexOf(over.id as string)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const validateAnswer = (): boolean => {
    if (currentQuestion.type === "fill_blank") {
      const question = currentQuestion as FillBlank
      return question.blanks.every((blank) => fillBlankAnswers[blank.id]?.trim().length > 0)
    }

    if (currentQuestion.type === "ordering") {
      return orderedItems.length > 0
    }

    if (currentAnswer === null) return false

    switch (currentQuestion.type) {
      case "short_answer": {
        const question = currentQuestion as ShortAnswer
        const wordCount = countWords(currentAnswer as string)
        if (question.minWords && wordCount < question.minWords) return false
        if (question.maxWords && wordCount > question.maxWords) return false
        return true
      }
      case "numerical": {
        const question = currentQuestion as NumericalAnswer
        const numValue = Number(currentAnswer)
        if (isNaN(numValue)) return false
        if (question.minValue !== undefined && numValue < question.minValue) return false
        if (question.maxValue !== undefined && numValue > question.maxValue) return false
        return true
      }
      default:
        return currentAnswer !== null
    }
  }

  const scoreAnswer = (): { isCorrect: boolean; pointsEarned: number; details?: any } => {
    if (currentQuestion.type === "fill_blank") {
      const question = currentQuestion as FillBlank
      let correctCount = 0

      question.blanks.forEach((blank) => {
        const userAnswer = fillBlankAnswers[blank.id]?.trim() || ""
        const isCorrect = blank.acceptedAnswers.some((accepted) => {
          return blank.caseSensitive ? userAnswer === accepted : userAnswer.toLowerCase() === accepted.toLowerCase()
        })
        if (isCorrect) correctCount++
      })

      const isAllCorrect = correctCount === question.blanks.length
      const pointsEarned = question.blanks.length > 0 ? (correctCount / question.blanks.length) * question.points : 0

      return {
        isCorrect: isAllCorrect,
        pointsEarned,
        details: {
          correctCount,
          totalBlanks: question.blanks.length,
          answers: fillBlankAnswers,
        },
      }
    }

    if (currentQuestion.type === "ordering") {
      const question = currentQuestion as Ordering
      let correctPositions = 0

      orderedItems.forEach((itemId, index) => {
        const item = question.items.find((i) => i.id === itemId)
        if (item && item.correctPosition === index) {
          correctPositions++
        }
      })

      const isAllCorrect = correctPositions === question.items.length
      const pointsEarned =
        question.allowPartialCredit && question.items.length > 0
          ? (correctPositions / question.items.length) * question.points
          : isAllCorrect
            ? question.points
            : 0

      return {
        isCorrect: isAllCorrect,
        pointsEarned,
        details: {
          correctPositions,
          totalItems: question.items.length,
          orderedItems,
        },
      }
    }

    switch (currentQuestion.type) {
      case "multiple_choice_single": {
        const question = currentQuestion as MultipleChoiceSingle
        console.log(
          "[v0] Multiple choice comparison - currentAnswer:",
          currentAnswer,
          "correctAnswer:",
          question.correctAnswer,
          "type of currentAnswer:",
          typeof currentAnswer,
        )
        const isCorrect = Number(currentAnswer) === question.correctAnswer
        return {
          isCorrect,
          pointsEarned: isCorrect ? question.points : 0,
        }
      }
      case "true_false": {
        const question = currentQuestion as TrueFalse
        const isCorrect = currentAnswer === question.correctAnswer
        return {
          isCorrect,
          pointsEarned: isCorrect ? question.points : 0,
        }
      }
      case "short_answer": {
        const question = currentQuestion as ShortAnswer
        // For now, short answers that need manual grading get 0 points
        // In a real system, these would be reviewed by instructors
        return {
          isCorrect: question.autoGrade ? false : false,
          pointsEarned: 0,
        }
      }
      case "numerical": {
        const question = currentQuestion as NumericalAnswer
        const numAnswer = Number(currentAnswer)
        let isCorrect = false

        if (question.tolerance) {
          if (question.toleranceType === "percentage") {
            const tolerance =
              question.correctAnswer !== 0
                ? (Math.abs(question.correctAnswer) * question.tolerance) / 100
                : question.tolerance
            isCorrect = Math.abs(numAnswer - question.correctAnswer) <= tolerance
          } else {
            isCorrect = Math.abs(numAnswer - question.correctAnswer) <= question.tolerance
          }
        } else {
          isCorrect = numAnswer === question.correctAnswer
        }

        return {
          isCorrect,
          pointsEarned: isCorrect ? question.points : 0,
        }
      }
      default:
        return { isCorrect: false, pointsEarned: 0 }
    }
  }

  const handleSubmitAnswer = () => {
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000)

    if (currentQuestion.type === "categorization") {
      const categQ = currentQuestion as Categorization
      const placements = Object.entries(categorizations).map(([itemId, categoryId]) => ({
        itemId,
        categoryId,
      }))

      let correctPlacements = 0
      placements.forEach(({ itemId, categoryId }) => {
        const item = categQ.items.find((i) => i.id === itemId)
        if (item && item.correctCategory === categoryId) {
          correctPlacements++
        }
      })

      const isCorrect = correctPlacements === categQ.items.length
      const pointsEarned =
        categQ.allowPartialCredit && categQ.items.length > 0
          ? (correctPlacements / categQ.items.length) * categQ.points
          : isCorrect
            ? categQ.points
            : 0

      const response: CategorizationResponse = {
        questionId: currentQuestion.id,
        questionType: "categorization",
        placements,
        correctPlacements,
        totalItems: categQ.items.length,
        isCorrect,
        pointsEarned,
        timeSpent,
      }

      setResponses([...responses, response])
    } else if (currentQuestion.type === "image_upload") {
      const imgQ = currentQuestion as ImageUpload

      const response: ImageUploadResponse = {
        questionId: currentQuestion.id,
        questionType: "image_upload",
        uploadedImages,
        requiresCoachReview: true,
        status: "pending_review",
        submittedAt: new Date().toISOString(),
        pointsEarned: 0, // Awaiting coach review
        timeSpent,
      }

      setResponses([...responses, response])
    }

    // If not a categorization or image upload, calculate score as before
    if (currentQuestion.type !== "categorization" && currentQuestion.type !== "image_upload") {
      if (!validateAnswer()) return

      const { isCorrect, pointsEarned, details } = scoreAnswer()

      let response: QuestionResponse | FillBlankResponse | OrderingResponse

      if (currentQuestion.type === "fill_blank") {
        response = {
          questionId: currentQuestion.id,
          questionType: "fill_blank",
          answers: fillBlankAnswers,
          correctCount: details.correctCount,
          totalBlanks: details.totalBlanks,
          isCorrect,
          pointsEarned,
          timeSpent,
        } as FillBlankResponse
      } else if (currentQuestion.type === "ordering") {
        response = {
          questionId: currentQuestion.id,
          questionType: "ordering",
          orderedItems: details.orderedItems,
          correctPositions: details.correctPositions,
          totalItems: details.totalItems,
          isCorrect,
          pointsEarned,
          timeSpent,
        } as OrderingResponse
      } else {
        response = {
          questionId: currentQuestion.id,
          questionType: currentQuestion.type,
          userAnswer: currentAnswer!,
          isCorrect,
          pointsEarned,
          timeSpent,
        } as QuestionResponse
      }

      setResponses([...responses, response])
    }

    setAssessmentState("feedback")
    setShowHints(false)
  }

  const handleContinue = () => {
    if (isLastQuestion) {
      // Calculate results
      const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0)
      const earnedPoints = responses.reduce((sum, r) => sum + (r.pointsEarned || 0), 0)
      const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0

      const result: AssessmentResult = {
        score,
        totalQuestions: questions.length,
        correctAnswers: responses.filter((r) => {
          if (r.questionType === "image_upload") return false // Don't count pending reviews
          return "isCorrect" in r && r.isCorrect
        }).length,
        responses,
        timeTaken: totalTime,
        totalPoints,
        earnedPoints,
        masteryThreshold,
        passed: score >= 70,
        mastered: score >= masteryThreshold,
      }

      saveAssessmentResults(result)

      setAssessmentState("results")
      onComplete(result)
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setAssessmentState("taking")
      setCurrentAnswer(null)
      setFillBlankAnswers({})
      setOrderedItems([])
      setCategorizations({})
      setUncategorizedItems([])
      setUploadedImages([])
      setShowHints(false)
    }
  }

  const canSubmit = () => {
    if (currentQuestion.type === "fill_blank") {
      const fillQ = currentQuestion as FillBlank
      return fillQ.blanks.every((blank) => fillBlankAnswers[blank.id]?.trim())
    }
    if (currentQuestion.type === "ordering") {
      return orderedItems.length > 0
    }
    if (currentQuestion.type === "categorization") {
      const categQ = currentQuestion as Categorization
      return uncategorizedItems.length === 0 && Object.keys(categorizations).length === categQ.items.length
    }
    if (currentQuestion.type === "image_upload") {
      const imgQ = currentQuestion as ImageUpload
      return uploadedImages.length >= imgQ.minImages
    }
    return currentAnswer !== null && currentAnswer !== ""
  }

  const handleCategorizationDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    console.log("[v0] Categorization drag end:", {
      activeId: active.id,
      overId: over?.id,
      categorizations: categorizations,
    })

    if (!over) return

    const itemId = active.id as string
    const targetId = over.id as string

    // Check if dropping on a category
    const categQ = currentQuestion as Categorization
    const isCategory = categQ.categories.some((cat) => cat.id === targetId)

    const targetItem = categQ.items.find((item) => item.id === targetId)
    const targetItemCategory = targetItem ? categorizations[targetItem.id] : null

    console.log("[v0] Drag analysis:", {
      isCategory,
      targetItem: targetItem?.text,
      targetItemCategory,
      isUncategorized: targetId === "uncategorized",
    })

    if (isCategory) {
      // Move from uncategorized to category
      if (uncategorizedItems.includes(itemId)) {
        setUncategorizedItems((prev) => prev.filter((id) => id !== itemId))
        setCategorizations((prev) => ({ ...prev, [itemId]: targetId }))
        console.log("[v0] Moved from uncategorized to category:", targetId)
      }
      // Move between categories
      else {
        setCategorizations((prev) => ({ ...prev, [itemId]: targetId }))
        console.log("[v0] Moved between categories to:", targetId)
      }
    } else if (targetId === "uncategorized") {
      // Move back to uncategorized
      setCategorizations((prev) => {
        const newCat = { ...prev }
        delete newCat[itemId]
        return newCat
      })
      setUncategorizedItems((prev) => [...prev, itemId])
      console.log("[v0] Moved back to uncategorized")
    } else if (targetItemCategory) {
      if (uncategorizedItems.includes(itemId)) {
        setUncategorizedItems((prev) => prev.filter((id) => id !== itemId))
      }
      setCategorizations((prev) => ({ ...prev, [itemId]: targetItemCategory }))
      console.log("[v0] Dropped on item, placed in its category:", targetItemCategory)
    }
  }

  const handleOrderingDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setOrderedItems((items) => {
        const oldIndex = items.indexOf(active.id as string)
        const newIndex = items.indexOf(over.id as string)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const renderQuestionContent = () => {
    // Handle categorization specially
    if (currentQuestion.type === "categorization") {
      const categQ = currentQuestion as Categorization
      const currentResponse = responses.find((r) => r.questionId === currentQuestion.id) as
        | CategorizationResponse
        | undefined
      const showFeedback = assessmentState === "feedback"

      return (
        <div className="space-y-6">
          <p className="text-sm text-gray-600">{t("categorization.instruction")}</p>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCategorizationDragEnd}>
            {/* Uncategorized Items */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-gray-700">{t("categorization.itemsToCategorizee")}</h3>
              <SortableContext items={uncategorizedItems} strategy={verticalListSortingStrategy}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 min-h-[80px] p-4 border-2 border-dashed rounded-lg">
                  {uncategorizedItems.map((itemId) => {
                    const item = categQ.items.find((i) => i.id === itemId)!
                    return <CategorizationItem key={item.id} id={item.id} text={item.text} imageUrl={item.imageUrl} />
                  })}
                  {uncategorizedItems.length === 0 && (
                    <div className="col-span-full text-center text-gray-400 text-sm py-4">All items categorized</div>
                  )}
                </div>
              </SortableContext>
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-gray-700">{t("categorization.categories")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categQ.categories.map((category) => {
                  const itemsInCategory = Object.entries(categorizations)
                    .filter(([_, catId]) => catId === category.id)
                    .map(([itemId]) => itemId)

                  const allCorrect =
                    showFeedback &&
                    itemsInCategory.every((itemId) => {
                      const item = categQ.items.find((i) => i.id === itemId)
                      return item && item.correctCategory === category.id
                    })

                  const hasIncorrect =
                    showFeedback &&
                    itemsInCategory.some((itemId) => {
                      const item = categQ.items.find((i) => i.id === itemId)
                      return item && item.correctCategory !== category.id
                    })

                  return (
                    <DroppableCategory
                      key={category.id}
                      id={category.id}
                      label={category.label}
                      description={category.description}
                      color={category.color}
                      showFeedback={showFeedback}
                      allCorrect={allCorrect && itemsInCategory.length > 0}
                      hasIncorrect={hasIncorrect}
                    >
                      <SortableContext items={itemsInCategory} strategy={verticalListSortingStrategy}>
                        <div className="space-y-2">
                          {itemsInCategory.map((itemId) => {
                            const item = categQ.items.find((i) => i.id === itemId)!
                            const isCorrect = showFeedback && item.correctCategory === category.id
                            return (
                              <CategorizationItem
                                key={item.id}
                                id={item.id}
                                text={item.text}
                                imageUrl={item.imageUrl}
                                isCorrect={isCorrect}
                                showFeedback={showFeedback}
                              />
                            )
                          })}
                          {itemsInCategory.length === 0 && (
                            <div className="text-center text-gray-400 text-sm py-8 border-2 border-dashed rounded">
                              {t("categorization.dropHere")}
                            </div>
                          )}
                        </div>
                      </SortableContext>
                    </DroppableCategory>
                  )
                })}
              </div>
            </div>
          </DndContext>

          {/* Feedback */}
          {showFeedback && currentResponse && (
            <Card className="p-4 space-y-3">
              <div
                className={cn(
                  "flex items-start gap-2",
                  currentResponse.isCorrect ? "text-green-700" : "text-orange-600",
                )}
              >
                {currentResponse.isCorrect ? (
                  <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="font-semibold">
                    {currentResponse.isCorrect ? t("feedback.correct") : t("feedback.partialCredit")}
                  </p>
                  <p className="text-sm">
                    {interpolate(t("points.earned"), {})} {currentResponse.pointsEarned.toFixed(1)}{" "}
                    {interpolate(t("points.outOf"), {})} {currentQuestion.points}
                  </p>
                  <p className="text-sm mt-2">
                    {currentResponse.correctPlacements} {interpolate(t("points.outOf"), {})}{" "}
                    {/* Corrected interpolation */}
                    {currentResponse.totalItems} items correctly categorized
                  </p>
                </div>
              </div>

              {/* Show incorrect placements */}
              {!currentResponse.isCorrect && (
                <div className="mt-3 space-y-2">
                  {categQ.items
                    .filter((item) => {
                      const placement = currentResponse.placements.find((p) => p.itemId === item.id)
                      return placement && placement.categoryId !== item.correctCategory
                    })
                    .map((item) => {
                      const correctCat = categQ.categories.find((c) => c.id === item.correctCategory)
                      return (
                        <div key={item.id} className="text-sm">
                          <span className="font-medium">{item.text}:</span>{" "}
                          {interpolate(t("categorization.correctCategory"), {
                            category: correctCat?.label || "",
                          })}
                        </div>
                      )
                    })}
                </div>
              )}

              {currentQuestion.explanation && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-semibold text-gray-700">{t("feedback.explanation")}</p>
                  <p className="text-sm text-gray-600 mt-1">{currentQuestion.explanation}</p>
                </div>
              )}
            </Card>
          )}
        </div>
      )
    }

    // Handle image upload specially
    if (currentQuestion.type === "image_upload") {
      const imgQ = currentQuestion as ImageUpload
      const currentResponse = responses.find((r) => r.questionId === currentQuestion.id) as
        | ImageUploadResponse
        | undefined
      const showFeedback = assessmentState === "feedback"

      if (showFeedback && currentResponse) {
        return (
          <div className="space-y-6">
            <Card className="p-6 bg-orange-50 border-orange-200">
              <div className="flex items-start gap-3">
                <Clock className="h-6 w-6 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-orange-900">{t("imageUpload.submitted")}</h3>
                  <p className="text-sm text-orange-700 mt-1">{t("imageUpload.reviewMessage")}</p>
                  <p className="text-sm text-orange-600 mt-2">{t("imageUpload.reviewTime")}</p>
                </div>
              </div>
            </Card>

            {/* Show uploaded images */}
            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-3">Submitted Images:</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {currentResponse.uploadedImages.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img.url || "/placeholder.svg"}
                      alt={img.filename}
                      className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <div className="mt-1 text-xs text-gray-600 truncate">{img.filename}</div>
                    {img.angle && <div className="text-xs text-blue-600">{img.angle} ✓</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      }

      return (
        <div className="space-y-6">
          {/* Requirements */}
          <Card className="p-4 border-l-4 border-l-blue-500">
            <h3 className="font-semibold text-sm text-gray-700 mb-2">{t("imageUpload.requirements")}</h3>
            <div className="text-sm text-gray-600 whitespace-pre-line">{imgQ.requirements}</div>

            {imgQ.requiredAngles && (
              <div className="mt-4">
                <p className="font-semibold text-sm text-gray-700 mb-2">{t("imageUpload.requiredAngles")}</p>
                <div className="space-y-1">
                  {imgQ.requiredAngles.map((angle) => {
                    const hasAngle = uploadedImages.some((img) => img.angle === angle)
                    return (
                      <div key={angle} className="text-sm flex items-center gap-2">
                        {hasAngle ? (
                          <span className="text-green-600">
                            {interpolate(t("imageUpload.angleComplete"), { angle })}
                          </span>
                        ) : (
                          <span className="text-gray-500">{interpolate(t("imageUpload.angleNeeded"), { angle })}</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="mt-4 text-xs text-gray-500 space-y-1">
              <div>
                {interpolate(imgQ.minImages === 1 ? t("imageUpload.minImages") : t("imageUpload.minImages_plural"), {
                  count: imgQ.minImages,
                })}
              </div>
              <div>
                {interpolate(imgQ.maxImages === 1 ? t("imageUpload.maxImages") : t("imageUpload.maxImages_plural"), {
                  count: imgQ.maxImages,
                })}
              </div>
              <div>
                {interpolate(t("imageUpload.acceptedFormats"), {
                  formats: imgQ.acceptedFormats.join(", ").toUpperCase(),
                })}
              </div>
              <div>{interpolate(t("imageUpload.maxFileSize"), { size: imgQ.maxFileSize })}</div>
            </div>
          </Card>

          {/* Upload Area */}
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
              isDraggingFile ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400",
              uploadedImages.length >= imgQ.maxImages && "opacity-50 cursor-not-allowed",
            )}
            onDrop={(e) => handleDrop(e, imgQ)}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => {
              if (uploadedImages.length < imgQ.maxImages) {
                document.getElementById("file-input")?.click()
              }
            }}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-600">{t("imageUpload.uploadArea")}</p>
            <input
              id="file-input"
              type="file"
              multiple
              accept={imgQ.acceptedFormats.map((f) => `.${f}`).join(",")}
              className="hidden"
              onChange={(e) => {
                if (e.target.files) {
                  handleFileSelect(e.target.files, imgQ)
                }
              }}
              disabled={uploadedImages.length >= imgQ.maxImages}
            />
          </div>

          {/* Upload Errors */}
          {uploadErrors.length > 0 && (
            <Card className="p-4 bg-red-50 border-red-200">
              <div className="space-y-1">
                {uploadErrors.map((error, index) => (
                  <div key={index} className="text-sm text-red-700 flex items-start gap-2">
                    <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Image Previews */}
          {uploadedImages.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-3">
                {t("imageUpload.uploaded")} ({uploadedImages.length}/{imgQ.maxImages})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {uploadedImages.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img.url || "/placeholder.svg"}
                      alt={img.filename}
                      className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="mt-1 text-xs text-gray-600 truncate">{img.filename}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rubric */}
          <div>
            <button
              onClick={() => setShowRubric(!showRubric)}
              className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              {showRubric ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {showRubric ? t("imageUpload.hideRubric") : t("imageUpload.viewRubric")}
            </button>

            {showRubric && (
              <Card className="mt-3 p-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left pb-2 font-semibold">{t("imageUpload.criterion")}</th>
                      <th className="text-left pb-2 font-semibold">{t("imageUpload.description")}</th>
                      <th className="text-right pb-2 font-semibold">{t("imageUpload.points")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {imgQ.rubric.map((item) => (
                      <tr key={item.id} className="border-b last:border-b-0">
                        <td className="py-2 font-medium">{item.criterion}</td>
                        <td className="py-2 text-gray-600">{item.description}</td>
                        <td className="py-2 text-right">{item.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}
          </div>
        </div>
      )
    }

    // Helper function to render the input for the current question type
    const renderQuestionInput = () => {
      switch (currentQuestion.type) {
        case "multiple_choice_single":
          const mcqQuestion = currentQuestion as MultipleChoiceSingle
          return (
            <div className="space-y-4">
              {Object.entries(mcqQuestion.options).map(([key, value]) => (
                <Card
                  key={key}
                  className={cn(
                    "p-4 cursor-pointer transition-colors",
                    currentAnswer === Number(key) ? "border-blue-500 bg-blue-50" : "hover:bg-gray-100",
                  )}
                  onClick={() => setCurrentAnswer(Number(key))}
                >
                  <p className="font-medium">{value}</p>
                </Card>
              ))}
            </div>
          )
        case "true_false":
          const tfQuestion = currentQuestion as TrueFalse
          return (
            <div className="flex items-center gap-4">
              <Button
                variant={currentAnswer === true ? "default" : "outline"}
                onClick={() => setCurrentAnswer(true)}
                className="px-8 py-3 text-lg"
              >
                {t("trueFalse.true")}
              </Button>
              <Button
                variant={currentAnswer === false ? "default" : "outline"}
                onClick={() => setCurrentAnswer(false)}
                className="px-8 py-3 text-lg"
              >
                {t("trueFalse.false")}
              </Button>
            </div>
          )
        case "short_answer":
          const saQuestion = currentQuestion as ShortAnswer
          return (
            <div className="space-y-2">
              <textarea
                value={(currentAnswer as string) || ""}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder={t("placeholder.enterAnswer")}
                rows={saQuestion.rows || 4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700"
              />
              {(saQuestion.minWords || saQuestion.maxWords) && (
                <p className="text-sm text-gray-500">
                  {saQuestion.minWords && `${saQuestion.minWords} ${t("words")}`}
                  {saQuestion.minWords && saQuestion.maxWords && " - "}
                  {saQuestion.maxWords && `${saQuestion.maxWords} ${t("words")}`}
                  {t("words.required")}
                </p>
              )}
            </div>
          )
        case "numerical":
          const numQuestion = currentQuestion as NumericalAnswer
          return (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={currentAnswer === null ? "" : currentAnswer}
                onChange={(e) => setCurrentAnswer(Number(e.target.value))}
                placeholder={t("placeholder.enterNumber")}
                className="p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 w-64 dark:bg-gray-800 dark:border-gray-700"
              />
              {numQuestion.unit && <span className="text-gray-600 dark:text-gray-400">{numQuestion.unit}</span>}
              {(numQuestion.minValue !== undefined || numQuestion.maxValue !== undefined) && (
                <p className="text-sm text-gray-500">
                  {numQuestion.minValue !== undefined && `Min: ${numQuestion.minValue}`}
                  {numQuestion.minValue !== undefined && numQuestion.maxValue !== undefined && " | "}
                  {numQuestion.maxValue !== undefined && `Max: ${numQuestion.maxValue}`}
                </p>
              )}
            </div>
          )
        case "fill_blank":
          const fbQuestion = currentQuestion as FillBlank
          return (
            <div className="space-y-3">
              {fbQuestion.template.split(/(__\d+__)/).map((part, index) => {
                const match = part.match(/^__(\d+)__$/)
                if (match) {
                  const blankId = match[1]
                  const blank = fbQuestion.blanks.find((b) => b.id === blankId)
                  if (!blank) return null
                  return (
                    <input
                      key={blank.id}
                      type="text"
                      value={fillBlankAnswers[blank.id] || ""}
                      onChange={(e) => setFillBlankAnswers({ ...fillBlankAnswers, [blank.id]: e.target.value })}
                      placeholder={blank.placeholder || t("placeholder.fillBlank")}
                      className="p-2 border-b-2 border-gray-300 focus:border-blue-500 outline-none w-32 dark:bg-gray-800 dark:border-gray-700"
                    />
                  )
                }
                return <span key={index}>{part}</span>
              })}
            </div>
          )
        case "ordering":
          return (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleOrderingDragEnd}>
              <SortableContext items={orderedItems} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {orderedItems.map((itemId, index) => {
                    const item = (currentQuestion as Ordering).items.find((i) => i.id === itemId)
                    if (!item) return null
                    return <SortableItem key={itemId} id={itemId} text={item.text} index={index} />
                  })}
                </div>
              </SortableContext>
            </DndContext>
          )
        // Categorization and Image Upload are handled in renderQuestionContent
        default:
          return null
      }
    }

    return renderQuestionInput()
  }

  // Helper functions to display user and correct answers in feedback/results
  const getUserAnswerDisplay = () => {
    const lastResponse = responses[responses.length - 1] // Ensure lastResponse is defined here
    if (!lastResponse) return ""

    switch (currentQuestion.type) {
      case "multiple_choice_single":
        const mcqQuestion = currentQuestion as MultipleChoiceSingle
        return mcqQuestion.options[lastResponse.userAnswer as string] || t("feedback.noAnswer")
      case "true_false":
        return lastResponse.userAnswer === true
          ? t("trueFalse.true")
          : lastResponse.userAnswer === false
            ? t("trueFalse.false")
            : t("feedback.noAnswer")
      case "numerical":
        return (
          `${lastResponse.userAnswer}${(currentQuestion as NumericalAnswer).unit ? " " + (currentQuestion as NumericalAnswer).unit : ""}` ||
          t("feedback.noAnswer")
        )
      case "short_answer":
        return (lastResponse.userAnswer as string) || t("feedback.noAnswer")
      case "fill_blank":
        return Object.values((lastResponse as FillBlankResponse).answers).join(", ") || t("feedback.noAnswer")
      case "ordering":
        return (lastResponse as OrderingResponse).orderedItems.join(", ") || t("feedback.noAnswer")
      case "categorization":
        const catQuestion = currentQuestion as Categorization
        const catResponse = lastResponse as CategorizationResponse
        return (
          catResponse.placements
            .map(({ itemId, categoryId }) => {
              const item = catQuestion.items.find((i) => i.id === itemId)
              const category = catQuestion.categories.find((c) => c.id === categoryId)
              return `${item?.text} -> ${category?.label}`
            })
            .join(", ") || t("feedback.noAnswer")
        )
      case "image_upload":
        return t("imageUpload.submitted")
      default:
        return String(lastResponse.userAnswer) || t("feedback.noAnswer")
    }
  }

  const getCorrectAnswerDisplay = () => {
    switch (currentQuestion.type) {
      case "multiple_choice_single":
        const mcqQuestion = currentQuestion as MultipleChoiceSingle
        return mcqQuestion.options[mcqQuestion.correctAnswer] || t("feedback.noCorrectAnswer")
      case "true_false":
        const tfQuestion = currentQuestion as TrueFalse
        return tfQuestion.correctAnswer ? t("trueFalse.true") : t("trueFalse.false")
      case "numerical":
        const numQuestion = currentQuestion as NumericalAnswer
        return `${numQuestion.correctAnswer}${numQuestion.unit ? " " + numQuestion.unit : ""}`
      case "short_answer":
        const saQuestion = currentQuestion as ShortAnswer
        return saQuestion.sampleAnswer || t("feedback.explanationAvailable")
      case "fill_blank":
        const fbQuestion = currentQuestion as FillBlank
        return fbQuestion.blanks.map((b) => b.acceptedAnswers[0]).join(", ")
      case "ordering":
        const ordQuestion = currentQuestion as Ordering
        return ordQuestion.items
          .sort((a, b) => a.correctPosition - b.correctPosition)
          .map((i) => i.text)
          .join(", ")
      case "categorization":
        const categQuestion = currentQuestion as Categorization
        return categQuestion.items
          .map((item) => {
            const correctCat = categQuestion.categories.find((c) => c.id === item.correctCategory)
            return `${item?.text} -> ${correctCat?.label}`
          })
          .join(", ")
      default:
        return t("feedback.noCorrectAnswer")
    }
  }

  // State 1: Taking Assessment
  if (assessmentState === "taking") {
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-end mb-6">
            <LanguageSelector />
          </div>

          <div className="flex gap-6">
            {/* Main Content Area */}
            <div className="flex-1 overflow-auto">
              {" "}
              {/* Added overflow-auto */}
              <Card className="max-w-4xl mx-auto">
                <CardContent className="p-8">
                  {/* Progress Section */}
                  <div className="space-y-4 mb-6">
                    {" "}
                    {/* Added mb-6 */}
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold">
                        {interpolate(t("questionOf"), { current: currentQuestionIndex + 1, total: questions.length })}
                      </span>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Clock className="w-5 h-5" />
                        <span className="font-mono">{formatTime(totalTime)}</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-blue-500 h-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Question Card */}
                  <div className="space-y-6">
                    {" "}
                    {/* Removed Card wrapper */}
                    {/* Question Header */}
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium dark:bg-blue-900 dark:text-blue-300">
                          {t(`questionTypes.${currentQuestion.type}`)}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-medium dark:bg-purple-900 dark:text-purple-300">
                          {formatCellCode(currentQuestion.cellCode, t)}
                        </span>
                        {currentQuestion.difficulty && (
                          <span
                            className={cn(
                              "px-3 py-1 rounded-full text-sm font-medium capitalize",
                              getDifficultyColor(currentQuestion.difficulty),
                            )}
                          >
                            {t(`difficulty.${currentQuestion.difficulty}`)}
                          </span>
                        )}
                        <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-medium dark:bg-gray-800 dark:text-gray-300">
                          {currentQuestion.points === 1
                            ? interpolate(t("points.worth"), { count: currentQuestion.points })
                            : interpolate(t("points.worth_plural"), { count: currentQuestion.points })}
                        </span>
                      </div>

                      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {currentQuestion.question}
                      </h2>
                    </div>
                    {/* Answer Input */}
                    <div className="py-6">{renderQuestionContent()}</div>
                    {/* Hints */}
                    {currentQuestion.hints && currentQuestion.hints.length > 0 && (
                      <div>
                        <Button variant="outline" size="sm" onClick={() => setShowHints(!showHints)} className="gap-2">
                          {showHints ? (
                            <>
                              <ChevronUp className="w-4 h-4" />
                              {t("actions.hideHints")}
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-4 h-4" />
                              {t("actions.showHints")}
                            </>
                          )}
                        </Button>
                        {showHints && (
                          <div className="mt-3 p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                            <ul className="space-y-2">
                              {currentQuestion.hints.map((hint, index) => (
                                <li key={index} className="text-sm text-amber-800 dark:text-amber-200">
                                  💡 {hint}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                    {/* Submit Button */}
                    <Button onClick={handleSubmitAnswer} disabled={!canSubmit()} size="lg" className="w-full">
                      {t("actions.submitAnswer")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Removed the unused div for QuestionCellIndicator */}
          </div>
        </div>
      </div>
    )
  }

  // State 2: Question Feedback
  if (assessmentState === "feedback") {
    const lastResponse = responses[responses.length - 1]
    const isPartialCredit =
      (lastResponse as FillBlankResponse).correctCount !== undefined ||
      (lastResponse as OrderingResponse).correctPositions !== undefined ||
      (lastResponse as CategorizationResponse).correctPlacements !== undefined

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Result Icon and Message */}
          <div className="text-center space-y-4">
            {lastResponse.isCorrect ? (
              <>
                <CheckCircle className="w-20 h-20 mx-auto text-green-500" />
                <Card className="p-6 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                  <h2 className="text-2xl font-bold text-green-700 dark:text-green-300">{t("feedback.correct")}</h2>
                </Card>
              </>
            ) : isPartialCredit && lastResponse.pointsEarned > 0 ? (
              <>
                <AlertCircle className="w-20 h-20 mx-auto text-orange-500" />
                <Card className="p-6 bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800">
                  <h2 className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                    {t("feedback.partialCredit")}
                  </h2>
                </Card>
              </>
            ) : (
              <>
                <XCircle className="w-20 h-20 mx-auto text-red-500" />
                <Card className="p-6 bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800">
                  <h2 className="text-2xl font-bold text-orange-700 dark:text-orange-300">{t("feedback.incorrect")}</h2>
                </Card>
              </>
            )}
          </div>

          {/* Answer Summary */}
          {currentQuestion.type === "fill_blank" && (
            <Card className="p-6 space-y-4">
              <h3 className="font-semibold text-lg">{t("fillBlank.instruction")}</h3>
              <div className="space-y-3">
                {(currentQuestion as FillBlank).blanks.map((blank) => {
                  const userAnswer = (lastResponse as FillBlankResponse).answers[blank.id]
                  const isCorrect = blank.acceptedAnswers.some((accepted) =>
                    blank.caseSensitive
                      ? userAnswer === accepted
                      : userAnswer?.toLowerCase() === accepted.toLowerCase(),
                  )

                  return (
                    <div
                      key={blank.id}
                      className={cn(
                        "p-3 rounded-lg border-2",
                        isCorrect
                          ? "border-green-500 bg-green-50 dark:bg-green-950"
                          : "border-red-500 bg-red-50 dark:bg-red-950",
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {isCorrect ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                        <span className="font-semibold text-sm">{t("fillBlank.blank", { number: blank.id })}</span>
                      </div>
                      <p className="text-sm">
                        <span className="font-medium">{t("feedback.yourAnswer")}</span> {userAnswer}
                      </p>
                      {!isCorrect && (
                        <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                          <span className="font-medium">{t("feedback.correctAnswer")}</span> {blank.acceptedAnswers[0]}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
              <p className="text-center text-lg">
                {(lastResponse as FillBlankResponse).correctCount} / {(lastResponse as FillBlankResponse).totalBlanks}{" "}
                {t("fillBlank.correct").toLowerCase()}
              </p>
            </Card>
          )}

          {currentQuestion.type === "ordering" && (
            <Card className="p-6 space-y-4">
              <h3 className="font-semibold text-lg">{t("ordering.yourOrder")}</h3>
              <div className="space-y-3">
                {(lastResponse as OrderingResponse).orderedItems.map((itemId, index) => {
                  const item = (currentQuestion as Ordering).items.find((i) => i.id === itemId)
                  if (!item) return null
                  const isCorrect = item.correctPosition === index

                  return (
                    <SortableItem
                      key={itemId}
                      id={itemId}
                      text={item.text}
                      index={index}
                      isCorrect={isCorrect}
                      showFeedback={true}
                    />
                  )
                })}
              </div>
              <p className="text-center text-lg">
                {(lastResponse as OrderingResponse).correctPositions} / {(lastResponse as OrderingResponse).totalItems}{" "}
                {t("ordering.instruction").toLowerCase().includes("correct")
                  ? "correct positions"
                  : "in correct positions"}
              </p>
            </Card>
          )}

          {currentQuestion.type === "categorization" && (
            <Card className="p-6 space-y-4">
              <h3 className="font-semibold text-lg">{t("categorization.yourCategorization")}</h3>
              <div className="space-y-3">
                {(currentQuestion as Categorization).categories.map((category) => {
                  const itemsInThisCategory = (lastResponse as CategorizationResponse).placements.filter(
                    (p) => p.categoryId === category.id,
                  )

                  return (
                    <div key={category.id}>
                      <h4 className="font-semibold mb-2">{category.label}</h4>
                      <div className="border rounded-lg p-3 space-y-2">
                        {itemsInThisCategory.length > 0 ? (
                          itemsInThisCategory.map(({ itemId }) => {
                            const item = (currentQuestion as Categorization).items.find((i) => i.id === itemId)
                            const isCorrect = item?.correctCategory === category.id

                            return (
                              <CategorizationItem
                                key={itemId}
                                id={itemId}
                                text={item!.text}
                                imageUrl={item!.imageUrl}
                                isCorrect={isCorrect}
                                showFeedback={true}
                              />
                            )
                          })
                        ) : (
                          <p className="text-sm text-gray-400 text-center">No items in this category</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              <p className="text-center text-lg">
                {(lastResponse as CategorizationResponse).correctPlacements} /{" "}
                {(lastResponse as CategorizationResponse).totalItems} {t("categorization.correctlyCategorized")}
              </p>
            </Card>
          )}

          {currentQuestion.type === "image_upload" && (
            <Card className="p-6 space-y-4">
              <h3 className="font-semibold text-lg">{t("imageUpload.yourSubmission")}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {(lastResponse as ImageUploadResponse).uploadedImages.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img.url || "/placeholder.svg"}
                      alt={img.filename}
                      className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <div className="mt-1 text-xs text-gray-600 truncate">{img.filename}</div>
                    {img.angle && <div className="text-xs text-blue-600">{img.angle} ✓</div>}
                  </div>
                ))}
              </div>
              <p className="text-center text-sm text-orange-600">{t("imageUpload.pendingReviewMessage")}</p>
            </Card>
          )}

          {currentQuestion.type !== "fill_blank" &&
            currentQuestion.type !== "ordering" &&
            currentQuestion.type !== "categorization" &&
            currentQuestion.type !== "image_upload" && (
              <Card className="p-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">{t("feedback.yourAnswer")}</h3>
                  <p className="text-lg">{getUserAnswerDisplay()}</p>
                </div>

                {!lastResponse.isCorrect && (
                  <div>
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t("feedback.correctAnswer")}
                    </h3>
                    <p className="text-lg text-green-600 dark:text-green-400">{getCorrectAnswerDisplay()}</p>
                  </div>
                )}
              </Card>
            )}

          {/* Explanation */}
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-3">{t("feedback.explanation")}</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{currentQuestion.explanation}</p>
          </Card>

          {/* Points Display */}
          <Card className="p-6 text-center">
            <p className="text-lg">
              {t("points.earned")}{" "}
              <span className="font-bold text-2xl text-blue-600 dark:text-blue-400">
                {isNaN(lastResponse?.pointsEarned || 0) ? 0 : (lastResponse?.pointsEarned || 0).toFixed(1)}
              </span>{" "}
              {t("points.outOf")} {currentQuestion.points}
            </p>
          </Card>

          {/* Continue Button */}
          <Button onClick={handleContinue} size="lg" className="w-full">
            {isLastQuestion ? t("actions.seeResults") : t("actions.continue")}
          </Button>
        </div>
      </div>
    )
  }

  // State 3: Final Results
  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0)
  const earnedPoints = responses.reduce((sum, r) => sum + (r.pointsEarned || 0), 0)
  const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0
  const correctCount = responses.filter((r) => {
    if (r.questionType === "image_upload") return false
    return "isCorrect" in r && r.isCorrect
  }).length
  const avgTimePerQuestion = questions.length > 0 ? Math.floor(totalTime / questions.length) : 0

  const mastered = score >= masteryThreshold
  const passed = score >= 70

  const canRetry = () => {
    if (!retryAvailableAt) return true
    return currentTime >= retryAvailableAt
  }

  const getRetryCountdown = () => {
    if (!retryAvailableAt) return ""

    const diff = retryAvailableAt.getTime() - currentTime.getTime()
    if (diff <= 0) return "Available now"

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    return `${hours}h ${minutes}m ${seconds}s`
  }

  const retryAvailable = canRetry()
  const retryCountdown = getRetryCountdown()

  const saveAssessmentResults = async (result: AssessmentResult) => {
    console.log("[v0] Saving assessment results to Supabase")
    const supabase = createBrowserClient()

    try {
      // Mock student_id and session_id - replace with actual values from props/context
      const studentId = "mock-student-uuid"
      const sessionId = "mock-session-uuid"

      // Update or insert student_session_progress
      const { data: existingProgress } = await supabase
        .from("student_session_progress")
        .select("*")
        .eq("student_id", studentId)
        .eq("session_id", sessionId)
        .single()

      const progressData = {
        student_id: studentId,
        session_id: sessionId,
        status: result.mastered ? "mastered" : result.passed ? "completed" : "current",
        mastery_score: Math.round(result.score),
        attempts: (existingProgress?.attempts || 0) + 1,
        last_attempt_at: new Date().toISOString(),
        completed_at: result.mastered ? new Date().toISOString() : null,
      }

      if (existingProgress) {
        const { data, error } = await supabase
          .from("student_session_progress")
          .update(progressData)
          .eq("id", existingProgress.id)
          .select()
          .single()

        if (error) throw error
        setSessionProgressId(data.id)
      } else {
        const { data, error } = await supabase.from("student_session_progress").insert([progressData]).select().single()

        if (error) throw error
        setSessionProgressId(data.id)
      }

      // If mastered, find and unlock next session
      if (result.mastered) {
        await fetchNextSession(sessionId)
      }

      // Set retry availability (24 hours from now if not mastered)
      if (!result.mastered) {
        const retryDate = new Date()
        retryDate.setHours(retryDate.getHours() + 24)
        setRetryAvailableAt(retryDate)
      }

      console.log("[v0] Assessment results saved successfully")
    } catch (error) {
      console.error("[v0] Error saving assessment results:", error)
    }
  }

  const fetchNextSession = async (currentSessionId: string) => {
    console.log("[v0] Fetching next session")
    const supabase = createBrowserClient()

    try {
      // Get current session details
      const { data: currentSession } = await supabase
        .from("sessions")
        .select("class_id, sequence_order")
        .eq("id", currentSessionId)
        .single()

      if (!currentSession) return

      // Find next session in sequence
      const { data: nextSessionData, error } = await supabase
        .from("sessions")
        .select("id, title, session_number")
        .eq("class_id", currentSession.class_id)
        .gt("sequence_order", currentSession.sequence_order)
        .order("sequence_order", { ascending: true })
        .limit(1)
        .single()

      if (error) {
        console.log("[v0] No next session found")
        return
      }

      setNextSession(nextSessionData)
      console.log("[v0] Next session found:", nextSessionData.title)
    } catch (error) {
      console.error("[v0] Error fetching next session:", error)
    }
  }

  const toggleResultExpanded = (questionId: string) => {
    const newExpanded = new Set(expandedResults)
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId)
    } else {
      newExpanded.add(questionId)
    }
    setExpandedResults(newExpanded)
  }

  // State 3: Final Results
  if (assessmentState === "results") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <button
              onClick={() => onRetake?.()}
              className="hover:text-gray-900 dark:hover:text-gray-100 flex items-center gap-1"
            >
              <Home className="w-4 h-4" />
              My Courses
            </button>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 dark:text-gray-100">{gloTitle}</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 dark:text-gray-100">Assessment</span>
          </nav>

          {/* Assessment Info Card */}
          <Card className="p-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-4">
              <Info className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold text-lg text-blue-900 dark:text-blue-100">{gloTitle}</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Assessment for Bloom's Taxonomy Cell: {formatCellCode(taxonomyCell, t)}
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-blue-600 dark:text-blue-400 mt-3">
                  <div className="flex items-center gap-1">
                    <ClockIcon className="w-4 h-4" />
                    <span>Completed: {new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Trophy className="w-4 h-4" />
                    <span>Attempt #{sessionProgressId ? 1 : 1}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Main Results Card - Enhanced for not mastered state */}
          {!mastered ? (
            <Card className="p-8 border-2 border-gray-200 dark:border-gray-700">
              <div className="text-center space-y-6">
                {/* Header */}
                <div>
                  <h1 className="text-2xl font-bold mb-2">📊 Assessment Complete</h1>
                  <h2 className="text-xl text-gray-700 dark:text-gray-300">{gloTitle}</h2>
                </div>

                {/* Score Display */}
                <div className="py-4 space-y-2">
                  <div className="text-5xl font-bold text-gray-900 dark:text-gray-100">
                    {Math.round(score)}% ({correctCount}/{questions.length} correct)
                  </div>
                  <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>Time Taken: {formatTime(totalTime)}</span>
                  </div>
                </div>

                {/* Mastery Threshold */}
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>Mastery Threshold: {masteryThreshold}%</p>
                </div>

                <Separator />

                {/* Not Yet Mastered Message */}
                <div className="py-4 space-y-3">
                  <div className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded-full font-semibold inline-flex mx-auto">
                    <AlertCircle className="w-6 h-6" />
                    ⚠️ Not Yet Mastered
                  </div>

                  <div className="text-gray-700 dark:text-gray-300 space-y-2 max-w-lg mx-auto">
                    <p>Don't worry - this is a learning opportunity!</p>
                    <p className="text-sm">Most students need multiple attempts to master complex topics like this.</p>
                  </div>

                  {/* Attempts Remaining */}
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Attempts remaining: 2</div>
                </div>

                <Separator />

                {/* Action Buttons */}
                <div className="space-y-3 pt-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Next Steps:</h3>

                  <div className="flex flex-col gap-3 max-w-md mx-auto">
                    <Button
                      onClick={() => {
                        // Scroll to detailed results below
                        document.getElementById("detailed-results")?.scrollIntoView({ behavior: "smooth" })
                      }}
                      variant="default"
                      size="lg"
                      className="w-full"
                    >
                      <BarChart3 className="w-5 h-5 mr-2" />📊 View Detailed Results
                    </Button>

                    <Button
                      onClick={() => {
                        // TODO: Navigate to learning plan
                        console.log("[v0] Get Personalized Learning Plan clicked")
                      }}
                      variant="outline"
                      size="lg"
                      className="w-full"
                    >
                      <Target className="w-5 h-5 mr-2" />🎯 Get Personalized Learning Plan
                    </Button>

                    <Button
                      onClick={() => {
                        // TODO: Open coach messaging
                        console.log("[v0] Message Coach clicked")
                      }}
                      variant="outline"
                      size="lg"
                      className="w-full"
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />💬 Message Coach
                    </Button>
                  </div>
                </div>

                {/* Coach Notification */}
                <div className="pt-4">
                  <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-blue-700 dark:text-blue-300 text-left">
                        ℹ️ Your coach has been notified and may reach out with additional support.
                      </p>
                    </div>
                  </Card>
                </div>
              </div>
            </Card>
          ) : (
            /* Original mastered/passed design */
            <>
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">{t("results.title")}</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {mastered
                    ? t("results.masteredMessage")
                    : passed
                      ? t("results.passedMessage")
                      : t("results.notPassedMessage")}
                </p>
              </div>

              <Card className="p-8 text-center space-y-4">
                <div className="text-6xl font-bold text-blue-600 dark:text-blue-400">{Math.round(score)}%</div>
                <p className="text-xl text-gray-700 dark:text-gray-300">
                  {correctCount} / {questions.length} {t("results.correct").toLowerCase()}
                </p>

                <div className="flex justify-center pt-4">
                  <div className="flex items-center gap-2 px-6 py-3 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full font-semibold">
                    <Trophy className="w-6 h-6" />
                    {t("results.mastered")}
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    You scored {Math.round(score)}%. {t("results.masteryThreshold")} is {masteryThreshold}%.
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden relative">
                    <div
                      className="h-full transition-all duration-500 bg-green-500"
                      style={{ width: `${Math.min(score, 100)}%` }}
                    />
                    <div
                      className="absolute h-4 w-1 bg-gray-800 dark:bg-gray-200"
                      style={{ left: `${masteryThreshold}%`, marginTop: "-1rem" }}
                    />
                  </div>
                </div>
              </Card>
            </>
          )}

          {/* Detailed Results Section */}
          <div id="detailed-results">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Objectives Mastered */}
              <Card className="p-6 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Objectives Mastered
                </h3>
                <ul className="space-y-2">
                  {questions
                    .filter((_, i) => responses[i]?.isCorrect)
                    .slice(0, 3)
                    .map((q, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-green-700 dark:text-green-300">
                        <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>{q.question}</span>
                      </li>
                    ))}
                  {questions.filter((_, i) => responses[i]?.isCorrect).length === 0 && (
                    <li className="text-sm text-green-700 dark:text-green-300">No objectives mastered yet</li>
                  )}
                </ul>
              </Card>

              {/* Objectives to Improve */}
              <Card className="p-6 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Objectives to Improve
                </h3>
                <ul className="space-y-2">
                  {questions
                    .filter((_, i) => !responses[i]?.isCorrect)
                    .slice(0, 3)
                    .map((q, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-yellow-700 dark:text-yellow-300">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>{q.question}</span>
                      </li>
                    ))}
                  {questions.filter((_, i) => !responses[i]?.isCorrect).length === 0 && (
                    <li className="text-sm text-yellow-700 dark:text-yellow-300">All objectives mastered!</li>
                  )}
                </ul>
              </Card>
            </div>

            {/* Statistics Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="p-6 text-center space-y-2">
                <h3 className="font-semibold text-gray-700 dark:text-gray-300">{t("results.finalScore")}</h3>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{Math.round(score)}%</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {earnedPoints.toFixed(1)} / {totalPoints} {totalPoints === 1 ? t("points.point") : t("points.points")}
                </p>
              </Card>

              <Card className="p-6 text-center space-y-2">
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center justify-center gap-2">
                  <Clock className="w-5 h-5" />
                  {t("results.totalTime")}
                </h3>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{formatTime(totalTime)}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Avg: {formatTime(avgTimePerQuestion)} per question
                </p>
              </Card>

              <Card className="p-6 text-center space-y-2">
                <h3 className="font-semibold text-gray-700 dark:text-gray-300">{t("results.performance")}</h3>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {correctCount} / {questions.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {Math.round((correctCount / questions.length) * 100)}% correct
                </p>
              </Card>
            </div>
          </div>

          <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-xl mb-4 text-blue-900 dark:text-blue-100">What's Next?</h3>
            {mastered ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Trophy className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <p className="text-green-900 dark:text-green-100 font-medium mb-2">
                      Great job! You've mastered this content.
                    </p>
                    {nextSession ? (
                      <>
                        <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                          Ready to continue? Next up:{" "}
                          <strong>
                            {nextSession.session_number}: {nextSession.title}
                          </strong>
                        </p>
                        <Button className="bg-green-600 hover:bg-green-700 text-white">
                          Continue to Next Session →
                        </Button>
                      </>
                    ) : (
                      <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                        You've completed all sessions in this class!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <ClockIcon className="w-6 h-6 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <p className="text-orange-900 dark:text-orange-100 font-medium mb-2">
                      You can retry this assessment to improve your score
                    </p>
                    {retryAvailable ? (
                      <>
                        <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                          You can retry this assessment now
                        </p>
                        <div className="flex gap-2">
                          <Button onClick={onRetake} className="bg-orange-600 hover:bg-orange-700 text-white">
                            Retry Assessment
                          </Button>
                          <Button variant="outline">Review Content</Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                          You can retry in:{" "}
                          <strong className="text-orange-700 dark:text-orange-300 font-mono">{retryCountdown}</strong>
                        </p>
                        <div className="flex gap-2">
                          <Button variant="outline" disabled>
                            Retry Assessment
                          </Button>
                          <Button variant="outline">Review Content</Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Question Breakdown */}
          <Card className="p-6">
            <h3 className="font-semibold text-xl mb-4">{t("results.questionBreakdown")}</h3>
            <div className="space-y-3">
              {questions.map((question, index) => {
                const response = responses[index]
                const isExpanded = expandedResults.has(question.id)

                return (
                  <div
                    key={question.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => toggleResultExpanded(question.id)}
                      className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                    >
                      <div className="flex items-center gap-3 text-left flex-1">
                        {response.isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium">
                            Question {index + 1}: {question.question}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {response.pointsEarned} / {question.points}{" "}
                            {question.points === 1 ? t("points.point") : t("points.points")}
                          </p>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 space-y-3">
                        {question.type !== "image_upload" && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              {t("review.yourAnswerLabel")}:
                            </p>
                            <p className="text-sm">
                              {typeof response.userAnswer === "boolean"
                                ? response.userAnswer
                                  ? t("trueFalse.true")
                                  : t("trueFalse.false")
                                : response.questionType === "fill_blank"
                                  ? Object.values((response as FillBlankResponse).answers).join(", ")
                                  : response.questionType === "ordering"
                                    ? (response as OrderingResponse).orderedItems.join(", ")
                                    : response.questionType === "categorization"
                                      ? Object.entries((response as CategorizationResponse).placements)
                                          .map(([itemId, categoryId]) => {
                                            const item = (question as Categorization).items.find((i) => i.id === itemId)
                                            const category = (question as Categorization).categories.find(
                                              (c) => c.id === categoryId,
                                            )
                                            return `${item?.text} -> ${category?.label}`
                                          })
                                          .join(", ")
                                      : String(response.userAnswer)}
                            </p>
                          </div>
                        )}

                        {response.questionType === "image_upload" && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              {t("imageUpload.submittedImages")}:
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1">
                              {(response as ImageUploadResponse).uploadedImages.map((img, i) => (
                                <img
                                  key={i}
                                  src={img.url || "/placeholder.svg"}
                                  alt={img.filename}
                                  className="w-full h-20 object-cover rounded-md"
                                />
                              ))}
                            </div>
                            <p className="text-sm text-orange-600 mt-2">{t("imageUpload.pendingReview")}</p>
                          </div>
                        )}

                        {!response.isCorrect && question.type !== "image_upload" && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              {t("review.correctAnswerLabel")}:
                            </p>
                            <p className="text-sm text-green-600 dark:text-green-400">
                              {(() => {
                                if (question.type === "multiple_choice_single") {
                                  const mcq = question as MultipleChoiceSingle
                                  return mcq.options[mcq.correctAnswer]
                                } else if (question.type === "true_false") {
                                  const tf = question as TrueFalse
                                  return tf.correctAnswer ? t("trueFalse.true") : t("trueFalse.false")
                                } else if (question.type === "numerical") {
                                  const num = question as NumericalAnswer
                                  return `${num.correctAnswer}${num.unit ? ` ${num.unit}` : ""}`
                                } else if (question.type === "short_answer") {
                                  const sa = question as ShortAnswer
                                  return sa.sampleAnswer || t("feedback.explanation")
                                } else if (question.type === "fill_blank") {
                                  return (question as FillBlank).blanks.map((b) => b.acceptedAnswers[0]).join(", ")
                                } else if (question.type === "ordering") {
                                  return (question as Ordering).items
                                    .sort((a, b) => a.correctPosition - b.correctPosition)
                                    .map((i) => i.text)
                                    .join(", ")
                                }
                                return ""
                              })()}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            {t("feedback.explanation")}:
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{question.explanation}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-xl mb-4">Need Help?</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-left">
                <div className="flex items-start gap-3">
                  <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium mb-1">Review Content</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Go back to the session materials</p>
                  </div>
                </div>
              </button>

              <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-left">
                <div className="flex items-start gap-3">
                  <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium mb-1">Contact Instructor</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Get help from your instructor</p>
                  </div>
                </div>
              </button>

              <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-left">
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium mb-1">View FAQs</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Common questions and answers</p>
                  </div>
                </div>
              </button>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {onRetake && (
              <Button variant="outline" size="lg" onClick={onRetake} className="flex-1 bg-transparent">
                {t("actions.retakeAssessment")}
              </Button>
            )}
            <Button size="lg" className="flex-1">
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }
}
