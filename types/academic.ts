export interface Course {
  id: string
  title: string
  code: string
  description: string
  status: "draft" | "active" | "archived"
  term: string
  createdAt: Date
  updatedAt: Date
  classes: Class[]
  enrolledStudents: number
}

export interface Class {
  id: string
  courseId: string
  number: number
  title: string
  description: string
  weekNumber?: number
  dateRange?: { start: Date; end: Date }
  sessions: Session[]
  order: number
}

export interface Session {
  id: string
  classId: string
  number: number
  title: string
  description: string
  estimatedTime: number // in minutes
  content: ContentItem[]
  learningGoals: LearningGoal[]
  assessment?: Assessment
  status: "draft" | "published"
  order: number
}

export interface ContentItem {
  id: string
  type: "video" | "document" | "pdf" | "link" | "slide"
  title: string
  url: string
  thumbnailUrl?: string
  fileSize?: number
  uploadDate: Date
  assignedTo?: { classId: string; sessionId: string }
}

export interface LearningGoal {
  id: string
  sessionId: string
  statement: string
  cognitiveLevel: "remember" | "understand" | "apply" | "analyze" | "evaluate" | "create"
  knowledgeDimension: "factual" | "conceptual" | "procedural" | "metacognitive"
  bloomCell: string
  successCriteria: string[]
  masteryThreshold: number
}

export interface Assessment {
  id: string
  sessionId: string
  type: "quiz" | "assignment" | "image_upload" | "performance"
  timeLimit?: number
  attemptsAllowed: number | "unlimited"
  cooldownMinutes?: number
  randomizeQuestions: boolean
  questions: string[] // question IDs
  masteryThreshold: number
  unlocksNextSession: boolean
}

export interface StudentProgress {
  studentId: string
  courseId: string
  currentClassId: string
  currentSessionId: string
  completedSessions: string[]
  masteryScores: Record<string, number> // sessionId -> score
  lastActivity: Date
  overallProgress: number // 0-100
}

export interface StudentInfo {
  id: string
  name: string
  email: string
  enrollmentDate: Date
  progress: StudentProgress
}
