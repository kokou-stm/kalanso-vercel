export interface TaxonomyCell {
  code: string // "1A" through "6D"
  cognitiveLevel: number // 1-6
  cognitiveName: string
  knowledgeDimension: string // "A", "B", "C", "D"
  knowledgeName: string
  description: string
  typicalVerbs: string[]
  example: string
}

export interface LearnerCellScore {
  cellCode: string
  masteryPercentage: number // 0-100
  glosCompleted: number
  lastUpdated: Date
}

export interface LevelMastery {
  level: number // 1-6
  name: string // "Remember", "Understand", etc.
  averageScore: number // 0-100 (aggregated from 4 cells)
  cellsMastered: number // How many of the 4 cells are mastered (≥85%)
  totalCells: number // Always 4
  cellsStarted: number // How many cells have score > 0
  status: "mastered" | "proficient" | "developing" | "not_started"
}

export interface CellDetail {
  code: string
  cognitiveName: string
  knowledgeName: string
  description: string
  masteryPercentage?: number
  glosCompleted?: number
  glosTotal?: number
  typicalVerbs?: string[]
  example?: string
  lastUpdated?: Date
  recommendations?: {
    internal: InternalResource[]
    external: ExternalResource[]
  }
  exercises?: GeneratedExercise[]
}

export interface QuestionCellIndicatorProps {
  cellCode: string // e.g., "3C"
  position?: "sidebar" | "top" | "inline"
  showDescription?: boolean
}

export interface TaxonomyMatrixProps {
  cellScores: LearnerCellScore[]
  defaultView?: "detailed" | "simplified"
  onCellClick?: (cellCode: string) => void
}

export interface InternalResource {
  id: string
  type: "glo" | "document" | "video" | "module"
  title: string
  description: string
  source: string
  estimatedTime: number // minutes
  difficulty: "easy" | "medium" | "hard"
  relevanceScore: number // 0-100
  linkTo: string
  thumbnailUrl?: string
  icon?: string
}

export interface ExternalResource {
  id: string
  type: "youtube" | "article" | "tutorial" | "documentation" | "course"
  title: string
  description: string
  source: string
  url: string
  estimatedTime?: number
  difficulty?: "easy" | "medium" | "hard"
  thumbnailUrl?: string
  author?: string
  platform: string
  subscriberCount?: string
}

export interface GeneratedExercise {
  id: string
  type: "reflection" | "scenario" | "practice" | "problem_solving"
  title: string
  prompt: string
  hints: string[]
  estimatedTime: number
  difficulty: "easy" | "medium" | "hard"
  learningObjective: string
  sampleAnswer?: string
  generatedBy: "ai" | "instructor"
}
