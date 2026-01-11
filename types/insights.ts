export interface Insight {
  id: string
  title: string
  teaser: string
  teaser_icon: string
  category: string
  level_1_content: {
    what: string
    how: {
      diagram_svg?: string
      diagram_type: "flow_chart" | "network" | "comparison"
      steps: Array<{
        step_number: number
        title: string
        description: string
        bloom_level: string
        is_current_step: boolean
      }>
    }
    why: {
      scale_of_use: string[]
      specific_impact: {
        challenge: string
        solution: string[]
        difference: Array<{
          metric: string
          before: string
          after: string
        }>
        human_impact: string
      }
    }
    connection: {
      bloom_cells: string[]
      mastery_range: [number, number]
      template: string
    }
    go_deeper: Array<{
      type: "video" | "ai_chat" | "article" | "demo"
      title: string
      url?: string
      duration_seconds?: number
    }>
  }
  triggers: {
    contextual: {
      content_domains: string[]
      bloom_cells: string[]
      mastery_range: [number, number]
    }
  }
  status: "published" | "draft" | "archived"
  created_at?: string
  updated_at?: string
}

export interface InsightEngagement {
  id: string
  insight_id: string
  student_id: string // UUID - matches student.id
  session_id: string
  bloom_cell: string
  mastery_at_view: number
  device_type: string
  viewed_teaser: boolean
  expanded_level_1: boolean
  expanded_level_2: boolean
  expanded_level_3: boolean
  time_on_level_1: number
  time_on_level_2: number
  time_on_level_3: number
  sections_viewed: string[]
  completed_full_read: boolean
  clicked_video: boolean
  clicked_ai_chat: boolean
  clicked_article: boolean
  clicked_demo: boolean
  reached_level: number
  dismissed: boolean
  dismiss_reason?: string
  created_at: string
  updated_at: string
}

export interface InsightFeedback {
  id: string
  insight_id: string
  student_id: string // UUID - matches student.id
  feedback_type: "thumbs_up" | "thumbs_down" | "suggestion"
  category?: string
  comment?: string
  bloom_cell?: string
  mastery_at_feedback?: number
  created_at: string
}

export interface InsightShare {
  id: string
  insight_id: string
  student_id: string // UUID - matches student.id
  platform: string
  motivation?: string
  created_at: string
}

export interface StudentInsightView {
  id: string
  student_id: string // UUID - matches student.id
  insight_id: string
  bloom_cell: string
  mastery_at_view: number
  viewed_at: string
}

export interface Student {
  id: string // UUID (primary key) - used for all database operations
  student_code: string // Human-readable (e.g., "STU-2024-001") - displayed in UI
  first_name: string
  last_name: string
  email: string
  auth_user_id?: string // UUID from Supabase Auth (when authenticated)
  organization_id?: string // UUID
}
