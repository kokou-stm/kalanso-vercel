import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { student_id, assessment_id, mode, options } = await request.json()

    const supabase = createServerClient()

    // Fetch assessment details
    const { data: assessment } = await supabase
      .from("sessions")
      .select("*, learning_objectives(*)")
      .eq("id", assessment_id)
      .single()

    // Mock: Generate practice questions mirroring the real assessment
    const questions = Array.from({ length: 20 }, (_, i) => ({
      id: `q_${i + 1}`,
      type: ["multiple_choice_single", "true_false", "short_answer"][Math.floor(Math.random() * 3)],
      question: `Practice question ${i + 1} about ${assessment?.title}`,
      cellCode: `${Math.floor(Math.random() * 4) + 1}${String.fromCharCode(65 + Math.floor(Math.random() * 4))}`,
      points: 5,
      difficulty: ["easy", "medium", "hard"][Math.floor(Math.random() * 3)],
      explanation: "Detailed explanation will be shown after answering.",
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: Math.floor(Math.random() * 4),
    }))

    // Get current prediction based on recent progress
    const { data: recentProgress } = await supabase
      .from("student_session_progress")
      .select("mastery_score")
      .eq("student_id", student_id)
      .order("last_attempt_at", { ascending: false })
      .limit(3)

    const avgScore = recentProgress?.length
      ? recentProgress.reduce((sum, p) => sum + (p.mastery_score || 0), 0) / recentProgress.length
      : 70

    return NextResponse.json({
      readiness_check_id: `rc_${Date.now()}`,
      questions,
      estimated_time_minutes: mode === "timed" ? 60 : null,
      current_prediction: {
        score_prediction: avgScore / 100,
        confidence: avgScore >= 75 ? "high" : avgScore >= 65 ? "medium" : "low",
        readiness_status: avgScore >= 80 ? "ready" : avgScore >= 70 ? "almost_ready" : "not_ready",
      },
    })
  } catch (error) {
    console.error("[v0] Error generating readiness check:", error)
    return NextResponse.json({ error: "Failed to generate readiness check" }, { status: 500 })
  }
}
