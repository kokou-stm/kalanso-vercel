export type GLODifficulty = "easy" | "medium" | "hard"
export type GLOStatus = "not_started" | "in_progress" | "completed" | "mastered"

export interface GLO {
  id: string
  title: string
  learningObjective: string
  taxonomyCell: string // e.g., "3C"
  taxonomyCellName: string // e.g., "Apply × Procedural"
  estimatedTime: number // in minutes
  difficulty: GLODifficulty
  masteryThreshold: number // percentage (e.g., 85)
}

export interface GLOProgress {
  gloId: string
  status: GLOStatus
  contentCompleted: boolean
  practiceCompleted: boolean
  assessmentCompleted: boolean
  currentScore: number // 0-100 (0 if not attempted)
  attempts: number
  lastAttempt?: Date
  timeSpent: number // minutes
}

export interface GLOCardProps {
  glo: GLO
  progress: GLOProgress
  onStartContinue: (gloId: string) => void
  variant?: "default" | "compact"
}

export interface GLOContent {
  type: "video" | "text" | "diagram" | "pdf"
  title: string
  url?: string
  data?: string
  description?: string
  duration?: number
}

export interface GLOPractice {
  type: "exercise" | "reflection" | "scenario"
  prompt: string
  hints?: string[]
  sampleAnswer?: string
}

export interface FullGLO extends GLO {
  content: GLOContent[]
  practice: GLOPractice[]
  assessment: import("./assessment").AssessmentQuestion[]
  learningObjectivesChecklist: string[]
  tips: string[]
}

export interface GLOStudyViewProps {
  glo: FullGLO
  progress: GLOProgress
  onComplete: (sectionType: "content" | "practice" | "assessment") => void
  onAssessmentSubmit: (results: import("./assessment").AssessmentResult) => void
  onBackToDashboard: () => void
}
