import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      insight_id,
      student_id,
      viewed_teaser,
      expanded_level_1,
      reached_level,
      time_on_level_1,
      dismissed,
      dismissal_type,
      shared,
      completed_full_read,
      scroll_depth,
      sections_viewed,
      clicked_video,
      clicked_demo,
      opened_ai_chat,
    } = body

    if (!insight_id || !student_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createServerClient()

    try {
      const { data, error } = await supabase.from("insight_engagement").insert({
        insight_id,
        student_id,
        viewed_teaser: viewed_teaser || false,
        expanded_level_1: expanded_level_1 || false,
        reached_level: reached_level || 0,
        time_on_level_1: time_on_level_1 || 0,
        dismissed: dismissed || false,
        dismissal_type: dismissal_type || null,
        shared: shared || false,
        completed_full_read: completed_full_read || false,
        scroll_depth: scroll_depth || 0,
        sections_viewed: sections_viewed || [],
        clicked_video: clicked_video || false,
        clicked_demo: clicked_demo || false,
        opened_ai_chat: opened_ai_chat || false,
      })

      if (error) {
        console.error("[v0] Error inserting engagement:", error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, data })
    } catch (supabaseError: any) {
      // Handle missing table error from Supabase
      if (supabaseError.message?.includes("Could not find the table") || supabaseError.code === "PGRST205") {
        console.warn(
          "[v0] ⚠️ Feedback tables not yet created. Run scripts/create-insight-feedback-tables.sql to enable feedback storage.",
        )
        console.warn("[v0] Feedback data (not stored):", { insight_id, student_id, expanded_level_1, dismissed })
        return NextResponse.json({
          success: true,
          warning: "Tables not created yet",
          data: null,
        })
      }
      throw supabaseError
    }
  } catch (error: any) {
    console.error("[v0] Error in engagement API:", error.message)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
