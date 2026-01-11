"use client"

import { useTranslation } from "@/lib/i18n/use-translation"
import type { Course } from "@/types/academic"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createBrowserClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { Loader2, AlertCircle } from "lucide-react"

interface AssessmentsTabProps {
  course: Course
}

interface ClassWithSessions {
  id: string
  title: string
  description: string
  class_number: number
  sessions: {
    id: string
    title: string
    description: string
    estimated_minutes: number // Changed from duration_minutes to estimated_minutes to match database schema
  }[]
}

export function AssessmentsTab({ course }: AssessmentsTabProps) {
  const { t } = useTranslation()
  const [classes, setClasses] = useState<ClassWithSessions[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)

        const supabase = createBrowserClient()

        const { data: classesData, error: classesError } = await supabase
          .from("classes")
          .select(`
            id,
            title,
            description,
            class_number,
            sessions (
              id,
              title,
              description,
              estimated_minutes
            )
          `)
          .eq("course_id", course.id)
          .order("class_number", { ascending: true })

        if (classesError) throw classesError

        setClasses(classesData || [])
      } catch (err) {
        console.error("[v0] Error fetching assessments data:", err)
        setError(err instanceof Error ? err.message : "Failed to load assessments")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [course.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-lg font-semibold mb-2">Failed to load assessments</p>
        <p className="text-sm text-gray-600">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  if (!classes || classes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg font-semibold mb-2">No classes found</p>
        <p className="text-sm text-gray-600">Add classes to the Structure tab to create assessments</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Assessments</h2>
        <p className="text-gray-600 mt-1">Create and manage assessments for your course sessions</p>
      </div>

      <div className="space-y-6">
        {classes.map((classItem) => (
          <Card key={classItem.id} className="p-6">
            <div className="mb-4">
              <h3 className="font-semibold text-lg">{classItem.title}</h3>
              <p className="text-sm text-gray-600">{classItem.description}</p>
            </div>

            <div className="space-y-4">
              {classItem.sessions && classItem.sessions.length > 0 ? (
                classItem.sessions.map((session) => (
                  <Card key={session.id} className="p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{session.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{session.description}</p>
                        <p className="text-xs text-gray-500 mt-2">Duration: {session.estimated_minutes} minutes</p>
                      </div>
                      <Button size="sm" variant="outline" className="cursor-pointer bg-transparent">
                        Create Assessment
                      </Button>
                    </div>
                  </Card>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">No sessions yet for this class</p>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
