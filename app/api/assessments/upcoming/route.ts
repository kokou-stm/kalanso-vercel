import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { generateReadinessPrediction, getRecentPracticeSummary } from "@/lib/api/readinessPrediction"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const studentId = searchParams.get("studentId")

    console.log("[v0] Upcoming assessment API called with studentId:", studentId)

    if (!studentId) {
      return NextResponse.json({ error: "Student ID required" }, { status: 400 })
    }

    const supabase = await createServerClient()

    // 1. Get next upcoming assessment
    console.log("[v0] Fetching upcoming assessment...")
    const { data: assessment, error: assessmentError } = await supabase
      .from("assessments")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (assessmentError) {
      console.error("[v0] Assessment fetch error:", assessmentError)
      return NextResponse.json({ data: null })
    }

    if (!assessment) {
      console.log("[v0] No upcoming assessments found")
      return NextResponse.json({ data: null })
    }

    console.log("[v0] Found assessment:", assessment.title)

    // 2. Get AI prediction
    console.log("[v0] Generating AI prediction...")
    let prediction = null
    try {
      prediction = await generateReadinessPrediction(studentId, assessment.id)
      console.log("[v0] Prediction complete:", prediction)
    } catch (predictionError) {
      console.error("[v0] Failed to generate prediction:", predictionError)
      // Continue without prediction rather than failing entirely
    }

    // 3. Get recent practice
    console.log("[v0] Fetching recent practice...")
    let recentPractice = null
    try {
      const practiceData = await getRecentPracticeSummary(studentId, assessment.glo_id)
      console.log("[v0] Recent practice complete:", practiceData)

      recentPractice = {
        count: practiceData.totalSessions,
        avgAccuracy: practiceData.averageScore,
        totalTime: 0, // Not tracked in current implementation
        lastSession: practiceData.lastPracticed,
      }
    } catch (practiceError) {
      console.error("[v0] Failed to fetch practice summary:", practiceError)
      recentPractice = {
        count: 0,
        avgAccuracy: 0,
        totalTime: 0,
        lastSession: null,
      }
    }

    // 4. Get mastery
    console.log("[v0] Fetching mastery data...")
    const { data: mastery } = await supabase
      .from("student_mastery")
      .select("overall_mastery, successful_practice_streak")
      .eq("student_id", studentId)
      .eq("glo_id", assessment.glo_id)
      .single()

    console.log("[v0] Mastery data:", mastery)

    const responseData = {
      assessment,
      prediction,
      recentPractice,
      mastery: mastery || { overall_mastery: 0, successful_practice_streak: 0 },
    }

    console.log("[v0] Returning assessment data successfully")

    return NextResponse.json({ data: responseData })
  } catch (error) {
    console.error("[v0] Error in upcoming assessment API:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load assessment" },
      { status: 500 },
    )
  }
}
