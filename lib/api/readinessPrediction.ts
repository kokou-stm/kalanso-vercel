import { createServerClient } from "@/lib/supabase/server"

/**
 * Generate AI-powered readiness prediction for an upcoming assessment
 */
export async function generateReadinessPrediction(studentId: string, assessmentId: string) {
  try {
    console.log("[v0] generateReadinessPrediction called with:", { studentId, assessmentId })

    const supabase = await createServerClient()

    console.log("[v0] Fetching assessment data...")
    const { data: assessment, error: assessmentError } = await supabase
      .from("assessments")
      .select("glo_id")
      .eq("id", assessmentId)
      .single()

    if (assessmentError) {
      console.error("[v0] Assessment fetch error:", assessmentError)
      throw new Error(`Assessment fetch failed: ${assessmentError.message}`)
    }

    if (!assessment?.glo_id) {
      console.error("[v0] Assessment has no glo_id")
      throw new Error("Assessment not found or has no GLOs")
    }

    console.log("[v0] Fetching mastery data for glo_id:", assessment.glo_id)
    const { data: masteryData, error: masteryError } = await supabase
      .from("student_mastery")
      .select("*")
      .eq("student_id", studentId)
      .eq("glo_id", assessment.glo_id)

    if (masteryError) {
      console.error("[v0] Mastery fetch error:", masteryError)
    }

    // 2. Calculate average mastery
    const avgMastery = masteryData?.length
      ? masteryData.reduce((sum, m) => sum + (m.mastery_score || 0), 0) / masteryData.length
      : 0

    console.log("[v0] Average mastery:", avgMastery)

    // 3. Fetch recent practice history
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    console.log("[v0] Fetching practice sessions...")
    const { data: practiceSessions, error: practiceError } = await supabase
      .from("practice_sessions")
      .select("*")
      .eq("student_id", studentId)
      .eq("glo_id", assessment.glo_id)
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at", { ascending: false })

    if (practiceError) {
      console.error("[v0] Practice sessions fetch error:", practiceError)
    }

    const practiceCount = practiceSessions?.length || 0
    const recentSuccessRate = practiceSessions?.length
      ? practiceSessions.filter((s) => s.score >= 0.7).length / practiceSessions.length
      : 0

    console.log("[v0] Practice stats:", { practiceCount, recentSuccessRate })

    // 4. Generate AI prediction (simplified algorithm for MVP)
    const predictedScore = Math.min(
      100,
      Math.max(0, avgMastery * 0.6 + recentSuccessRate * 100 * 0.3 + Math.min(practiceCount / 10, 1) * 10),
    )

    const confidence = Math.min(100, practiceCount >= 5 ? 80 : practiceCount >= 3 ? 60 : 40)

    const readinessLevel =
      predictedScore >= 80
        ? "ready"
        : predictedScore >= 60
          ? "almost_ready"
          : predictedScore >= 40
            ? "needs_practice"
            : "not_ready"

    // 5. Generate recommendations based on weak areas
    const weakGLOs = masteryData?.filter((m) => (m.mastery_score || 0) < 60) || []
    const recommendations = weakGLOs.slice(0, 3).map((glo) => ({
      glo_id: glo.glo_id,
      reason: `Mastery at ${Math.round((glo.mastery_score || 0) * 100)}%`,
      suggested_practice: "Complete 3-5 practice questions",
      estimated_time_minutes: 15,
    }))

    const predictionData = {
      student_id: studentId,
      assessment_id: assessmentId,
      glo_id: assessment.glo_id,
      predicted_score: Math.round(predictedScore) / 100,
      confidence: Math.round(confidence) / 100,
      readiness_level: readinessLevel,
      factors: {
        avgMastery,
        recentSuccessRate,
        practiceCount,
        weakGLOs: weakGLOs.map((g) => g.glo_id),
      },
      recommendation:
        recommendations.length > 0
          ? `Focus on: ${recommendations.map((r) => r.glo_id).join(", ")}. Estimated time: ${recommendations.reduce((sum, r) => sum + r.estimated_time_minutes, 0)} minutes.`
          : "You are ready for the assessment!",
      estimated_prep_time_minutes: recommendations.reduce((sum, r) => sum + r.estimated_time_minutes, 0),
      predicted_at: new Date().toISOString(),
      prediction_algorithm: "mvp_v1",
      model_version: "1.0",
    }

    console.log("[v0] Inserting prediction data:", predictionData)

    // 6. Save to database - update if exists, insert if new
    const { data, error } = await supabase
      .from("readiness_predictions")
      .upsert(predictionData, {
        onConflict: "student_id,assessment_id",
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Prediction insert error:", error)
      console.error("[v0] Prediction insert error details:", JSON.stringify(error, null, 2))
      throw new Error(`Failed to save prediction: ${error.message}`)
    }

    console.log("[v0] Prediction saved successfully:", data)
    return data
  } catch (error) {
    console.error("[v0] Error in generateReadinessPrediction:", error)
    throw error
  }
}

/**
 * Get recent practice summary for a student
 */
export async function getRecentPracticeSummary(studentId: string, gloId: string, days = 30) {
  const supabase = await createServerClient()

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data: sessions } = await supabase
    .from("practice_sessions")
    .select("*")
    .eq("student_id", studentId)
    .eq("glo_id", gloId)
    .gte("created_at", startDate.toISOString())
    .order("created_at", { ascending: false })

  if (!sessions || sessions.length === 0) {
    return {
      totalSessions: 0,
      averageScore: 0,
      streak: 0,
      lastPracticed: null,
      byGLO: {},
    }
  }

  // Calculate streak (consecutive days with practice)
  let streak = 0
  const sortedDates = [...new Set(sessions.map((s) => s.created_at.split("T")[0]))].sort().reverse()
  const today = new Date().toISOString().split("T")[0]

  for (let i = 0; i < sortedDates.length; i++) {
    const expectedDate = new Date()
    expectedDate.setDate(expectedDate.getDate() - i)
    const expected = expectedDate.toISOString().split("T")[0]

    if (sortedDates[i] === expected) {
      streak++
    } else {
      break
    }
  }

  // Group by GLO
  const byGLO = sessions.reduce(
    (acc, session) => {
      if (!acc[session.glo_id]) {
        acc[session.glo_id] = {
          count: 0,
          totalScore: 0,
          lastPracticed: session.created_at,
        }
      }
      acc[session.glo_id].count++
      acc[session.glo_id].totalScore += session.score || 0
      return acc
    },
    {} as Record<string, any>,
  )

  // Calculate averages
  Object.keys(byGLO).forEach((gloId) => {
    byGLO[gloId].averageScore = byGLO[gloId].totalScore / byGLO[gloId].count
  })

  return {
    totalSessions: sessions.length,
    averageScore: sessions.reduce((sum, s) => sum + (s.score || 0), 0) / sessions.length,
    streak,
    lastPracticed: sessions[0].created_at,
    byGLO,
  }
}

/**
 * Generate mock questions for MVP testing
 * Replace this with real quiz generation agent later
 */
function generateMockQuestions(numQuestions: number, difficulty: string): any[] {
  const questions = []

  const difficultyExamples = {
    easy: {
      prompts: [
        "What is the primary fat used in making hollandaise sauce?",
        "At what temperature should egg yolks be cooked for hollandaise?",
        "Which mother sauce is hollandaise derived from?",
      ],
      correctAnswers: ["Clarified butter", "60-65°C (140-150°F)", "It is a mother sauce itself"],
    },
    medium: {
      prompts: [
        "Explain why hollandaise sauce can break and how to fix it",
        "Compare the difference between hollandaise and béarnaise sauce",
        "What role does acid play in emulsion sauces?",
      ],
      correctAnswers: [
        "Breaks due to temperature or ratio issues; fix by whisking in warm water",
        "Béarnaise uses tarragon and shallots reduction instead of lemon",
        "Acid helps emulsification and adds flavor balance",
      ],
    },
    hard: {
      prompts: [
        "Design a derivative sauce of hollandaise for a seafood dish and explain your choices",
        "Analyze how altitude affects emulsion sauce preparation",
        "Troubleshoot: Your béarnaise separated during service. What are 3 possible causes?",
      ],
      correctAnswers: [
        "Could use champagne reduction + caviar for elegance",
        "Lower boiling point at altitude affects cooking temperature",
        "Overheating, too-fast butter addition, or cold ingredients",
      ],
    },
    adaptive: {
      prompts: [
        "Demonstrate your understanding of emulsion sauce fundamentals",
        "Apply proper technique to fix a broken hollandaise",
        "Evaluate the quality of this béarnaise preparation",
      ],
      correctAnswers: [
        "Emulsion = suspended fat droplets in liquid medium",
        "Whisk in warm water gradually to re-emulsify",
        "Check consistency, flavor balance, and temperature",
      ],
    },
  }

  const examples = difficultyExamples[difficulty] || difficultyExamples.adaptive

  for (let i = 0; i < numQuestions; i++) {
    const promptIndex = i % examples.prompts.length

    questions.push({
      id: `rdc_q${i + 1}`,
      type: "mcq",
      prompt: examples.prompts[promptIndex],
      options: [
        examples.correctAnswers[promptIndex],
        "Incorrect option B",
        "Incorrect option C",
        "Incorrect option D",
      ].sort(() => Math.random() - 0.5),
      correctAnswer: examples.correctAnswers[promptIndex],
      explanation: `This question tests your ${difficulty}-level understanding of sauce techniques.`,
      bloomLevel: difficulty === "easy" ? "remember" : difficulty === "medium" ? "understand" : "apply",
      points: difficulty === "easy" ? 5 : difficulty === "medium" ? 10 : 15,
    })
  }

  return questions
}

/**
 * Generate readiness check diagnostic quiz
 */
export async function generateReadinessCheck(params: {
  studentId: string
  assessmentId: string
  numQuestions?: number
  difficultyLevel?: "easy" | "medium" | "hard" | "adaptive"
}) {
  const { studentId, assessmentId, numQuestions = 5, difficultyLevel = "adaptive" } = params

  const supabase = await createServerClient()

  // 1. Get AI prediction
  const prediction = await generateReadinessPrediction(studentId, assessmentId)

  // 2. Generate mock questions (MVP)
  const questions = generateMockQuestions(numQuestions, difficultyLevel)

  // 3. Save configuration to database
  const { data, error } = await supabase
    .from("readiness_check_configs")
    .insert({
      student_id: studentId,
      assessment_id: assessmentId,
      num_questions: numQuestions,
      difficulty_level: difficultyLevel,
      questions_generated: questions as any,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      time_limit_minutes: 10,
      include_feedback: true,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to save configuration: ${error.message}`)
  }

  return {
    config: data,
    prediction,
    questions,
  }
}
