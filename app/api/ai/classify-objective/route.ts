import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { objective_text, session_context } = body

    // Mock AI classification - replace with actual AI service
    const verbs = objective_text.toLowerCase()

    let cognitive = "understand"
    let knowledge = "conceptual"
    let confidence = 0.7

    if (verbs.includes("implement") || verbs.includes("apply") || verbs.includes("use")) {
      cognitive = "apply"
      knowledge = "procedural"
      confidence = 0.92
    } else if (verbs.includes("analyze") || verbs.includes("compare") || verbs.includes("debug")) {
      cognitive = "analyze"
      knowledge = "procedural"
      confidence = 0.85
    } else if (verbs.includes("evaluate") || verbs.includes("assess") || verbs.includes("judge")) {
      cognitive = "evaluate"
      knowledge = "metacognitive"
      confidence = 0.88
    } else if (verbs.includes("create") || verbs.includes("design") || verbs.includes("develop")) {
      cognitive = "create"
      knowledge = "procedural"
      confidence = 0.9
    }

    const response = {
      bloom_cognitive: cognitive,
      bloom_knowledge: knowledge,
      confidence,
      reasoning: `The verb "${verbs.split(" ").find((w) => ["implement", "apply", "use", "analyze", "evaluate", "create"].includes(w))}" indicates ${cognitive}-level cognitive process.`,
      alternatives: [
        {
          cognitive: "analyze",
          knowledge: "procedural",
          confidence: 0.45,
          scenario: "If focus is on comparing or selecting approaches",
        },
      ],
      suggested_improvements: [
        "Consider adding measurable success criteria",
        "Specify tools or methodologies for clarity",
      ],
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error("[v0] Error classifying objective:", error)
    return NextResponse.json({ error: "Failed to classify objective", message: error.message }, { status: 500 })
  }
}
