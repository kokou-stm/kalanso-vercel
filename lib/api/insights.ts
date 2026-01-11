import { createClient } from "@/lib/supabase/client"
import type { Insight, InsightEngagement } from "@/types/insights"

export async function getDailyInsight(studentId: string): Promise<Insight | null> {
  const supabase = createClient()

  try {
    // 1. Get student's current bloom cell and mastery
    const { data: studentData } = await supabase
      .from("student_mastery")
      .select("bloom_cell, mastery_score")
      .eq("student_id", studentId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .single()

    if (!studentData) {
      console.log("[v0] No student mastery data found")
      return null
    }

    const { bloom_cell, mastery_score } = studentData

    // 2. Get recently viewed insights (past 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: recentViews } = await supabase
      .from("student_insight_views")
      .select("insight_id")
      .eq("student_id", studentId)
      .gte("viewed_at", thirtyDaysAgo.toISOString())

    const recentlyViewedIds = recentViews?.map((v) => v.insight_id) || []

    // 3. Query insights matching student's context
    let query = supabase.from("insights").select("*").eq("status", "published")

    // Filter out recently viewed
    if (recentlyViewedIds.length > 0) {
      query = query.not("id", "in", `(${recentlyViewedIds.join(",")})`)
    }

    const { data: insights } = await query

    if (!insights || insights.length === 0) {
      return null
    }

    // 4. Filter and rank insights based on relevance
    const relevantInsights = insights
      .filter((insight) => {
        const triggers = insight.triggers?.contextual
        if (!triggers) return false

        // Check if bloom cell matches
        const bloomMatch = triggers.bloom_cells?.includes(bloom_cell)

        // Check if mastery is in range
        const masteryInRange = mastery_score >= triggers.mastery_range[0] && mastery_score <= triggers.mastery_range[1]

        return bloomMatch && masteryInRange
      })
      .sort((a, b) => {
        // Prioritize by how closely mastery matches the middle of range
        const aMid = (a.triggers.contextual.mastery_range[0] + a.triggers.contextual.mastery_range[1]) / 2
        const bMid = (b.triggers.contextual.mastery_range[0] + b.triggers.contextual.mastery_range[1]) / 2
        return Math.abs(mastery_score - aMid) - Math.abs(mastery_score - bMid)
      })

    return relevantInsights[0] || insights[0] // Return best match or fallback to first
  } catch (error) {
    console.error("[v0] Error fetching daily insight:", error)
    return null
  }
}

export async function trackInsightView(params: {
  insightId: string
  studentId: string
  sessionId: string
  bloomCell: string
  mastery: number
  deviceType: string
}): Promise<string | null> {
  const supabase = createClient()

  try {
    // Insert into student_insight_views
    const { error: viewError } = await supabase.from("student_insight_views").insert({
      student_id: params.studentId,
      insight_id: params.insightId,
      bloom_cell: params.bloomCell,
      mastery_at_view: params.mastery,
      viewed_at: new Date().toISOString(),
    })

    if (viewError) throw viewError

    // Insert into insight_engagement
    const { data: engagement, error: engagementError } = await supabase
      .from("insight_engagement")
      .insert({
        insight_id: params.insightId,
        student_id: params.studentId,
        session_id: params.sessionId,
        bloom_cell: params.bloomCell,
        mastery_at_view: params.mastery,
        device_type: params.deviceType,
        viewed_teaser: true,
        expanded_level_1: false,
        reached_level: 0,
        created_at: new Date().toISOString(),
      })
      .select("id")
      .single()

    if (engagementError) throw engagementError

    return engagement?.id || null
  } catch (error) {
    console.error("[v0] Error tracking insight view:", error)
    return null
  }
}

export async function trackEngagement(params: {
  engagementId: string
  updates: Partial<InsightEngagement>
}): Promise<void> {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from("insight_engagement")
      .update({
        ...params.updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.engagementId)

    if (error) throw error
  } catch (error) {
    console.error("[v0] Error updating engagement:", error)
  }
}

export async function submitFeedback(params: {
  insightId: string
  studentId: string
  feedbackType: "thumbs_up" | "thumbs_down" | "suggestion"
  category?: string
  comment?: string
  bloomCell?: string
  mastery?: number
}): Promise<void> {
  const supabase = createClient()

  try {
    const { error } = await supabase.from("insight_feedback").insert({
      insight_id: params.insightId,
      student_id: params.studentId,
      feedback_type: params.feedbackType,
      category: params.category,
      comment: params.comment,
      bloom_cell: params.bloomCell,
      mastery_at_feedback: params.mastery,
      created_at: new Date().toISOString(),
    })

    if (error) throw error
  } catch (error) {
    console.error("[v0] Error submitting feedback:", error)
    throw error
  }
}

export async function trackShare(params: {
  insightId: string
  studentId: string
  platform: string
  motivation?: string
}): Promise<void> {
  const supabase = createClient()

  try {
    const { error } = await supabase.from("insight_shares").insert({
      insight_id: params.insightId,
      student_id: params.studentId,
      platform: params.platform,
      motivation: params.motivation,
      created_at: new Date().toISOString(),
    })

    if (error) throw error
  } catch (error) {
    console.error("[v0] Error tracking share:", error)
  }
}
