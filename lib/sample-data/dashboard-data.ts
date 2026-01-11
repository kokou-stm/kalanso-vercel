import type { Learner, LearnerProgress, DashboardGLO, Activity } from "@/types/learner"

export const sampleLearner: Learner = {
  id: "learner_001",
  name: "Amara",
  email: "amara@example.com",
  enrolledDate: new Date("2025-01-10"),
  currentStreak: 5,
  totalTimeSpent: 135, // minutes
}

export const sampleProgress: LearnerProgress = {
  learnerId: "learner_001",
  cellsMastered: 12,
  totalGLOsCompleted: 8,
  averageScore: 84,
  cellScores: {
    "1A": 95,
    "1B": 88,
    "1C": 92,
    "1D": 0,
    "2A": 87,
    "2B": 91,
    "2C": 85,
    "2D": 78,
    "3A": 73,
    "3B": 68,
    "3C": 89,
    "3D": 0,
    "4A": 45,
    "4B": 72,
    "4C": 81,
    "4D": 0,
    "5A": 0,
    "5B": 0,
    "5C": 0,
    "5D": 0,
    "6A": 0,
    "6B": 0,
    "6C": 0,
    "6D": 0,
  },
}

export const sampleDashboardGLOs: DashboardGLO[] = [
  {
    glo: {
      id: "GLO_002",
      title: "Sauce Emulsification Basics",
      learningObjective: "Understand the chemistry of emulsions and why sauces like hollandaise stay stable",
      taxonomyCell: "2B",
      taxonomyCellName: "Understand × Conceptual",
      estimatedTime: 20,
      difficulty: "easy",
      masteryThreshold: 85,
    },
    progress: {
      gloId: "GLO_002",
      status: "not_started",
      contentCompleted: false,
      practiceCompleted: false,
      assessmentCompleted: false,
      currentScore: 0,
      attempts: 0,
      timeSpent: 0,
    },
    isRecommended: true,
    priority: "high",
  },
  {
    glo: {
      id: "GLO_001",
      title: "Julienne Cutting Technique",
      learningObjective:
        "Execute precise julienne cuts (3mm × 3mm × 5cm) with consistent size and shape for professional presentations",
      taxonomyCell: "3C",
      taxonomyCellName: "Apply × Procedural",
      estimatedTime: 15,
      difficulty: "medium",
      masteryThreshold: 85,
    },
    progress: {
      gloId: "GLO_001",
      status: "in_progress",
      contentCompleted: true,
      practiceCompleted: true,
      assessmentCompleted: false,
      currentScore: 73,
      attempts: 2,
      lastAttempt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      timeSpent: 12,
    },
    priority: "high",
  },
  {
    glo: {
      id: "GLO_003",
      title: "Stock Preparation Fundamentals",
      learningObjective: "Create rich, flavorful stocks using proper ratios of bones, aromatics, and cooking time",
      taxonomyCell: "3C",
      taxonomyCellName: "Apply × Procedural",
      estimatedTime: 45,
      difficulty: "medium",
      masteryThreshold: 85,
    },
    progress: {
      gloId: "GLO_003",
      status: "in_progress",
      contentCompleted: true,
      practiceCompleted: false,
      assessmentCompleted: false,
      currentScore: 0,
      attempts: 0,
      timeSpent: 25,
    },
    priority: "medium",
  },
  {
    glo: {
      id: "GLO_004",
      title: "Flavor Profile Development",
      learningObjective: "Analyze and balance the five basic tastes in dish composition",
      taxonomyCell: "4B",
      taxonomyCellName: "Analyze × Conceptual",
      estimatedTime: 30,
      difficulty: "hard",
      masteryThreshold: 85,
    },
    progress: {
      gloId: "GLO_004",
      status: "not_started",
      contentCompleted: false,
      practiceCompleted: false,
      assessmentCompleted: false,
      currentScore: 0,
      attempts: 0,
      timeSpent: 0,
    },
    priority: "low",
  },
  {
    glo: {
      id: "GLO_005",
      title: "Kitchen Safety Protocols",
      learningObjective: "Apply standard safety procedures to prevent injuries and maintain a safe kitchen environment",
      taxonomyCell: "3A",
      taxonomyCellName: "Apply × Factual",
      estimatedTime: 25,
      difficulty: "easy",
      masteryThreshold: 85,
    },
    progress: {
      gloId: "GLO_005",
      status: "not_started",
      contentCompleted: false,
      practiceCompleted: false,
      assessmentCompleted: false,
      currentScore: 0,
      attempts: 0,
      timeSpent: 0,
    },
    priority: "medium",
  },
]

export const sampleActivity: Activity[] = [
  {
    id: "act_001",
    type: "mastered_cell",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    title: "Mastered Cell 3C - Apply × Procedural",
    cellCode: "3C",
  },
  {
    id: "act_002",
    type: "completed_glo",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    title: "Completed: Knife Safety Fundamentals",
  },
  {
    id: "act_003",
    type: "assessment_passed",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    title: "Passed Assessment: Food Safety Temperature Control",
    cellCode: "3A",
  },
  {
    id: "act_004",
    type: "started_glo",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    title: "Started: Stock Preparation Fundamentals",
  },
  {
    id: "act_005",
    type: "mastered_cell",
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    title: "Mastered Cell 2B - Understand × Conceptual",
    cellCode: "2B",
  },
]
