"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { DEMO_STUDENT } from "@/lib/constants/demo"

interface Student {
  id: string // UUID
  student_code: string // Human-readable
  first_name: string
  last_name: string
  email: string
}

export function useStudent() {
  const [student, setStudent] = useState<Student | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadStudent() {
      try {
        const supabase = createClient()

        // Try to get authenticated user
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          // Fetch student record by auth_user_id
          const { data } = await supabase
            .from("students")
            .select("id, student_code, first_name, last_name, email")
            .eq("auth_user_id", user.id)
            .single()

          if (data) {
            setStudent(data)
            return
          }
        }

        // Fall back to demo student for MVP
        setStudent(DEMO_STUDENT)
      } catch (error) {
        console.error("Error loading student:", error)
        // Use demo student on error
        setStudent(DEMO_STUDENT)
      } finally {
        setIsLoading(false)
      }
    }

    loadStudent()
  }, [])

  return {
    student,
    isLoading,
    // Convenient getters
    studentId: student?.id ?? null, // UUID for API calls
    studentCode: student?.student_code ?? null, // Readable for display
    studentName: student ? `${student.first_name} ${student.last_name}` : null,
  }
}
