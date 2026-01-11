import { type NextRequest, NextResponse } from "next/server"
import { generateReadinessCheck } from "@/lib/api/readinessPrediction"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, assessmentId, numQuestions, difficultyLevel } = body

    console.log("[v0] API: Generating readiness check for:", { studentId, assessmentId })

    const result = await generateReadinessCheck({
      studentId,
      assessmentId,
      numQuestions,
      difficultyLevel,
    })

    console.log("[v0] API: Readiness check generated successfully")

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] API: Error generating readiness check:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate readiness check" },
      { status: 500 },
    )
  }
}
