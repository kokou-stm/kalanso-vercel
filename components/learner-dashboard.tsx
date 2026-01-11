"use client"

import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/i18n/use-translation"
import { WelcomeHeader } from "@/components/welcome-header"
import { RecommendedGLOCard } from "@/components/recommended-glo-card"
import { GLOCard } from "@/components/glo-card"
import { CollapsibleSidebar } from "@/components/collapsible-sidebar"
import { MiniTaxonomyMatrix } from "@/components/mini-taxonomy-matrix"
import { ActivityTimeline } from "@/components/activity-timeline"
import { Card } from "@/components/ui/card"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import { Target, BookOpen, Trophy, ClipboardCheck, FileText, ChevronDown } from "lucide-react"
import { useState } from "react"
import { RealWorldInsightCard, type RealWorldInsight } from "@/components/real-world-insight-card"
import type { LearnerDashboardProps } from "@/types/learner"
import { useStudent } from "@/hooks/use-student"
import { UpcomingAssessmentCard } from "@/components/upcoming-assessment-card"
import { ReadinessCheckModal } from "@/components/readiness-check-modal"

export function LearnerDashboard({
  learner,
  progress,
  glos,
  recentActivity,
  onStartContinue,
  onNavigate,
}: LearnerDashboardProps & {
  onStartContinue: (gloId: string) => void
  onNavigate?: (page: string) => void
}) {
  const { t, locale } = useTranslation()
  const { student, studentCode, isLoading: isLoadingStudent } = useStudent()
  const studentId = student?.id || null // UUID for database queries

  const recommendedGLO = glos.find((g) => g.isRecommended)
  const inProgressGLOs = glos.filter((g) => g.progress.status === "in_progress" && !g.isRecommended)
  const otherGLOs = glos.filter((g) => g.progress.status === "not_started" && !g.isRecommended)

  const [showReadinessGenerator, setShowReadinessGenerator] = useState(false)
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null)
  const [isAssessmentSectionOpen, setIsAssessmentSectionOpen] = useState(true)
  const [showDailyInsight, setShowDailyInsight] = useState(true)

  const upcomingAssessment = {
    id: "assess_123",
    title: "Neural Networks Mastery Assessment",
    sessionTitle: "Introduction to Machine Learning",
    dueDate: "Tomorrow, 2:00 PM",
    timeRemaining: "23 hours",
    format: "20 questions • 60 minutes",
    questionCount: 20,
    timeLimit: 60,
    type: "graded" as const,
    masteryThreshold: 80,
    topics: ["Forward propagation", "Activation functions", "Gradient descent", "Loss functions"],
  }

  const practiceHistory = [
    { score: 68, dateTaken: "3 days ago", timeAgo: "3 days ago" },
    { score: 74, dateTaken: "Yesterday", timeAgo: "1 day ago" },
    { score: 78, dateTaken: "This morning", timeAgo: "6 hours ago" },
  ]

  const aiPrediction = {
    readinessScore: 76,
    readinessStatus: "almost" as const,
  }

  const dailyInsight: RealWorldInsight = {
    id: "chatgpt-backpropagation",
    title: "Real-World Connection",
    teaser:
      "Did you know? The backpropagation algorithm you're learning right now powers ChatGPT's training process, enabling it to understand and respond to billions of conversations!",
    level1Content: {
      what: {
        text: "ChatGPT uses backpropagation to adjust 175 billion neural network parameters during training, learning from massive text datasets to generate human-like responses to any question or prompt.",
        durationSeconds: 5,
      },
      how: {
        diagram: {
          steps: [
            {
              label: "Input Text",
              example: "What is machine learning?",
              description: "User submits a question or prompt",
              bloomLevel: "understand",
              studentProgress: "mastered",
            },
            {
              label: "Forward Pass",
              description: "Generate response through neural network",
              bloomLevel: "understand",
              studentProgress: "mastered",
            },
            {
              label: "Calculate Error",
              description: "How accurate was the answer?",
              bloomLevel: "understand",
              studentProgress: "mastered",
            },
            {
              label: "BACKPROPAGATION",
              description: "Adjust 175B weights to reduce error",
              bloomLevel: "apply",
              studentProgress: "current",
              highlight: true,
            },
            {
              label: "Repeat millions of times",
              description: "Optimize and iterate continuously",
              bloomLevel: "analyze",
              studentProgress: "upcoming",
            },
          ],
        },
        durationSeconds: 15,
      },
      whyItMatters: {
        scaleOfUse: [
          "ChatGPT: 100M+ weekly conversations",
          "Google Translate: 500M+ daily translations",
          "Grammarly: 30M+ documents improved daily",
        ],
        specificImpact: {
          challenge:
            "Before 2018, AI language models could barely write coherent paragraphs. They couldn't understand context, couldn't answer questions accurately, and produced gibberish more often than useful text.",
          solution: [
            "Trained on 300 billion words using backprop to learn patterns",
            "Adjusted 175B parameters through billions of training iterations",
            "Learned to understand context across entire conversations",
          ],
          difference: [
            {
              metric: "Coherence",
              before: "Random text",
              after: "Human-level writing",
            },
            {
              metric: "Accuracy",
              before: "40% correct",
              after: "85%+ correct responses",
              improvement: "+45%",
            },
            {
              metric: "Capability",
              before: "1-sentence replies",
              after: "Full essays, code, analysis",
            },
            {
              metric: "Impact",
              before: "Research tool",
              after: "Assists 100M+ people weekly",
            },
          ],
          humanImpact:
            "Students using ChatGPT for homework help report 40% faster learning of complex topics because they can ask unlimited follow-up questions. The backpropagation technique you're mastering right now is the foundation that made this possible.",
        },
        durationSeconds: 10,
      },
      yourConnection: {
        currentBloomCell: "apply_procedural",
        masteryPercentage: 65,
        masteredPrerequisites: [
          { name: "Forward propagation", mastery: 95 },
          { name: "Loss function calculation", mastery: 88 },
        ],
        currentlyLearning: [
          { name: "Gradient computation", mastery: 65, active: true },
          { name: "Weight update rules", mastery: 58 },
        ],
        upcoming: ["Chain rule application", "Optimization algorithms"],
        gapToProduction: 35,
        durationSeconds: 10,
      },
      goDeeperOptions: [
        {
          type: "video",
          title: "Watch: How ChatGPT Learns",
          durationMinutes: 3,
          url: "/videos/chatgpt-training",
        },
        {
          type: "ai_chat",
          title: "Ask AI Assistant",
          suggestions: [
            "How does this relate to my learning?",
            "Show me the math step-by-step",
            "What makes backprop so powerful?",
            "How can I practice this myself?",
          ],
        },
        {
          type: "article",
          title: "Read Full Technical Case Study",
          durationMinutes: 8,
          url: "/insights/chatgpt-backpropagation",
        },
        {
          type: "demo",
          title: "Try Interactive Backprop Visualizer",
          url: "/demos/backprop-visualizer",
        },
      ],
    },
  }

  const handleViewAllGLOs = () => {
    console.log("[v0] View all GLOs")
    onNavigate?.("all-glos")
  }

  const handleViewFullMatrix = () => {
    console.log("[v0] View full taxonomy matrix")
    onNavigate?.("mastery-progress")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <WelcomeHeader
          firstName={learner.firstName}
          studentId={studentCode || learner.id}
          language={locale}
          progress={progress}
        />

        {/* Real-World Insight Card */}
        {showDailyInsight && (
          <RealWorldInsightCard insight={dailyInsight} language={locale} onDismiss={() => setShowDailyInsight(false)} />
        )}

        {studentId && (
          <Collapsible open={isAssessmentSectionOpen} onOpenChange={setIsAssessmentSectionOpen}>
            <Card className="overflow-hidden border-blue-200 bg-blue-50">
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between p-4 hover:bg-blue-100/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-600 rounded-lg p-2">
                      <ClipboardCheck className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900">{t("dashboard.upcomingAssessment")}</h3>
                      <p className="text-sm text-gray-600">View your next assessment and check readiness</p>
                    </div>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-gray-600 transition-transform duration-200 ${
                      isAssessmentSectionOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-4">
                  <UpcomingAssessmentCard
                    studentId={studentId}
                    onStartAssessment={(assessmentId) => {
                      console.log("[v0] Starting assessment:", assessmentId)
                      onNavigate?.("assessment")
                    }}
                    onGenerateReadinessCheck={(assessmentId) => {
                      console.log("[v0] Opening readiness check modal for:", assessmentId)
                      setSelectedAssessmentId(assessmentId)
                      setShowReadinessGenerator(true)
                    }}
                  />
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )}

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900">{t("dashboard.yourLearningPath")}</h2>
          </div>

          {inProgressGLOs.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                {t("dashboard.continueLearning")}
              </h3>
              <div className="space-y-3">
                {inProgressGLOs.map((dashboardGLO) => (
                  <div key={dashboardGLO.glo.id} className="border-l-4 border-orange-400 pl-4">
                    <GLOCard
                      glo={dashboardGLO.glo}
                      progress={dashboardGLO.progress}
                      onStartContinue={onStartContinue}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {recommendedGLO && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                {t("dashboard.nextRecommended")}
              </h3>
              <RecommendedGLOCard dashboardGLO={recommendedGLO} onStartContinue={onStartContinue} />
            </div>
          )}

          {/* Other GLOs */}
          {otherGLOs.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                {t("dashboard.moreLearning")}
              </h3>
              <div className="space-y-3">
                {otherGLOs.slice(0, 3).map((dashboardGLO) => (
                  <GLOCard
                    key={dashboardGLO.glo.id}
                    glo={dashboardGLO.glo}
                    progress={dashboardGLO.progress}
                    onStartContinue={onStartContinue}
                  />
                ))}
              </div>
            </div>
          )}

          {/* View All Button */}
          <Button variant="outline" className="w-full bg-transparent cursor-pointer" onClick={handleViewAllGLOs}>
            {t("dashboard.viewAllGLOs")}
          </Button>
        </div>

        {/* Quick Links section at the bottom */}
        <Card className="p-6 bg-white shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("dashboard.quickLinks.title")}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="justify-start h-auto py-3 px-4 cursor-pointer bg-transparent"
              onClick={() => onNavigate?.("assessment")}
            >
              <ClipboardCheck className="h-5 w-5 mr-3 text-blue-600" />
              <div className="text-left">
                <div className="font-semibold text-sm">{t("dashboard.quickLinks.goToAssessment")}</div>
                <div className="text-xs text-gray-500">{t("dashboard.quickLinks.testYourKnowledge")}</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start h-auto py-3 px-4 cursor-pointer bg-transparent"
              onClick={() => onNavigate?.("all-glos")}
            >
              <BookOpen className="h-5 w-5 mr-3 text-purple-600" />
              <div className="text-left">
                <div className="font-semibold text-sm">{t("dashboard.quickLinks.browseContent")}</div>
                <div className="text-xs text-gray-500">{t("dashboard.quickLinks.exploreAllLearning")}</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start h-auto py-3 px-4 cursor-pointer sm:col-span-2 bg-transparent"
              onClick={() => onNavigate?.("mastery-progress")}
            >
              <FileText className="h-5 w-5 mr-3 text-green-600" />
              <div className="text-left">
                <div className="font-semibold text-sm">{t("dashboard.quickLinks.progressReport")}</div>
                <div className="text-xs text-gray-500">{t("dashboard.quickLinks.viewDetailedProgress")}</div>
              </div>
            </Button>
          </div>
        </Card>
      </div>

      {studentId && selectedAssessmentId && (
        <ReadinessCheckModal
          assessmentId={selectedAssessmentId}
          studentId={studentId}
          open={showReadinessGenerator}
          onOpenChange={(open) => {
            setShowReadinessGenerator(open)
            if (!open) setSelectedAssessmentId(null)
          }}
        />
      )}

      <CollapsibleSidebar>
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card className="p-4 bg-white shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">{t("dashboard.quickStats")}</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Target className="h-4 w-4 text-purple-600" />
                  <span>{t("dashboard.totalGLOs")}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{progress.totalGLOsCompleted}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <span>{t("dashboard.inProgress")}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{inProgressGLOs.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Trophy className="h-4 w-4 text-green-600" />
                  <span>{t("dashboard.cellsMastered")}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {progress.cellsMastered}
                  <span className="text-xs text-gray-500">/24</span>
                </span>
              </div>
            </div>
          </Card>

          {/* Recent Activity */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">{t("dashboard.recentActivity")}</h3>
            <ActivityTimeline activities={recentActivity} />
          </div>

          {/* Mini Taxonomy Matrix */}
          <MiniTaxonomyMatrix cellScores={progress.cellScores} onViewFull={handleViewFullMatrix} />
        </div>
      </CollapsibleSidebar>
    </div>
  )
}
