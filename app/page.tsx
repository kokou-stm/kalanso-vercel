"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AssessmentInterface } from "@/components/assessment-interface"
import { TaxonomyMatrix } from "@/components/taxonomy-matrix"
import { GLOCard } from "@/components/glo-card"
import { LearnerDashboard } from "@/components/learner-dashboard"
import { GLOStudyView } from "@/components/glo-study-view"
import { AcademicSpace } from "@/components/academic-space/academic-space"
import { sampleLearner, sampleProgress, sampleDashboardGLOs, sampleActivity } from "@/lib/sample-data/dashboard-data"
import { sampleFullGLO, sampleGLOProgress } from "@/lib/sample-data/full-glo-data"
import { useCourses } from "@/lib/hooks/use-courses"
import { useTranslation } from "@/lib/i18n/use-translation"
import { LanguageSelector } from "@/components/language-selector"
import { HelpButton, HelpPanel } from "@/lib/help/HelpPanel"
import type { AssessmentQuestion, AssessmentResult } from "@/types/assessment"
import type { LearnerCellScore } from "@/types/taxonomy"
import type { GLO, GLOProgress } from "@/types/glo"
import type { NewGLO } from "@/types/instructor"

const sampleQuestions: AssessmentQuestion[] = [
  {
    id: "q1",
    type: "multiple_choice_single",
    question: "What are the standard dimensions for julienne cuts?",
    cellCode: "3C",
    points: 1,
    difficulty: "medium",
    options: ["2mm × 2mm × 3cm", "3mm × 3mm × 5cm", "5mm × 5mm × 7cm", "1mm × 1mm × 2cm"],
    correctAnswer: 1,
    explanation: "Julienne cuts are standardized at 3mm × 3mm × 5cm for consistency in cooking times and presentation.",
    hints: ["Think matchstick size", "Standard in French cuisine"],
  },
  {
    id: "q2",
    type: "true_false",
    question: "Julienne cuts are also called 'allumette' cuts.",
    cellCode: "3C",
    points: 1,
    difficulty: "easy",
    correctAnswer: true,
    explanation: "Yes, 'allumette' (French for matchstick) is another term for julienne cuts.",
  },
  {
    id: "q3",
    type: "fill_blank",
    question: "Complete the following sentence about food safety:",
    cellCode: "1A",
    points: 2,
    difficulty: "medium",
    template:
      "The __1__ zone for bacteria growth is between __2__°C and __3__°C. To prevent foodborne illness, food should be kept either below __2__°C or above __4__°C.",
    blanks: [
      {
        id: "1",
        acceptedAnswers: ["danger", "danger zone"],
        caseSensitive: false,
        placeholder: "zone name",
      },
      {
        id: "2",
        acceptedAnswers: ["4", "5"],
        caseSensitive: false,
        placeholder: "min temp",
      },
      {
        id: "3",
        acceptedAnswers: ["60"],
        caseSensitive: false,
        placeholder: "max temp",
      },
      {
        id: "4",
        acceptedAnswers: ["60"],
        caseSensitive: false,
        placeholder: "safe hot temp",
      },
    ],
    explanation:
      "The danger zone for bacteria growth is 4-60°C (40-140°F). Food should be kept refrigerated below 4°C or hot above 60°C.",
    hints: ["Think about refrigeration temperature", "Hot food should be steaming hot"],
  },
  {
    id: "q4",
    type: "ordering",
    question: "Arrange these steps in the correct order for making a classic béchamel sauce:",
    cellCode: "2B",
    points: 2,
    difficulty: "medium",
    items: [
      {
        id: "step1",
        text: "Melt butter in a saucepan over medium heat",
        correctPosition: 0,
      },
      {
        id: "step2",
        text: "Add flour and whisk to create a roux",
        correctPosition: 1,
      },
      {
        id: "step3",
        text: "Cook the roux for 2-3 minutes without browning",
        correctPosition: 2,
      },
      {
        id: "step4",
        text: "Gradually add warm milk while whisking constantly",
        correctPosition: 3,
      },
      {
        id: "step5",
        text: "Simmer until sauce thickens and coats the back of a spoon",
        correctPosition: 4,
      },
      {
        id: "step6",
        text: "Season with salt, white pepper, and nutmeg",
        correctPosition: 5,
      },
    ],
    allowPartialCredit: true,
    explanation:
      "The correct sequence ensures a smooth béchamel: start with a roux (butter + flour), cook it briefly, then gradually add warm milk to prevent lumps, simmer to desired consistency, and season at the end.",
    hints: ["Start with the fat and flour", "Add liquid gradually", "Season last"],
  },
  {
    id: "q5",
    type: "short_answer",
    question: "Explain why emulsions like mayonnaise stay stable instead of separating.",
    cellCode: "2B",
    points: 2,
    difficulty: "medium",
    minWords: 30,
    maxWords: 100,
    sampleAnswer: "Emulsions stay stable because emulsifiers like egg yolk contain lecithin...",
    keywords: ["lecithin", "emulsifier", "hydrophilic", "lipophilic"],
    autoGrade: false,
    explanation: "A good answer mentions emulsifiers, their amphiphilic nature, and how they surround oil droplets.",
  },
  {
    id: "q6",
    type: "numerical",
    question: "What is the safe minimum internal temperature for cooking chicken?",
    cellCode: "1A",
    points: 1,
    difficulty: "easy",
    correctAnswer: 74,
    unit: "°C",
    tolerance: 1,
    toleranceType: "absolute",
    format: "integer",
    minValue: 60,
    maxValue: 90,
    showUnit: true,
    placeholder: "Temperature",
    explanation: "The safe minimum is 74°C (165°F) to kill harmful bacteria like Salmonella.",
  },
  {
    id: "q7",
    type: "categorization",
    question: "Categorize these sauces by their emulsion type:",
    cellCode: "2B",
    points: 2,
    difficulty: "medium",
    items: [
      { id: "mayo", text: "Mayonnaise", correctCategory: "oil_in_water" },
      { id: "holl", text: "Hollandaise", correctCategory: "water_in_oil" },
      { id: "vin", text: "Vinaigrette", correctCategory: "temporary" },
      { id: "tom", text: "Tomato Sauce", correctCategory: "no_emulsion" },
      { id: "aioli", text: "Aioli", correctCategory: "oil_in_water" },
      { id: "bearn", text: "Béarnaise", correctCategory: "water_in_oil" },
    ],
    categories: [
      {
        id: "oil_in_water",
        label: "Oil-in-Water",
        description: "Oil droplets dispersed in water",
        color: "#3b82f6",
      },
      {
        id: "water_in_oil",
        label: "Water-in-Oil",
        description: "Water droplets dispersed in fat",
        color: "#f59e0b",
      },
      {
        id: "temporary",
        label: "Temporary Emulsion",
        description: "Unstable, separates quickly",
        color: "#ef4444",
      },
      {
        id: "no_emulsion",
        label: "Not an Emulsion",
        description: "No emulsification present",
        color: "#6b7280",
      },
    ],
    allowMultiplePerCategory: true,
    allowPartialCredit: true,
    explanation:
      "Oil-in-water emulsions (mayonnaise, aioli) have oil droplets in water. Water-in-oil emulsions (hollandaise, béarnaise) have water droplets in fat. Vinaigrette is a temporary emulsion that separates. Tomato sauce is not an emulsion.",
    hints: [
      "Consider what the continuous phase is",
      "Think about which ingredient is more abundant",
      "Cold emulsions are usually oil-in-water",
    ],
  },
  {
    id: "q8",
    type: "image_upload",
    question: "Execute julienne cuts and submit photographic evidence:",
    cellCode: "3C",
    points: 5,
    difficulty: "hard",
    requirements:
      "Submit clear photos of your julienne cuts demonstrating:\n1. Consistent 3mm × 3mm × 5cm dimensions\n2. Clean, straight cuts without ragged edges\n3. Uniform shape and size across all pieces\n\nRequired: One photo from directly above (top view), one photo from the side (side view).",
    minImages: 2,
    maxImages: 3,
    requiredAngles: ["top view", "side view"],
    acceptedFormats: ["jpg", "jpeg", "png", "heic"],
    maxFileSize: 10,
    requireCoachReview: true,
    rubric: [
      {
        id: "dimensions",
        criterion: "Dimensional Consistency",
        description: "All cuts within 0.5mm of target dimensions (3mm × 3mm × 5cm)",
        points: 2,
      },
      {
        id: "quality",
        criterion: "Cut Quality",
        description: "Clean, straight cuts without ragged or torn edges",
        points: 1,
      },
      {
        id: "uniformity",
        criterion: "Overall Uniformity",
        description: "All pieces are similar in size and shape",
        points: 1,
      },
      {
        id: "presentation",
        criterion: "Photo Quality",
        description: "Clear, well-lit photos from required angles",
        points: 1,
      },
    ],
    explanation:
      "Julienne precision demonstrates advanced knife skills mastery. Photographs provide evidence of execution quality that cannot be assessed through written answers. This practical assessment ensures you can perform the skill, not just understand it theoretically.",
    hints: [
      "Use a sharp knife for clean cuts",
      "Measure a few pieces to verify dimensions",
      "Ensure good lighting for photos",
      "Take photos against a plain background",
    ],
  },
]

// Sample cell scores for the taxonomy matrix
const sampleCellScores: LearnerCellScore[] = [
  { cellCode: "1A", masteryPercentage: 95, glosCompleted: 4, lastUpdated: new Date() },
  { cellCode: "1B", masteryPercentage: 88, glosCompleted: 3, lastUpdated: new Date() },
  { cellCode: "1C", masteryPercentage: 92, glosCompleted: 5, lastUpdated: new Date() },
  { cellCode: "1D", masteryPercentage: 0, glosCompleted: 0, lastUpdated: new Date() },
  { cellCode: "2A", masteryPercentage: 87, glosCompleted: 3, lastUpdated: new Date() },
  { cellCode: "2B", masteryPercentage: 91, glosCompleted: 4, lastUpdated: new Date() },
  { cellCode: "2C", masteryPercentage: 85, glosCompleted: 4, lastUpdated: new Date() },
  { cellCode: "2D", masteryPercentage: 78, glosCompleted: 2, lastUpdated: new Date() },
  { cellCode: "3A", masteryPercentage: 73, glosCompleted: 2, lastUpdated: new Date() },
  { cellCode: "3B", masteryPercentage: 68, glosCompleted: 2, lastUpdated: new Date() },
  { cellCode: "3C", masteryPercentage: 89, glosCompleted: 3, lastUpdated: new Date() },
  { cellCode: "3D", masteryPercentage: 0, glosCompleted: 0, lastUpdated: new Date() },
  { cellCode: "4A", masteryPercentage: 45, glosCompleted: 1, lastUpdated: new Date() },
  { cellCode: "4B", masteryPercentage: 0, glosCompleted: 0, lastUpdated: new Date() },
  { cellCode: "4C", masteryPercentage: 0, glosCompleted: 0, lastUpdated: new Date() },
  { cellCode: "4D", masteryPercentage: 0, glosCompleted: 0, lastUpdated: new Date() },
  { cellCode: "5A", masteryPercentage: 0, glosCompleted: 0, lastUpdated: new Date() },
  { cellCode: "5B", masteryPercentage: 0, glosCompleted: 0, lastUpdated: new Date() },
  { cellCode: "5C", masteryPercentage: 0, glosCompleted: 0, lastUpdated: new Date() },
  { cellCode: "5D", masteryPercentage: 0, glosCompleted: 0, lastUpdated: new Date() },
  { cellCode: "6A", masteryPercentage: 0, glosCompleted: 0, lastUpdated: new Date() },
  { cellCode: "6B", masteryPercentage: 0, glosCompleted: 0, lastUpdated: new Date() },
  { cellCode: "6C", masteryPercentage: 0, glosCompleted: 0, lastUpdated: new Date() },
  { cellCode: "6D", masteryPercentage: 0, glosCompleted: 0, lastUpdated: new Date() },
]

// Sample GLO data for demo
const sampleGLOs: { glo: GLO; progress: GLOProgress }[] = [
  {
    glo: {
      id: "GLO_CS_001",
      title: "Julienne Cutting Technique",
      learningObjective:
        "Execute precise julienne cuts (3mm × 3mm × 5cm) with consistent size and shape for professional presentations",
      taxonomyCell: "3C",
      taxonomyCellName: "Apply × Procedural",
      estimatedTime: 15,
      difficulty: "medium",
      masteryThreshold: 85,
    },
    progress: {
      gloId: "GLO_CS_001",
      status: "in_progress",
      contentCompleted: true,
      practiceCompleted: true,
      assessmentCompleted: false,
      currentScore: 73,
      attempts: 2,
      lastAttempt: new Date(),
      timeSpent: 12,
    },
  },
  {
    glo: {
      id: "GLO_CS_002",
      title: "Sauce Emulsification Basics",
      learningObjective: "Understand the chemistry of emulsions and why sauces like hollandaise stay stable",
      taxonomyCell: "2B",
      taxonomyCellName: "Understand × Conceptual",
      estimatedTime: 20,
      difficulty: "easy",
      masteryThreshold: 85,
    },
    progress: {
      gloId: "GLO_CS_002",
      status: "not_started",
      contentCompleted: false,
      practiceCompleted: false,
      assessmentCompleted: false,
      currentScore: 0,
      attempts: 0,
      timeSpent: 0,
    },
  },
  {
    glo: {
      id: "GLO_CS_003",
      title: "Food Safety Temperature Control",
      learningObjective: "Apply safe food handling temperatures to prevent bacterial growth and foodborne illness",
      taxonomyCell: "3A",
      taxonomyCellName: "Apply × Factual",
      estimatedTime: 25,
      difficulty: "medium",
      masteryThreshold: 85,
    },
    progress: {
      gloId: "GLO_CS_003",
      status: "mastered",
      contentCompleted: true,
      practiceCompleted: true,
      assessmentCompleted: true,
      currentScore: 89,
      attempts: 1,
      lastAttempt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      timeSpent: 28,
    },
  },
  {
    glo: {
      id: "GLO_CS_004",
      title: "Béchamel Sauce Preparation",
      learningObjective:
        "Create a smooth, lump-free béchamel sauce using proper roux technique and gradual liquid incorporation",
      taxonomyCell: "3C",
      taxonomyCellName: "Apply × Procedural",
      estimatedTime: 30,
      difficulty: "hard",
      masteryThreshold: 85,
    },
    progress: {
      gloId: "GLO_CS_004",
      status: "completed",
      contentCompleted: true,
      practiceCompleted: true,
      assessmentCompleted: true,
      currentScore: 78,
      attempts: 3,
      lastAttempt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      timeSpent: 45,
    },
  },
]

export default function Home() {
  const { t, language } = useTranslation()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [studyingGLO, setStudyingGLO] = useState<string | null>(null)
  const [helpPanelOpen, setHelpPanelOpen] = useState(false)

  const { courses, loading: coursesLoading, error: coursesError, refetch: refetchCourses } = useCourses()

  const handleComplete = (result: AssessmentResult) => {
    console.log("Assessment completed:", result)
  }

  const handleRetake = () => {
    window.location.reload()
  }

  const handleCellClick = (cellCode: string) => {
    console.log("Cell clicked:", cellCode)
  }

  const handleGLOStartContinue = (gloId: string) => {
    console.log("[v0] Start/Continue GLO:", gloId)
    setStudyingGLO(gloId)
  }

  const handleSectionComplete = (sectionType: "content" | "practice" | "assessment") => {
    console.log("Section completed:", sectionType)
  }

  const handleAssessmentSubmit = (result: AssessmentResult) => {
    console.log("Assessment submitted:", result)
  }

  const handleBackToDashboard = () => {
    setStudyingGLO(null)
  }

  const handleSaveGLO = (glo: NewGLO) => {
    console.log("Saving new GLO:", glo)
    alert(`GLO "${glo.title}" published successfully! (This is a demo - no actual save occurred)`)
  }

  const handleCancelUpload = () => {
    console.log("Cancel upload")
  }

  const handleNavigate = (page: string) => {
    console.log("[v0] Navigating to:", page)
    switch (page) {
      case "dashboard":
        setActiveTab("dashboard")
        break
      case "glos":
      case "all-content":
      case "all-glos":
        setActiveTab("glos")
        break
      case "matrix":
      case "taxonomy-matrix":
      case "progress-report":
        setActiveTab("matrix")
        break
      case "assessment":
        setActiveTab("assessment")
        break
      case "academic":
        setActiveTab("academic")
        break
      default:
        console.log("[v0] Unknown page:", page)
    }
  }

  if (studyingGLO) {
    console.log("[v0] Rendering GLOStudyView for:", studyingGLO)

    // Check if it's one of the sample GLOs in the list
    const gloData = sampleGLOs.find((g) => g.glo.id === studyingGLO)

    if (gloData) {
      console.log("[v0] Found GLO in sample list:", gloData.glo.title)
      // Use the GLO data from the list merged with full content
      return (
        <GLOStudyView
          glo={{
            ...gloData.glo,
            contentModules: sampleFullGLO.contentModules,
            practiceExercises: sampleFullGLO.practiceExercises,
            assessmentQuestions: sampleFullGLO.assessmentQuestions,
            prerequisites: sampleFullGLO.prerequisites,
            relatedGLOs: sampleFullGLO.relatedGLOs,
            quickTips: sampleFullGLO.quickTips,
          }}
          progress={gloData.progress}
          onComplete={handleSectionComplete}
          onAssessmentSubmit={handleAssessmentSubmit}
          onBackToDashboard={handleBackToDashboard}
        />
      )
    }

    console.log("[v0] Using fallback sampleFullGLO")
    // Fallback to sample full GLO
    return (
      <GLOStudyView
        glo={sampleFullGLO}
        progress={sampleGLOProgress}
        onComplete={handleSectionComplete}
        onAssessmentSubmit={handleAssessmentSubmit}
        onBackToDashboard={handleBackToDashboard}
      />
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <h1 className="text-lg font-semibold">Kalanso Assessment System</h1>
          <div className="flex items-center gap-2">
            <HelpButton language={language} onClick={() => setHelpPanelOpen(true)} />
            <LanguageSelector />
          </div>
        </div>
      </header>

      <div className="container py-6">
        <Tabs value={activeTab} onValueChange={handleNavigate} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">{t("common.dashboard")}</TabsTrigger>
            <TabsTrigger value="glos">{t("common.learningObjects")}</TabsTrigger>
            <TabsTrigger value="matrix">{t("common.masteryProgress")}</TabsTrigger>
            <TabsTrigger value="assessment">{t("common.assessment")}</TabsTrigger>
            <TabsTrigger value="academic">{t("common.academicSpace")}</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-0">
            <LearnerDashboard
              learner={sampleLearner}
              progress={sampleProgress}
              glos={sampleDashboardGLOs}
              recentActivity={sampleActivity}
              onStartContinue={handleGLOStartContinue}
              onNavigate={handleNavigate}
            />
          </TabsContent>

          <TabsContent value="glos" className="mt-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Your Learning Path</h2>
                <p className="text-gray-600 mb-6">
                  Continue your culinary skills journey with these learning objectives
                </p>
              </div>

              {/* Default variant cards */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Available GLOs</h3>
                {sampleGLOs.map(({ glo, progress }) => (
                  <GLOCard
                    key={glo.id}
                    glo={glo}
                    progress={progress}
                    onStartContinue={handleGLOStartContinue}
                    variant="default"
                  />
                ))}
              </div>

              {/* Compact variant demo */}
              <div className="mt-12 space-y-4">
                <h3 className="text-lg font-semibold">Compact View (for sidebars/lists)</h3>
                {sampleGLOs.map(({ glo, progress }) => (
                  <GLOCard
                    key={`compact-${glo.id}`}
                    glo={glo}
                    progress={progress}
                    onStartContinue={handleGLOStartContinue}
                    variant="compact"
                  />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="matrix" className="mt-6">
            <TaxonomyMatrix cellScores={sampleCellScores} onCellClick={handleCellClick} />
          </TabsContent>
          <TabsContent value="assessment" className="mt-6">
            <AssessmentInterface
              questions={sampleQuestions}
              masteryThreshold={85}
              gloTitle="Knife Skills Fundamentals"
              taxonomyCell="3C"
              onComplete={handleComplete}
              onRetake={handleRetake}
            />
          </TabsContent>
          <TabsContent value="academic" className="mt-0">
            {coursesLoading ? (
              <div className="flex items-center justify-center h-[600px]">
                <div className="text-center">
                  <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4"></div>
                  <p className="text-gray-600">{t("common.loading")}</p>
                </div>
              </div>
            ) : coursesError ? (
              <div className="flex items-center justify-center h-[600px]">
                <div className="text-center max-w-md">
                  <div className="text-red-500 text-5xl mb-4">⚠️</div>
                  <h3 className="text-xl font-semibold mb-2 text-red-600">{t("common.error")}</h3>
                  <p className="text-gray-600 mb-4">{coursesError}</p>
                  <button
                    onClick={refetchCourses}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    {t("common.retry")}
                  </button>
                </div>
              </div>
            ) : (
              <AcademicSpace
                courses={courses}
                onNavigate={handleNavigate}
                onRefresh={refetchCourses}
                language={language}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
      <HelpPanel
        isOpen={helpPanelOpen}
        onClose={() => setHelpPanelOpen(false)}
        section="dashboard"
        language={language}
      />
    </main>
  )
}
