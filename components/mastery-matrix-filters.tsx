"use client"

import { useState } from "react"
import { X, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useTranslation } from "@/lib/i18n/use-translation"

export interface MasteryFilterState {
  courseId: string | null
  classId: string | null
  sessionId: string | null
  dateRange: { from: Date | null; to: Date | null }
}

export interface MasteryMatrixFiltersProps {
  courses: Array<{ id: string; title: string; code: string }>
  classes: Array<{ id: string; title: string; order: number }>
  sessions: Array<{ id: string; title: string; order: number }>
  filters: MasteryFilterState
  onFiltersChange: (filters: MasteryFilterState) => void
  totalObjectives: number
  filteredObjectives: number
}

export function MasteryMatrixFilters({
  courses,
  classes,
  sessions,
  filters,
  onFiltersChange,
  totalObjectives,
  filteredObjectives,
}: MasteryMatrixFiltersProps) {
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(true)

  const hasActiveFilters =
    filters.courseId !== null ||
    filters.classId !== null ||
    filters.sessionId !== null ||
    filters.dateRange.from !== null ||
    filters.dateRange.to !== null

  const handleClearAll = () => {
    onFiltersChange({
      courseId: null,
      classId: null,
      sessionId: null,
      dateRange: { from: null, to: null },
    })
  }

  const handleRemoveFilter = (filterKey: keyof MasteryFilterState) => {
    if (filterKey === "dateRange") {
      onFiltersChange({ ...filters, dateRange: { from: null, to: null } })
    } else {
      onFiltersChange({ ...filters, [filterKey]: null })
    }
  }

  const getFilterLabel = (key: keyof MasteryFilterState, value: any) => {
    if (key === "courseId") {
      const course = courses.find((c) => c.id === value)
      return course ? `${t("masteryFilters.course")}: ${course.code}` : ""
    }
    if (key === "classId") {
      const classItem = classes.find((c) => c.id === value)
      return classItem ? `${t("masteryFilters.class")}: ${classItem.order}` : ""
    }
    if (key === "sessionId") {
      const session = sessions.find((s) => s.id === value)
      return session ? `${t("masteryFilters.session")}: ${session.title.substring(0, 20)}...` : ""
    }
    return ""
  }

  return (
    <div className="space-y-4 bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Filter Bar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">{t("masteryFilters.title")}</h3>
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2">
              {
                [
                  filters.courseId,
                  filters.classId,
                  filters.sessionId,
                  filters.dateRange.from || filters.dateRange.to,
                ].filter(Boolean).length
              }{" "}
              {t("masteryFilters.activeFilters")}
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-600 hover:text-gray-900"
        >
          {isExpanded ? t("masteryFilters.collapse") : t("masteryFilters.expand")}
        </Button>
      </div>

      {/* Filter Controls */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Filter Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Course Dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{t("masteryFilters.course")}</label>
              <Select
                value={filters.courseId || "all"}
                onValueChange={(value) => onFiltersChange({ ...filters, courseId: value === "all" ? null : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("masteryFilters.allCourses")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("masteryFilters.allCourses")}</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.code}: {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Class Dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{t("masteryFilters.class")}</label>
              <Select
                value={filters.classId || "all"}
                onValueChange={(value) => onFiltersChange({ ...filters, classId: value === "all" ? null : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("masteryFilters.allClasses")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("masteryFilters.allClasses")}</SelectItem>
                  {classes.map((classItem) => (
                    <SelectItem key={classItem.id} value={classItem.id}>
                      {t("masteryFilters.class")} {classItem.order}: {classItem.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Session Dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{t("masteryFilters.session")}</label>
              <Select
                value={filters.sessionId || "all"}
                onValueChange={(value) => onFiltersChange({ ...filters, sessionId: value === "all" ? null : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("masteryFilters.allSessions")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("masteryFilters.allSessions")}</SelectItem>
                  {sessions.map((session) => (
                    <SelectItem key={session.id} value={session.id}>
                      {session.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-sm text-gray-600">
              {t("masteryFilters.showing")} <span className="font-semibold text-purple-600">{filteredObjectives}</span>{" "}
              {t("masteryFilters.objectives")}{" "}
              {hasActiveFilters && (
                <span>
                  ({t("masteryFilters.filteredFrom")} {totalObjectives} {t("masteryFilters.total")})
                </span>
              )}
            </div>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={handleClearAll} className="text-gray-600 bg-transparent">
                {t("masteryFilters.clearAll")}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Active Filter Pills */}
      {hasActiveFilters && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-4">
          <div className="flex flex-wrap gap-2">
            {filters.courseId && (
              <Badge variant="secondary" className="gap-1 pr-1">
                {getFilterLabel("courseId", filters.courseId)}
                <button
                  onClick={() => handleRemoveFilter("courseId")}
                  className="ml-1 rounded-full hover:bg-gray-300 p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.classId && (
              <Badge variant="secondary" className="gap-1 pr-1">
                {getFilterLabel("classId", filters.classId)}
                <button
                  onClick={() => handleRemoveFilter("classId")}
                  className="ml-1 rounded-full hover:bg-gray-300 p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.sessionId && (
              <Badge variant="secondary" className="gap-1 pr-1">
                {getFilterLabel("sessionId", filters.sessionId)}
                <button
                  onClick={() => handleRemoveFilter("sessionId")}
                  className="ml-1 rounded-full hover:bg-gray-300 p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
