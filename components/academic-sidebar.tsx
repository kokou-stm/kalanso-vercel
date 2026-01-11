"use client"

import type React from "react"

import { useState } from "react"
import { useTranslation } from "@/lib/i18n/use-translation"
import type { Course } from "@/types/academic"
import { BookOpen, FolderOpen, Download, Settings, Search, MoreVertical, Edit, Trash2, Copy } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"

interface AcademicSidebarProps {
  courses: Course[]
  selectedCourseId?: string
  onSelectCourse: (courseId: string) => void
  onNavigate: (section: string) => void
  onDeleteCourse: (courseId: string) => void
}

export function AcademicSidebar({
  courses,
  selectedCourseId,
  onSelectCourse,
  onNavigate,
  onDeleteCourse,
}: AcademicSidebarProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDomain, setSelectedDomain] = useState("all")
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null)

  const filteredCourses = courses.filter((course) => {
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch =
      course.title.toLowerCase().includes(searchLower) ||
      (course.code && course.code.toLowerCase().includes(searchLower)) ||
      (course.description && course.description.toLowerCase().includes(searchLower))
    const matchesDomain = selectedDomain === "all" || course.domain === selectedDomain
    return matchesSearch && matchesDomain
  })

  const handleDelete = async () => {
    if (!deletingCourseId) return

    try {
      const response = await fetch(`/api/courses/${deletingCourseId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete course")
      }

      onDeleteCourse(deletingCourseId)
      setDeletingCourseId(null)
    } catch (error) {
      console.error("Error deleting course:", error)
      alert("Failed to delete course. Please try again.")
    }
  }

  const courseToDelete = courses.find((c) => c.id === deletingCourseId)

  const handleCopyCode = (code: string, e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(code)
    toast({
      title: t("academic.sidebar.codeCopied"),
      description: `${code} ${t("academic.sidebar.copiedToClipboard")}`,
    })
  }

  return (
    <div className="w-64 md:w-72 lg:w-80 border-r bg-gray-50 p-4 h-screen overflow-y-auto transition-all duration-300">
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">{t("academic.sidebar.title")}</h2>
      </div>

      {/* My Courses */}
      <div className="mb-6">
        <button
          onClick={() => onNavigate("courses")}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 mb-2 transition-colors duration-200"
        >
          <BookOpen className="w-4 h-4" />
          {t("academic.sidebar.myCourses")}
        </button>

        <div className="space-y-2 mb-3">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder={t("academic.sidebar.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 text-sm transition-all duration-200 focus:ring-2"
            />
          </div>
          <Select value={selectedDomain} onValueChange={setSelectedDomain}>
            <SelectTrigger className="h-9 text-sm transition-all duration-200">
              <SelectValue placeholder={t("academic.sidebar.allDomains")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("academic.sidebar.allDomains")}</SelectItem>
              <SelectItem value="Culinary">{t("academic.sidebar.culinary")}</SelectItem>
              <SelectItem value="IT & AI">{t("academic.sidebar.itAi")}</SelectItem>
              <SelectItem value="Healthcare">{t("academic.sidebar.healthcare")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {courses.length > 0 && (
          <div className="text-xs text-gray-500 mb-2 px-2">
            {filteredCourses.length} {t("academic.sidebar.of")} {courses.length} {t("academic.sidebar.courses")}
            {filteredCourses.length > 0 && <span className="ml-1">• {t("academic.sidebar.sortedByCode")}</span>}
          </div>
        )}

        <div className="space-y-1 ml-6">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <div
                key={course.id}
                className={`group relative rounded transition-all duration-200 ease-out ${
                  selectedCourseId === course.id
                    ? "bg-blue-100"
                    : "hover:shadow-md hover:-translate-y-1 hover:scale-[1.02]"
                }`}
              >
                <button
                  onClick={() => onSelectCourse(course.id)}
                  className={`block w-full text-left px-2 py-2 text-sm rounded transition-all duration-200 ${
                    selectedCourseId === course.id ? "text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {course.code && (
                    <div
                      onClick={(e) => handleCopyCode(course.code!, e)}
                      className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded px-1.5 py-0.5 mb-1 cursor-pointer hover:bg-blue-100 hover:border-blue-300 transition-all duration-200"
                      title={t("academic.sidebar.clickToCopy")}
                    >
                      {course.code}
                      <Copy className="w-3 h-3 opacity-60" />
                    </div>
                  )}
                  <div className="truncate pr-6">{course.title}</div>
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger
                    className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-gray-200 rounded"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="w-4 h-4 text-gray-600" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => console.log("Edit course:", course.id)}>
                      <Edit className="w-4 h-4 mr-2" />
                      {t("academic.sidebar.edit")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setDeletingCourseId(course.id)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {t("academic.sidebar.delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))
          ) : (
            <div className="text-xs text-gray-500 py-2 text-center">{t("academic.sidebar.noCoursesFound")}</div>
          )}
        </div>
      </div>

      {/* Content Library */}
      <button
        onClick={() => onNavigate("library")}
        className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 mb-4 w-full transition-colors duration-200"
      >
        <FolderOpen className="w-4 h-4" />
        {t("academic.sidebar.contentLibrary")}
      </button>

      {/* Import from LMS */}
      <button
        onClick={() => onNavigate("import")}
        className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 mb-4 w-full transition-colors duration-200"
      >
        <Download className="w-4 h-4" />
        {t("academic.sidebar.importFromLMS")}
      </button>

      {/* Settings */}
      <button
        onClick={() => onNavigate("settings")}
        className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 w-full transition-colors duration-200"
      >
        <Settings className="w-4 h-4" />
        {t("academic.sidebar.settings")}
      </button>

      <AlertDialog open={!!deletingCourseId} onOpenChange={(open) => !open && setDeletingCourseId(null)}>
        <AlertDialogContent className="transition-all duration-200">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("academic.sidebar.confirmDelete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {courseToDelete?.code
                ? `${t("academic.sidebar.confirmDeleteMessage")} "${courseToDelete.code}: ${courseToDelete.title}"?`
                : `${t("academic.sidebar.confirmDeleteMessage")} "${courseToDelete?.title}"?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="transition-colors duration-200">
              {t("academic.createCourse.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 transition-colors duration-200"
            >
              {t("academic.sidebar.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
