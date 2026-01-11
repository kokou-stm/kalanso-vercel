import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { insight_id, student_id, feedback_type, section, category, comment, suggestion_text } = body

    if (!insight_id || !student_id || !feedback_type || !section) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createServerClient()

    try {
      // Insert feedback
      const { data, error } = await supabase.from("insight_feedback").insert({
        insight_id,
        student_id,
        feedback_type,
        section,
        category: category || null,
        comment: comment || null,
        suggestion_text: suggestion_text || null,
      })

      if (error) {
        console.error("[v0] Error inserting feedback:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      // Update quality scores asynchronously (in background)
      updateQualityScores(insight_id).catch((err) => {
        console.error("[v0] Error updating quality scores:", err)
      })

      return NextResponse.json({ success: true, data })
    } catch (supabaseError: any) {
      // Handle missing table error from Supabase
      if (supabaseError.message?.includes("Could not find the table") || supabaseError.code === "PGRST205") {
        console.warn(
          "[v0] ⚠️ Feedback tables not yet created. Run scripts/create-insight-feedback-tables.sql to enable feedback storage.",
        )
        console.warn("[v0] Feedback data (not stored):", { insight_id, student_id, feedback_type, section, category })
        // Return success to not break the UI
        return NextResponse.json({
          success: true,
          warning: "Tables not created yet",
          data: null,
        })
      }
      throw supabaseError
    }
  } catch (error: any) {
    console.error("[v0] Error in feedback API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function updateQualityScores(insight_id: string) {
  try {
    const supabase = await createServerClient()

    try {
      // Get all feedback for this insight
      const { data: feedbackData, error: feedbackError } = await supabase
        .from("insight_feedback")
        .select("*")
        .eq("insight_id", insight_id)

      if (feedbackError) {
        throw feedbackError
      }

      if (!feedbackData || feedbackData.length === 0) return

      // Calculate scores
      const thumbsUpCount = feedbackData.filter((f) => f.feedback_type === "thumbs_up").length
      const thumbsDownCount = feedbackData.filter((f) => f.feedback_type === "thumbs_down").length
      const totalFeedback = thumbsUpCount + thumbsDownCount

      const helpfulnessScore = totalFeedback > 0 ? thumbsUpCount / totalFeedback : 0.5

      // Get engagement data
      const { data: engagementData } = await supabase
        .from("insight_engagement")
        .select("*")
        .eq("insight_id", insight_id)

      const totalViews = engagementData?.length || 0
      const completedReads = engagementData?.filter((e) => e.completed_full_read).length || 0
      const shares = engagementData?.filter((e) => e.shared).length || 0
      const dismissals = engagementData?.filter((e) => e.dismissed).length || 0

      const completionRate = totalViews > 0 ? completedReads / totalViews : 0
      const shareRate = totalViews > 0 ? shares / totalViews : 0
      const dismissalRate = totalViews > 0 ? dismissals / totalViews : 0

      // Calculate overall score
      const engagementScore = completionRate
      const shareabilityScore = Math.min(shareRate / 0.1, 1.0) // 10% share rate = perfect
      const overallScore =
        helpfulnessScore * 0.4 + engagementScore * 0.3 + shareabilityScore * 0.2 + (1 - dismissalRate) * 0.1

      const confidence = Math.min(totalViews / 100, 1.0) // Need 100 views for full confidence

      // Upsert quality scores
      await supabase
        .from("insight_quality_scores")
        .upsert({
          insight_id,
          overall_score: overallScore,
          confidence,
          engagement_score: engagementScore,
          helpfulness_score: helpfulnessScore,
          shareability_score: shareabilityScore,
          thumbs_up_count: thumbsUpCount,
          thumbs_down_count: thumbsDownCount,
          share_count: shares,
          dismissal_count: dismissals,
          total_views: totalViews,
          total_feedback_items: totalFeedback,
          completion_rate: completionRate,
          last_calculated_at: new Date().toISOString(),
        })
        .eq("insight_id", insight_id)
    } catch (supabaseError: any) {
      // Handle missing table error silently in background operation
      if (supabaseError.message?.includes("Could not find the table") || supabaseError.code === "PGRST205") {
        console.warn("[v0] ⚠️ Skipping quality score update - tables not created yet")
        return
      }
      throw supabaseError
    }
  } catch (error) {
    console.error("[v0] Error in updateQualityScores:", error)
    // Don't throw - this is a background operation
  }
}
