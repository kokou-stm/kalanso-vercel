"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { useTranslation } from "@/lib/i18n/use-translation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Circle, Lock, Star, ChevronRight, Award } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface Enrollment {
  id: string
  course_id: string
  enrolled_at: string
  current_session_id: string | null
  overall_progress: number
  status: string
  courses: {
    id: string
    title: string
    course_code: string
    class_count: number
  }
}

interface SessionProgress {
  id: string
  session_id: string
  status: "locked" | "current" | "completed" | "mastered"
  mastery_score: number
  attempts: number
  last_attempt_at: string | null
  completed_at: string | null
  sessions: {
    id: string
    title: string
    description: string
    sequence_order: number
    class_id: string
    estimated_minutes: number
  }
}

interface StudentDashboardTimelineProps {
  studentId: string
}

export function StudentDashboardTimeline({ studentId }: StudentDashboardTimelineProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [progressData, setProgressData] = useState<Record<string, SessionProgress[]>>({})
  const [loading, setLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [studentId])

  const fetchData = async () => {
    setLoading(true)
    const supabase = createBrowserClient()

    try {
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from("student_enrollments")
        .select("*, courses(*)")
        .eq("student_id", studentId)

      if (enrollmentsError) throw enrollmentsError

      setEnrollments(enrollmentsData || [])

      const { data: progressDataRaw, error: progressError } = await supabase
        .from("student_session_progress")
        .select("*, sessions(*)")
        .eq("student_id", studentId)

      if (progressError) throw progressError

      const grouped: Record<string, SessionProgress[]> = {}
      for (const prog of progressDataRaw || []) {
        const courseId = prog.sessions?.class_id
        if (courseId) {
          if (!grouped[courseId]) grouped[courseId] = []
          grouped[courseId].push(prog as SessionProgress)
        }
      }

      for (const courseId in grouped) {
        grouped[courseId].sort((a, b) => a.sessions.sequence_order - b.sessions.sequence_order)
      }

      setProgressData(grouped)

      if (enrollmentsData && enrollmentsData.length > 0 && !selectedCourse) {
        setSelectedCourse(enrollmentsData[0].course_id)
      }
    } catch (error) {
      console.error("[v0] Error fetching student data:", error)
      toast({
        title: t("common.error"),
        description: "Failed to load student progress",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "mastered":
        return <Star className="w-5 h-5 text-purple-500 fill-purple-500" />
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case "current":
        return <Circle className="w-5 h-5 text-blue-500 fill-blue-500" />
      case "locked":
        return <Lock className="w-5 h-5 text-gray-400" />
      default:
        return <Circle className="w-5 h-5 text-gray-300" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "mastered":
        return (
          <Badge className="bg-purple-100 text-purple-700 border-purple-200">
            {t("academic.students.timeline.mastered")}
          </Badge>
        )
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            {t("academic.students.timeline.completed")}
          </Badge>
        )
      case "current":
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">{t("academic.students.timeline.current")}</Badge>
        )
      case "locked":
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-600">
            {t("academic.students.timeline.locked")}
          </Badge>
        )
      default:
        return null
    }
  }

  const currentEnrollment = enrollments.find((e) => e.course_id === selectedCourse)
  const currentProgress = selectedCourse ? progressData[selectedCourse] || [] : []

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (enrollments.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-gray-500">{t("academic.students.timeline.noEnrollments")}</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Course Selection */}
      <div className="flex gap-2 flex-wrap">
        {enrollments.map((enrollment) => (
          <Button
            key={enrollment.id}
            variant={selectedCourse === enrollment.course_id ? "default" : "outline"}
            onClick={() => setSelectedCourse(enrollment.course_id)}
            className="cursor-pointer"
          >
            {enrollment.courses.course_code}: {enrollment.courses.title}
          </Button>
        ))}
      </div>

      {/* Course Overview Card */}
      {currentEnrollment && (
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-bold">{currentEnrollment.courses.title}</h3>
              <p className="text-sm text-gray-600 mt-1">
                {t("academic.students.timeline.enrolled")}:{" "}
                {new Date(currentEnrollment.enrolled_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{currentEnrollment.overall_progress}%</div>
                <div className="text-sm text-gray-600">{t("academic.students.timeline.overallProgress")}</div>
              </div>
              <Badge
                variant={currentEnrollment.status === "active" ? "default" : "secondary"}
                className="text-sm px-3 py-1"
              >
                {currentEnrollment.status}
              </Badge>
            </div>
          </div>
        </Card>
      )}

      {/* Timeline */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">{t("academic.students.timeline.sessionProgress")}</h3>

        {currentProgress.length === 0 ? (
          <p className="text-center text-gray-500 py-8">{t("academic.students.timeline.noProgress")}</p>
        ) : (
          <div className="space-y-6">
            {currentProgress.map((progress, index) => {
              const isLast = index === currentProgress.length - 1

              return (
                <div key={progress.id} className="flex gap-4">
                  {/* Timeline Column */}
                  <div className="flex flex-col items-center">
                    <div className="relative z-10">{getStatusIcon(progress.status)}</div>
                    {!isLast && <div className="w-0.5 flex-1 bg-gray-200 mt-2" />}
                  </div>

                  {/* Content Column */}
                  <div className="flex-1 pb-6">
                    <Card
                      className={cn(
                        "p-4 transition-all hover:shadow-md",
                        progress.status === "current" && "border-blue-500 border-2",
                        progress.status === "mastered" && "border-purple-500",
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold">{progress.sessions.title}</h4>
                            {getStatusBadge(progress.status)}
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{progress.sessions.description}</p>

                          <div className="flex items-center gap-6 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Award className="w-4 h-4" />
                              <span>
                                {t("academic.students.timeline.mastery")}: {progress.mastery_score}%
                              </span>
                            </div>
                            <div>
                              {t("academic.students.timeline.attempts")}: {progress.attempts}
                            </div>
                            {progress.sessions.estimated_minutes && (
                              <div>
                                {progress.sessions.estimated_minutes} {t("academic.structure.minutes")}
                              </div>
                            )}
                          </div>

                          {progress.completed_at && (
                            <p className="text-xs text-gray-500 mt-2">
                              {t("academic.students.timeline.completedOn")}:{" "}
                              {new Date(progress.completed_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>

                        {progress.status === "current" && (
                          <Button size="sm" className="cursor-pointer ml-4">
                            {t("academic.students.timeline.continue")}
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        )}
                      </div>
                    </Card>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
