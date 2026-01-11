"use client"

import { useState, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TaxonomyCell } from "@/components/taxonomy-cell"
import { CellDetailModal } from "@/components/cell-detail-modal"
import { SimplifiedTaxonomyView } from "@/components/simplified-taxonomy-view"
import { useTranslation } from "@/lib/i18n/use-translation"
import type { TaxonomyMatrixProps, TaxonomyCell as TaxonomyCellType, CellDetail } from "@/types/taxonomy"
import { MasteryMatrixFilters, type MasteryFilterState } from "@/components/mastery-matrix-filters"
import { ContextualHelp } from "@/lib/help/HelpModal"

// Complete taxonomy data for all 24 cells
const taxonomyCells: TaxonomyCellType[] = [
  // Row 1: Remember
  {
    code: "1A",
    cognitiveLevel: 1,
    cognitiveName: "Remember",
    knowledgeDimension: "A",
    knowledgeName: "Factual",
    description: "Retrieve relevant knowledge from long-term memory",
    typicalVerbs: ["Define", "List", "Name", "Identify", "Recall"],
    example: "List the five French mother sauces",
  },
  {
    code: "1B",
    cognitiveLevel: 1,
    cognitiveName: "Remember",
    knowledgeDimension: "B",
    knowledgeName: "Conceptual",
    description: "Recall theories, models, principles, and generalizations",
    typicalVerbs: ["Recognize", "Describe", "Identify", "Retrieve", "Name"],
    example: "Describe the concept of mise en place in professional kitchens",
  },
  {
    code: "1C",
    cognitiveLevel: 1,
    cognitiveName: "Remember",
    knowledgeDimension: "C",
    knowledgeName: "Procedural",
    description: "Recall techniques and methods",
    typicalVerbs: ["Recall", "List", "Identify", "Name", "Recognize"],
    example: "List the steps for proper knife sharpening",
  },
  {
    code: "1D",
    cognitiveLevel: 1,
    cognitiveName: "Remember",
    knowledgeDimension: "D",
    knowledgeName: "Metacognitive",
    description: "Recall strategies and self-knowledge",
    typicalVerbs: ["Identify", "Recognize", "Recall", "Describe", "List"],
    example: "Identify personal learning preferences when mastering new techniques",
  },
  // Row 2: Understand
  {
    code: "2A",
    cognitiveLevel: 2,
    cognitiveName: "Understand",
    knowledgeDimension: "A",
    knowledgeName: "Factual",
    description: "Construct meaning from instructional messages",
    typicalVerbs: ["Explain", "Summarize", "Paraphrase", "Classify", "Compare"],
    example: "Explain why specific temperatures are important in food safety",
  },
  {
    code: "2B",
    cognitiveLevel: 2,
    cognitiveName: "Understand",
    knowledgeDimension: "B",
    knowledgeName: "Conceptual",
    description: "Understand relationships among elements",
    typicalVerbs: ["Interpret", "Exemplify", "Classify", "Compare", "Explain"],
    example: "Explain the relationship between heat and protein coagulation",
  },
  {
    code: "2C",
    cognitiveLevel: 2,
    cognitiveName: "Understand",
    knowledgeDimension: "C",
    knowledgeName: "Procedural",
    description: "Understand how and when to use techniques",
    typicalVerbs: ["Clarify", "Interpret", "Summarize", "Infer", "Compare"],
    example: "Explain when to use dry heat vs. moist heat cooking methods",
  },
  {
    code: "2D",
    cognitiveLevel: 2,
    cognitiveName: "Understand",
    knowledgeDimension: "D",
    knowledgeName: "Metacognitive",
    description: "Understand one's own learning process",
    typicalVerbs: ["Interpret", "Infer", "Summarize", "Compare", "Explain"],
    example: "Explain personal strategies for mastering complex recipes",
  },
  // Row 3: Apply
  {
    code: "3A",
    cognitiveLevel: 3,
    cognitiveName: "Apply",
    knowledgeDimension: "A",
    knowledgeName: "Factual",
    description: "Use knowledge in familiar situations",
    typicalVerbs: ["Execute", "Implement", "Use", "Apply", "Carry out"],
    example: "Apply food safety guidelines during meal preparation",
  },
  {
    code: "3B",
    cognitiveLevel: 3,
    cognitiveName: "Apply",
    knowledgeDimension: "B",
    knowledgeName: "Conceptual",
    description: "Apply concepts and principles",
    typicalVerbs: ["Use", "Apply", "Implement", "Demonstrate", "Show"],
    example: "Apply the concept of flavor profiling when balancing a dish",
  },
  {
    code: "3C",
    cognitiveLevel: 3,
    cognitiveName: "Apply",
    knowledgeDimension: "C",
    knowledgeName: "Procedural",
    description: "Carry out or use a procedure in a given situation",
    typicalVerbs: ["Execute", "Implement", "Demonstrate", "Perform", "Use"],
    example: "Execute julienne cuts with consistent 3mm dimensions",
  },
  {
    code: "3D",
    cognitiveLevel: 3,
    cognitiveName: "Apply",
    knowledgeDimension: "D",
    knowledgeName: "Metacognitive",
    description: "Apply self-monitoring strategies",
    typicalVerbs: ["Use", "Apply", "Execute", "Implement", "Perform"],
    example: "Apply self-assessment techniques while practicing new skills",
  },
  // Row 4: Analyze
  {
    code: "4A",
    cognitiveLevel: 4,
    cognitiveName: "Analyze",
    knowledgeDimension: "A",
    knowledgeName: "Factual",
    description: "Break material into parts and determine relationships",
    typicalVerbs: ["Differentiate", "Organize", "Attribute", "Compare", "Deconstruct"],
    example: "Analyze ingredient lists to identify potential allergens",
  },
  {
    code: "4B",
    cognitiveLevel: 4,
    cognitiveName: "Analyze",
    knowledgeDimension: "B",
    knowledgeName: "Conceptual",
    description: "Determine how elements fit within a structure",
    typicalVerbs: ["Differentiate", "Organize", "Integrate", "Find", "Structure"],
    example: "Analyze how different cooking methods affect nutritional content",
  },
  {
    code: "4C",
    cognitiveLevel: 4,
    cognitiveName: "Analyze",
    knowledgeDimension: "C",
    knowledgeName: "Procedural",
    description: "Analyze procedures for efficiency and effectiveness",
    typicalVerbs: ["Differentiate", "Organize", "Deconstruct", "Outline", "Find"],
    example: "Analyze workflow to identify bottlenecks in mise en place",
  },
  {
    code: "4D",
    cognitiveLevel: 4,
    cognitiveName: "Analyze",
    knowledgeDimension: "D",
    knowledgeName: "Metacognitive",
    description: "Analyze one's own thinking and learning",
    typicalVerbs: ["Differentiate", "Distinguish", "Focus", "Select", "Organize"],
    example: "Analyze which learning strategies work best for technique mastery",
  },
  // Row 5: Evaluate
  {
    code: "5A",
    cognitiveLevel: 5,
    cognitiveName: "Evaluate",
    knowledgeDimension: "A",
    knowledgeName: "Factual",
    description: "Make judgments based on criteria",
    typicalVerbs: ["Check", "Critique", "Judge", "Test", "Detect"],
    example: "Evaluate ingredient freshness using sensory indicators",
  },
  {
    code: "5B",
    cognitiveLevel: 5,
    cognitiveName: "Evaluate",
    knowledgeDimension: "B",
    knowledgeName: "Conceptual",
    description: "Make judgments about theories and principles",
    typicalVerbs: ["Critique", "Judge", "Evaluate", "Assess", "Appraise"],
    example: "Critique menu designs based on nutritional balance principles",
  },
  {
    code: "5C",
    cognitiveLevel: 5,
    cognitiveName: "Evaluate",
    knowledgeDimension: "C",
    knowledgeName: "Procedural",
    description: "Judge the effectiveness of procedures",
    typicalVerbs: ["Check", "Critique", "Judge", "Evaluate", "Test"],
    example: "Evaluate the effectiveness of different plating techniques",
  },
  {
    code: "5D",
    cognitiveLevel: 5,
    cognitiveName: "Evaluate",
    knowledgeDimension: "D",
    knowledgeName: "Metacognitive",
    description: "Evaluate one's own learning and thinking",
    typicalVerbs: ["Reflect", "Judge", "Assess", "Evaluate", "Critique"],
    example: "Evaluate personal progress toward mastery of knife skills",
  },
  // Row 6: Create
  {
    code: "6A",
    cognitiveLevel: 6,
    cognitiveName: "Create",
    knowledgeDimension: "A",
    knowledgeName: "Factual",
    description: "Put elements together to form something new",
    typicalVerbs: ["Generate", "Plan", "Produce", "Design", "Construct"],
    example: "Generate ingredient substitutions for dietary restrictions",
  },
  {
    code: "6B",
    cognitiveLevel: 6,
    cognitiveName: "Create",
    knowledgeDimension: "B",
    knowledgeName: "Conceptual",
    description: "Create new theories or frameworks",
    typicalVerbs: ["Generate", "Design", "Plan", "Produce", "Construct"],
    example: "Design a new fusion cuisine concept combining culinary traditions",
  },
  {
    code: "6C",
    cognitiveLevel: 6,
    cognitiveName: "Create",
    knowledgeDimension: "C",
    knowledgeName: "Procedural",
    description: "Create new procedures or techniques",
    typicalVerbs: ["Design", "Construct", "Plan", "Produce", "Devise"],
    example: "Design an innovative plating technique for a signature dish",
  },
  {
    code: "6D",
    cognitiveLevel: 6,
    cognitiveName: "Create",
    knowledgeDimension: "D",
    knowledgeName: "Metacognitive",
    description: "Create new learning strategies",
    typicalVerbs: ["Generate", "Plan", "Design", "Develop", "Create"],
    example: "Design a personalized learning plan for culinary mastery",
  },
]

// Helper function to calculate level mastery
function calculateLevelMastery(cellScores: Record<string, number>): any[] {
  const levels = [
    { level: 1, name: "Remember", cells: ["1A", "1B", "1C", "1D"] },
    { level: 2, name: "Understand", cells: ["2A", "2B", "2C", "2D"] },
    { level: 3, name: "Apply", cells: ["3A", "3B", "3C", "3D"] },
    { level: 4, name: "Analyze", cells: ["4A", "4B", "4C", "4D"] },
    { level: 5, name: "Evaluate", cells: ["5A", "5B", "5C", "5D"] },
    { level: 6, name: "Create", cells: ["6A", "6B", "6C", "6D"] },
  ]

  return levels.map((level) => {
    const scores = level.cells.map((cell) => cellScores[cell] || 0)
    const totalScore = scores.reduce((sum, score) => sum + score, 0)
    const averageScore = totalScore / scores.length
    const cellsMastered = scores.filter((score) => score >= 85).length
    const cellsStarted = scores.filter((score) => score > 0).length

    return {
      level: level.level,
      name: level.name,
      averageScore: Math.round(averageScore),
      cellsMastered: cellsMastered,
      totalCells: level.cells.length,
      cellsStarted: cellsStarted,
      status:
        averageScore >= 85
          ? "mastered"
          : averageScore >= 70
            ? "proficient"
            : averageScore > 0
              ? "developing"
              : "not_started",
    }
  })
}

export function TaxonomyMatrix({ cellScores, onCellClick }: TaxonomyMatrixProps) {
  const { t, locale } = useTranslation()
  const [selectedCell, setSelectedCell] = useState<CellDetail | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [view, setView] = useState<"simplified" | "detailed">("simplified")

  const [filters, setFilters] = useState<MasteryFilterState>({
    courseId: null,
    classId: null,
    sessionId: null,
    dateRange: { from: null, to: null },
  })

  const mockCourses = [
    { id: "course-1", title: "Introduction to Culinary Arts", code: "CA-101" },
    { id: "course-2", title: "Advanced Knife Skills", code: "CA-201" },
    { id: "course-3", title: "Pastry Fundamentals", code: "PA-101" },
  ]

  const mockClasses = [
    { id: "class-1", title: "Fundamentals", order: 1 },
    { id: "class-2", title: "Intermediate Techniques", order: 2 },
    { id: "class-3", title: "Advanced Methods", order: 3 },
  ]

  const mockSessions = [
    { id: "session-1", title: "Kitchen Safety & Sanitation", order: 1 },
    { id: "session-2", title: "Basic Knife Cuts", order: 2 },
    { id: "session-3", title: "Stock & Sauce Making", order: 3 },
  ]

  const filteredCellScores = useMemo(() => {
    return cellScores.filter((score) => {
      // Apply course filter
      if (filters.courseId && score.courseId !== filters.courseId) return false

      // Apply class filter
      if (filters.classId && score.classId !== filters.classId) return false

      // Apply session filter
      if (filters.sessionId && score.sessionId !== filters.sessionId) return false

      // Apply date range filter if needed
      if (filters.dateRange.from && score.lastUpdated) {
        const scoreDate = new Date(score.lastUpdated)
        if (scoreDate < filters.dateRange.from) return false
      }
      if (filters.dateRange.to && score.lastUpdated) {
        const scoreDate = new Date(score.lastUpdated)
        if (scoreDate > filters.dateRange.to) return false
      }

      return true
    })
  }, [cellScores, filters])

  const totalObjectives = cellScores.length * 3 // Mock: 3 objectives per cell
  const filteredObjectives = filteredCellScores.length * 3 // Filtered count

  const cellScoreMap = useMemo(() => {
    const map: Record<string, { score: number; dimmed: boolean }> = {}

    // Initialize all cells as empty/dimmed
    taxonomyCells.forEach((cell) => {
      map[cell.code] = { score: 0, dimmed: true }
    })

    // Update with filtered scores
    filteredCellScores.forEach((score) => {
      map[score.cellCode] = {
        score: score.masteryPercentage,
        dimmed: false, // Has data, not dimmed
      }
    })

    return map
  }, [filteredCellScores])

  const cellScoreMapSimple = useMemo(() => {
    const map: Record<string, number> = {}
    filteredCellScores.forEach((score) => {
      map[score.cellCode] = score.masteryPercentage
    })
    return map
  }, [filteredCellScores])

  const levelMasteries = useMemo(() => calculateLevelMastery(cellScoreMapSimple), [cellScoreMapSimple])

  const handleCellClick = (cell: TaxonomyCellType) => {
    const score = getCellScore(cell.code)

    const cellDetail: CellDetail = {
      code: cell.code,
      cognitiveName: cell.cognitiveName,
      knowledgeName: cell.knowledgeName,
      description: cell.description,
      typicalVerbs: cell.typicalVerbs,
      example: cell.example,
      masteryPercentage: score?.masteryPercentage || 0,
      glosCompleted: score?.glosCompleted || 0,
      glosTotal: 3,
      lastUpdated: score?.lastUpdated,
      recommendations: {
        internal: [
          {
            id: `int-1-${cell.code}`,
            title: `${cell.cognitiveName} Skills Module`,
            description: `Master ${cell.cognitiveName.toLowerCase()} skills with ${cell.knowledgeName.toLowerCase()} knowledge through interactive lessons.`,
            type: "module",
            source: "Kalanso Learning Platform",
            estimatedTime: 45,
            difficulty: "medium",
            relevanceScore: 95,
          },
          {
            id: `int-2-${cell.code}`,
            title: `Video Tutorial: ${cell.cognitiveName} in Action`,
            description: `Watch expert demonstrations of ${cell.cognitiveName.toLowerCase()} techniques.`,
            type: "video",
            source: "Kalanso Video Library",
            estimatedTime: 15,
            difficulty: "easy",
            relevanceScore: 88,
          },
        ],
        external: [
          {
            id: `ext-1-${cell.code}`,
            title: `Understanding ${cell.cognitiveName} in Culinary Arts`,
            description: `Comprehensive guide to ${cell.cognitiveName.toLowerCase()} level thinking.`,
            type: "article",
            platform: "Culinary Institute",
            url: "https://example.com",
            source: "Professional Culinary Education",
            estimatedTime: 20,
            difficulty: "medium",
          },
        ],
      },
      exercises: [
        {
          id: `ex-1-${cell.code}`,
          title: `${cell.cognitiveName} Practice Challenge`,
          type: "practice",
          prompt: `Practice your ${cell.cognitiveName.toLowerCase()} skills with ${cell.knowledgeName.toLowerCase()} knowledge. ${cell.example}`,
          hints: [
            `Focus on the key verbs: ${cell.typicalVerbs.slice(0, 3).join(", ")}`,
            `Think about how this applies to real kitchen scenarios`,
            `Consider both theory and practical application`,
          ],
          difficulty: "medium",
          estimatedTime: 30,
          learningObjective: cell.example,
        },
        {
          id: `ex-2-${cell.code}`,
          title: `Scenario-Based Exercise`,
          type: "scenario",
          prompt: `You're working in a professional kitchen and need to demonstrate ${cell.cognitiveName.toLowerCase()} skills. How would you approach this challenge?`,
          hints: [
            `Break down the problem into smaller steps`,
            `Apply the concepts you've learned`,
            `Think about real-world constraints`,
          ],
          difficulty: "hard",
          estimatedTime: 45,
          learningObjective: `Apply ${cell.cognitiveName.toLowerCase()} thinking to complex scenarios`,
        },
      ],
    }

    setSelectedCell(cellDetail)
    setIsModalOpen(true)
    onCellClick?.(cell.code)
  }

  const getCellScore = (cellCode: string) => {
    return filteredCellScores.find((score) => score.cellCode === cellCode)
  }

  const handleStartResource = (resourceId: string) => {
    console.log("Starting resource:", resourceId)
    // TODO: Navigate to resource or open in modal
  }

  const handleStartExercise = (exerciseId: string) => {
    console.log("Starting exercise:", exerciseId)
    // TODO: Navigate to exercise or open in modal
  }

  const handleGenerateExercises = () => {
    console.log("Generating more exercises...")
    // TODO: Call AI to generate exercises
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">{t("taxonomy.title")}</h1>
        <p className="text-gray-600">{t("taxonomy.subtitle")}</p>
      </div>

      <ContextualHelp section="objectives" item="bloomMatrix" language={locale} defaultOpen={true} className="mb-4" />

      <MasteryMatrixFilters
        courses={mockCourses}
        classes={mockClasses}
        sessions={mockSessions}
        filters={filters}
        onFiltersChange={setFilters}
        totalObjectives={totalObjectives}
        filteredObjectives={filteredObjectives}
      />

      {/* View Toggle Tabs */}
      <Tabs value={view} onValueChange={(v) => setView(v as "simplified" | "detailed")} className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
          <TabsTrigger value="simplified" className="text-sm">
            {t("taxonomy.view.simplified")}
          </TabsTrigger>
          <TabsTrigger value="detailed" className="text-sm">
            {t("taxonomy.view.detailed")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="simplified" className="mt-6">
          <SimplifiedTaxonomyView
            levelMasteries={levelMasteries}
            onLevelClick={(level) => {
              // Switch to detailed view and scroll to level
              setView("detailed")
            }}
          />
        </TabsContent>

        <TabsContent value="detailed" className="mt-6">
          {/* Desktop Grid View */}
          <div className="hidden lg:block overflow-x-auto">
            <div className="min-w-[900px]">
              {/* Column Headers */}
              <div className="grid grid-cols-[150px_repeat(4,1fr)] gap-2 mb-2">
                <div></div>
                {["A", "B", "C", "D"].map((dim, idx) => (
                  <div key={dim} className="text-center">
                    <p className="text-sm font-semibold text-purple-600">{dim}</p>
                    <p className="text-xs text-gray-600">
                      {("Factual", "Conceptual", "Procedural", "Metacognitive")}[idx]
                    </p>
                  </div>
                ))}
              </div>

              {/* Grid Rows */}
              <div className="space-y-2">
                {["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"].map((cognitiveName, rowIndex) => (
                  <div key={cognitiveName} className="grid grid-cols-[150px_repeat(4,1fr)] gap-2">
                    {/* Row Header */}
                    <div className="flex items-center justify-center bg-purple-50 rounded-lg border border-purple-200 p-2">
                      <div className="text-center">
                        <p className="text-sm font-semibold text-purple-700">{rowIndex + 1}</p>
                        <p className="text-xs text-purple-600">{cognitiveName}</p>
                      </div>
                    </div>

                    {/* Cells */}
                    {["A", "B", "C", "D"].map((dim) => {
                      const cellCode = `${rowIndex + 1}${dim}`
                      const cell = taxonomyCells.find((c) => c.code === cellCode)
                      const score = getCellScore(cellCode)
                      const cellState = cellScoreMap[cellCode]

                      return cell ? (
                        <div
                          key={cellCode}
                          className={cellState?.dimmed ? "opacity-30 transition-opacity" : "transition-opacity"}
                        >
                          <TaxonomyCell cell={cell} score={score} onClick={() => handleCellClick(cell)} />
                        </div>
                      ) : (
                        <div key={cellCode} className="h-full" />
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile List View */}
          <div className="lg:hidden space-y-4">
            {["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"].map((cognitiveName, rowIndex) => (
              <div key={cognitiveName} className="space-y-2">
                <h3 className="text-lg font-semibold text-purple-600">
                  {rowIndex + 1}. {cognitiveName}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {["A", "B", "C", "D"].map((dim) => {
                    const cellCode = `${rowIndex + 1}${dim}`
                    const cell = taxonomyCells.find((c) => c.code === cellCode)
                    const score = getCellScore(cellCode)

                    return cell ? (
                      <TaxonomyCell key={cellCode} cell={cell} score={score} onClick={() => handleCellClick(cell)} />
                    ) : null
                  })}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Detail Modal */}
      <CellDetailModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        cellDetail={selectedCell}
        onStartGLO={handleStartResource}
        onStartExercise={handleStartExercise}
        onGenerateExercises={handleGenerateExercises}
      />
    </div>
  )
}
