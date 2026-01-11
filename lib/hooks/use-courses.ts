"use client"

import { useState, useEffect } from "react"
import type { Course } from "@/types/academic"

interface APICourseResponse {
  id: string
  courseCode: string
  title: string
  description: string
  domain: string
  classCount: number
  studentCount: number
}

interface UseCoursesResult {
  courses: Course[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useCourses(): UseCoursesResult {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCourses = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/courses", {
        method: "GET",
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch courses: ${response.status} ${response.statusText}`)
      }

      const data: APICourseResponse[] = await response.json()

      const transformedCourses: Course[] = data.map((apiCourse) => ({
        id: apiCourse.id,
        title: apiCourse.title,
        code: apiCourse.courseCode || `COURSE-${apiCourse.id.substring(0, 8).toUpperCase()}`,
        description: apiCourse.description,
        status: apiCourse.studentCount > 0 ? "active" : "draft",
        term: "Current",
        createdAt: new Date(),
        updatedAt: new Date(),
        enrolledStudents: apiCourse.studentCount,
        classes: [],
      }))

      setCourses(transformedCourses)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
      console.error("[v0] Error fetching courses:", errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  return {
    courses,
    loading,
    error,
    refetch: fetchCourses,
  }
}
