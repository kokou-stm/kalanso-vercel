"use client"

import { useState, useEffect } from "react"
import { BookOpen, Dumbbell, CheckCircle2 } from "lucide-react"
import { StudyHeader } from "@/components/study-header"
import { ContentTab } from "@/components/content-tab"
import { PracticeTab } from "@/components/practice-tab"
import { AssessmentTab } from "@/components/assessment-tab"
import { StudySidebar } from "@/components/study-sidebar"
import { useTranslation } from "@/lib/i18n/use-translation"
import type { GLOStudyViewProps } from "@/types/glo"

type TabType = "content" | "practice" | "assessment"

export function GLOStudyView({ glo, progress, onComplete, onAssessmentSubmit, onBackToDashboard }: GLOStudyViewProps) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<TabType>("content")
  const [timeSpent, setTimeSpent] = useState(progress.timeSpent)

  console.log("[v0] GLOStudyView rendered with glo:", glo.title)
  console.log("[v0] Has content?", !!glo.contentModules)
  console.log("[v0] Has practice?", !!glo.practiceExercises)
  console.log("[v0] Has assessment?", !!glo.assessmentQuestions)

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent((prev) => prev + 1)
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const tabs = [
    { id: "content" as TabType, label: t("glo.progress.content"), icon: BookOpen },
    { id: "practice" as TabType, label: t("glo.progress.practice"), icon: Dumbbell },
    { id: "assessment" as TabType, label: t("glo.progress.assessment"), icon: CheckCircle2 },
  ]

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
  }

  const handleSectionComplete = (section: "content" | "practice" | "assessment") => {
    onComplete(section)
    if (section === "content") setActiveTab("practice")
    if (section === "practice") setActiveTab("assessment")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StudyHeader glo={glo} progress={progress} onBack={onBackToDashboard} />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border mb-6">
              <div className="flex border-b">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`flex-1 px-6 py-4 font-medium transition-colors flex items-center justify-center gap-2 ${
                        activeTab === tab.id
                          ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-8">
              {activeTab === "content" && (
                <ContentTab
                  content={glo.contentModules || []}
                  isCompleted={progress.contentCompleted}
                  onMarkComplete={() => handleSectionComplete("content")}
                />
              )}

              {activeTab === "practice" && (
                <PracticeTab
                  practice={glo.practiceExercises || []}
                  isCompleted={progress.practiceCompleted}
                  onSubmitPractice={() => handleSectionComplete("practice")}
                />
              )}

              {activeTab === "assessment" && (
                <AssessmentTab
                  questions={glo.assessmentQuestions || []}
                  masteryThreshold={glo.masteryThreshold}
                  gloTitle={glo.title}
                  taxonomyCell={glo.taxonomyCell}
                  isCompleted={progress.assessmentCompleted}
                  currentScore={progress.currentScore}
                  attempts={progress.attempts}
                  onAssessmentSubmit={onAssessmentSubmit}
                />
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <StudySidebar glo={glo} progress={progress} timeSpent={timeSpent} onBackToDashboard={onBackToDashboard} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
