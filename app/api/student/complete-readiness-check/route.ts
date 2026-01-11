import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { readiness_check_id, results } = await request.json()

    const { score, time_spent_minutes, by_topic } = results

    // Analyze topic performance
    const topicPerformance = by_topic.map((topic: any) => {
      const status =
        topic.score >= 90 ? "excellent" : topic.score >= 80 ? "good" : topic.score >= 70 ? "review" : "needs_work"

      const recommendations =
        status === "review" || status === "needs_work"
          ? [
              { type: "review", title: `Review ${topic.name} fundamentals`, duration: "20 min" },
              { type: "practice", title: `Practice ${topic.name} exercises`, count: 10 },
              { type: "watch", title: `Watch ${topic.name} tutorial`, duration: "15 min" },
            ]
          : []

      return { ...topic, status, recommendations }
    })

    // Determine readiness
    const isReady = score >= 80
    const predictedScore = Math.min(100, score + (Math.random() * 4 - 2)) // Simulate prediction with small variance
    const weakestTopic =
      topicPerformance.find((t: any) => t.status === "needs_work") || topicPerformance[topicPerformance.length - 1]

    return NextResponse.json({
      readiness_status: isReady ? "ready" : score >= 70 ? "almost_ready" : "not_ready",
      predicted_real_score: predictedScore / 100,
      confidence_level: score >= 75 ? "high" : score >= 65 ? "medium" : "low",
      strong_topics: topicPerformance.filter((t: any) => t.status === "excellent" || t.status === "good"),
      weak_topics: topicPerformance.filter((t: any) => t.status === "review" || t.status === "needs_work"),
      learning_plan: {
        priority_items: !isReady
          ? [
              {
                topic: weakestTopic.name,
                type: "critical",
                steps: [
                  { action: "review", title: "Review fundamentals", duration: 20 },
                  { action: "practice", title: "Guided practice", duration: 30 },
                  { action: "quiz", title: "Verification quiz", duration: 10 },
                ],
              },
            ]
          : [],
        estimated_time_minutes: !isReady ? 90 : 0,
      },
      historical_trend: {
        practice_scores: [68, 74, 78, score],
        improvement: score - 68,
      },
    })
  } catch (error) {
    console.error("[v0] Error completing readiness check:", error)
    return NextResponse.json({ error: "Failed to complete readiness check" }, { status: 500 })
  }
}
