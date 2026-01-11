"use client"

import { useState } from "react"
import { useTranslation } from "@/lib/i18n/use-translation"
import type { Course } from "@/types/academic"
import { AcademicSidebar } from "@/components/academic-sidebar"
import { CreateCourseModal } from "@/components/create-course-modal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus, Menu, X } from "lucide-react"
import { StructureTab } from "@/components/academic-space/structure-tab"
import { ContentMappingTab } from "@/components/academic-space/content-mapping-tab"
import { LearningGoalsTab } from "@/components/academic-space/learning-goals-tab"
import { AssessmentsTab } from "@/components/academic-space/assessments-tab"
import { StudentsTab } from "@/components/academic-space/students-tab"
import { EmptyStateWithHelp } from "@/lib/help/HelpModal"
import { BookOpen } from "lucide-react"

interface AcademicSpaceProps {
  courses: Course[]
  onNavigate: (section: string) => void
  onRefresh: () => void
  language: string
}

export function AcademicSpace({ courses, onNavigate, onRefresh, language }: AcademicSpaceProps) {
  const { t } = useTranslation()
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id)
  const [activeTab, setActiveTab] = useState("structure")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const selectedCourse = courses.find((c) => c.id === selectedCourseId)

  if (courses.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <EmptyStateWithHelp
          section="dashboard"
          item="emptyState"
          language={language}
          icon={<BookOpen className="h-12 w-12 text-gray-400" />}
          primaryAction={{
            label:
              language === "fr"
                ? "Créer Votre Premier Cours"
                : language === "de"
                  ? "Ihren Ersten Kurs Erstellen"
                  : "Create Your First Course",
            onClick: () => setIsCreateModalOpen(true),
          }}
          secondaryAction={{
            label: language === "fr" ? "En savoir plus" : language === "de" ? "Mehr erfahren" : "Learn more",
            onClick: () => {}, // This would open help if there was a help panel in this context
          }}
        />
        <CreateCourseModal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          onSuccess={onRefresh}
          courses={courses}
        />
      </div>
    )
  }

  const handleDeleteCourse = (courseId: string) => {
    // If the deleted course was selected, select another course
    if (courseId === selectedCourseId && courses.length > 1) {
      const remainingCourses = courses.filter((c) => c.id !== courseId)
      setSelectedCourseId(remainingCourses[0]?.id)
    }
    // Refresh the courses list
    onRefresh()
  }

  const handleSelectCourse = (courseId: string) => {
    setSelectedCourseId(courseId)
    setIsMobileSidebarOpen(false)
  }

  if (!selectedCourse) {
    return (
      <div className="flex h-screen relative">
        <div className="hidden md:block">
          <AcademicSidebar
            courses={courses}
            selectedCourseId={selectedCourseId}
            onSelectCourse={handleSelectCourse}
            onNavigate={onNavigate}
            onDeleteCourse={handleDeleteCourse}
          />
        </div>

        {isMobileSidebarOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 z-50 md:hidden transform transition-transform duration-300">
              <AcademicSidebar
                courses={courses}
                selectedCourseId={selectedCourseId}
                onSelectCourse={handleSelectCourse}
                onNavigate={onNavigate}
                onDeleteCourse={handleDeleteCourse}
              />
            </div>
          </>
        )}

        <div className="flex-1 flex flex-col items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden fixed top-4 left-4 z-30"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          >
            {isMobileSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>

          <div className="text-center px-4">
            <h2 className="text-2xl font-bold mb-2">{t("academic.noCourseSelected")}</h2>
            <p className="text-gray-600">{t("academic.selectCourseHint")}</p>
          </div>
        </div>
        <CreateCourseModal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          onSuccess={onRefresh}
          courses={courses}
        />
      </div>
    )
  }

  return (
    <div className="flex h-screen relative">
      <div className="hidden md:block">
        <AcademicSidebar
          courses={courses}
          selectedCourseId={selectedCourseId}
          onSelectCourse={handleSelectCourse}
          onNavigate={onNavigate}
          onDeleteCourse={handleDeleteCourse}
        />
      </div>

      {isMobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 md:hidden transform transition-transform duration-300">
            <AcademicSidebar
              courses={courses}
              selectedCourseId={selectedCourseId}
              onSelectCourse={handleSelectCourse}
              onNavigate={onNavigate}
              onDeleteCourse={handleDeleteCourse}
            />
          </div>
        </>
      )}

      <div className="flex-1 overflow-hidden">
        <div className="p-4 md:p-6 border-b bg-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">{selectedCourse.title}</h1>
              <p className="text-sm text-gray-600">{selectedCourse.code}</p>
            </div>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)} className="cursor-pointer">
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">{t("academic.createCourse.button")}</span>
            <span className="sm:hidden">{t("academic.createCourse.buttonShort") || "Create"}</span>
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <div className="border-b bg-white px-4 md:px-6 overflow-x-auto">
            <TabsList className="h-12 w-full md:w-auto">
              <TabsTrigger value="structure" className="text-xs md:text-sm">
                {t("academic.tabs.structure")}
              </TabsTrigger>
              <TabsTrigger value="content" className="text-xs md:text-sm">
                {t("academic.tabs.contentMapping")}
              </TabsTrigger>
              <TabsTrigger value="goals" className="text-xs md:text-sm">
                {t("academic.tabs.learningGoals")}
              </TabsTrigger>
              <TabsTrigger value="assessments" className="text-xs md:text-sm">
                {t("academic.tabs.assessments")}
              </TabsTrigger>
              <TabsTrigger value="students" className="text-xs md:text-sm">
                {t("academic.tabs.students")}
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-4 md:p-6 overflow-y-auto" style={{ height: "calc(100vh - 180px)" }}>
            <TabsContent value="structure" className="mt-0">
              <StructureTab
                course={selectedCourse}
                onSave={(changes) => {
                  console.log("[v0] Saving structure changes:", changes)
                  onRefresh()
                }}
              />
            </TabsContent>

            <TabsContent value="content" className="mt-0">
              <ContentMappingTab
                course={selectedCourse}
                onSave={() => {
                  console.log("[v0] Content mapping changed")
                  onRefresh()
                }}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            </TabsContent>

            <TabsContent value="goals" className="mt-0">
              <LearningGoalsTab
                course={selectedCourse}
                onAddGoal={(id) => console.log("Add goal", id)}
                onUpdateGoal={(id, updates) => console.log("Update goal", id, updates)}
                onAISuggest={(id) => console.log("AI suggest", id)}
              />
            </TabsContent>

            <TabsContent value="assessments" className="mt-0">
              <AssessmentsTab course={selectedCourse} />
            </TabsContent>

            <TabsContent value="students" className="mt-0">
              <StudentsTab course={selectedCourse} />
            </TabsContent>
          </div>
        </Tabs>
        <CreateCourseModal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          onSuccess={onRefresh}
          courses={courses}
        />
      </div>
    </div>
  )
}
