import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: courses, error } = await supabase
      .from("courses")
      .select("id, course_code, title, description, domain, class_count, student_count")
      .order("course_code", { ascending: true })

    if (error) {
      console.error("[API] Supabase error:", error)
      throw error
    }

    // Transform to match API response format
    const transformedCourses = (courses || []).map((course) => ({
      id: course.id,
      courseCode: course.course_code || "",
      title: course.title,
      description: course.description || "",
      domain: course.domain || "General",
      classCount: course.class_count || 0,
      studentCount: course.student_count || 0,
    }))

    console.log(`[API] Successfully fetched ${transformedCourses.length} courses from database`)
    return NextResponse.json(transformedCourses, { status: 200 })
  } catch (error) {
    console.error("[API] Error fetching courses:", error)
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, description, domain, courseCode } = body

    // Validate required fields
    if (!title || !domain) {
      return NextResponse.json({ error: "Title and domain are required" }, { status: 400 })
    }

    // Validate title length
    if (title.length > 100) {
      return NextResponse.json({ error: "Title must be 100 characters or less" }, { status: 400 })
    }

    // Validate description length
    if (description && description.length > 500) {
      return NextResponse.json({ error: "Description must be 500 characters or less" }, { status: 400 })
    }

    if (courseCode && courseCode.length > 20) {
      return NextResponse.json({ error: "Course code must be 20 characters or less" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: course, error } = await supabase
      .from("courses")
      .insert({
        course_code: courseCode?.trim() || null,
        title: title.trim(),
        description: description?.trim() || null,
        domain: domain,
        class_count: 0,
        student_count: 0,
      })
      .select("id, course_code, title, description, domain, class_count, student_count")
      .single()

    if (error) {
      console.error("[API] Error creating course:", error)
      throw error
    }

    console.log("[API] Successfully created course:", course.course_code || course.id)

    // Transform to match API response format
    const transformedCourse = {
      id: course.id,
      courseCode: course.course_code || "",
      title: course.title,
      description: course.description || "",
      domain: course.domain,
      classCount: course.class_count || 0,
      studentCount: course.student_count || 0,
    }

    return NextResponse.json(transformedCourse, { status: 201 })
  } catch (error) {
    console.error("[API] Error creating course:", error)
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 })
  }
}
