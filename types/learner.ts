import type { GLO, GLOProgress } from "./glo"

export interface Learner {
  id: string
  name: string
  email: string
  enrolledDate: Date
  currentStreak: number // days
  totalTimeSpent: number // minutes
}

export interface LearnerProgress {
  learnerId: string
  cellsMastered: number // out of 24
  totalGLOsCompleted: number
  averageScore: number // 0-100
  cellScores: Record<string, number> // cell code → mastery %
}

export interface DashboardGLO {
  glo: GLO
  progress: GLOProgress
  isRecommended?: boolean
  priority?: "high" | "medium" | "low"
}

export type ActivityType = "completed_glo" | "mastered_cell" | "started_glo" | "assessment_passed"

export interface Activity {
  id: string
  type: ActivityType
  timestamp: Date
  title: string
  cellCode?: string
}

export interface LearnerDashboardProps {
  learner: Learner
  progress: LearnerProgress
  glos: DashboardGLO[]
  recentActivity: Activity[]
}
