import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { session_id, learning_objectives, session_duration_minutes } = body

    // Mock AI-generated recommendations
    const mockRecommendations = [
      {
        id: "rec_1",
        title: "Linear Regression in Python: Complete Tutorial",
        type: "video",
        format: "MP4 Video, 1080p",
        duration_minutes: 24,
        url: "https://example.com/linear-regression-tutorial",
        source: "Internal Library",
        taxonomy: {
          cognitive: "apply",
          knowledge: "procedural",
        },
        match_score: 0.95,
        match_reasons: [
          "Covers scikit-learn implementation",
          "Includes code examples and debugging",
          "Shows real dataset usage",
        ],
        warnings: [],
        usage_stats: {
          used_in_sessions: 47,
          avg_rating: 4.8,
          completion_rate: 0.94,
          mastery_improvement: 0.23,
        },
        tags: ["python", "scikit-learn", "numpy"],
        difficulty: "intermediate",
        instructor_notes: "Great pacing for beginners. Pause at 12:30 for hands-on practice.",
      },
      {
        id: "rec_2",
        title: "Hands-On ML with Scikit-Learn - Chapter 4",
        type: "code",
        format: "Jupyter Notebook",
        duration_minutes: 45,
        url: "https://github.com/example/ml-notebooks",
        source: "GitHub",
        taxonomy: {
          cognitive: "apply",
          knowledge: "procedural",
        },
        match_score: 0.93,
        match_reasons: ["Hands-on coding exercises", "Step-by-step implementation", "Real-world datasets included"],
        warnings: [],
        usage_stats: {
          used_in_sessions: 32,
          avg_rating: 4.9,
          completion_rate: 0.88,
          mastery_improvement: 0.31,
        },
        tags: ["jupyter", "python", "ml"],
        difficulty: "intermediate",
      },
      {
        id: "rec_3",
        title: "10 Linear Regression Coding Challenges",
        type: "exercise",
        format: "Interactive Exercises",
        duration_minutes: 60,
        url: "https://example.com/exercises",
        source: "LeetCode ML",
        taxonomy: {
          cognitive: "apply",
          knowledge: "procedural",
        },
        match_score: 0.91,
        match_reasons: [
          "Progressive difficulty (easy → hard)",
          "Auto-graded solutions",
          "Covers common bugs and edge cases",
        ],
        warnings: [],
        usage_stats: {
          used_in_sessions: 28,
          avg_rating: 4.7,
          completion_rate: 0.82,
          mastery_improvement: 0.19,
        },
        tags: ["coding-challenges", "python"],
        difficulty: "intermediate",
      },
      {
        id: "rec_4",
        title: "Linear Regression Fundamentals",
        type: "article",
        format: "Article",
        duration_minutes: 15,
        url: "https://example.com/fundamentals",
        source: "Towards Data Science",
        taxonomy: {
          cognitive: "understand",
          knowledge: "conceptual",
        },
        match_score: 0.72,
        match_reasons: ["Mathematical background"],
        warnings: ["More Understand than Apply level"],
        usage_stats: {
          used_in_sessions: 19,
          avg_rating: 4.5,
          completion_rate: 0.91,
          mastery_improvement: 0.12,
        },
        tags: ["theory", "mathematics"],
        difficulty: "beginner",
      },
      {
        id: "rec_5",
        title: "Boston Housing Dataset",
        type: "dataset",
        format: "CSV",
        duration_minutes: 10,
        url: "https://example.com/boston-housing",
        source: "UCI ML Repository",
        taxonomy: {
          cognitive: "apply",
          knowledge: "procedural",
        },
        match_score: 0.89,
        match_reasons: ["Perfect for regression practice", "Well-documented features"],
        warnings: [],
        tags: ["dataset", "regression"],
        difficulty: "beginner",
      },
    ]

    // Categorize recommendations
    const categories = {
      instructional: mockRecommendations.filter((r) => r.type === "video" || r.type === "code"),
      theory: mockRecommendations.filter((r) => r.type === "article"),
      practice: mockRecommendations.filter((r) => r.type === "exercise"),
      projects: mockRecommendations.filter((r) => r.type === "dataset"),
      external: [],
    }

    return NextResponse.json({
      recommendations: mockRecommendations,
      categories,
      gap_analysis: {
        missing_content_types: ["formative_assessment", "debugging_tutorials"],
        suggestions: [
          "Add mid-session knowledge check",
          "Include error-handling examples",
          "Consider peer code review activity",
        ],
        warnings: ["No Analyze-level activities found"],
      },
      pedagogical_insights: {
        bloom_distribution: {
          remember: 0,
          understand: 1,
          apply: 4,
          analyze: 0,
          evaluate: 0,
          create: 0,
        },
        duration_analysis: {
          recommended_total: session_duration_minutes,
          current_total: mockRecommendations.reduce((sum, r) => sum + r.duration_minutes, 0),
        },
      },
    })
  } catch (error) {
    console.error("[v0] Error generating recommendations:", error)
    return NextResponse.json({ error: "Failed to generate recommendations" }, { status: 500 })
  }
}
