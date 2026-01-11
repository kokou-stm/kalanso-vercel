export interface InstructorUploadProps {
  onSave: (glo: NewGLO) => void
  onCancel: () => void
}

export interface NewGLO {
  // Required fields
  title: string
  taxonomyCell: string // e.g., "3C" (Apply × Procedural)
  learningObjectives: string[]

  // Content
  contentType: "video" | "document" | "mixed"
  contentFiles: UploadedFile[]

  // Optional fields
  description?: string
  estimatedTime?: number // minutes
  difficulty?: "easy" | "medium" | "hard"
  prerequisites?: string[]

  // Practice & Assessment
  practiceExercises?: Exercise[]
  assessmentQuestions?: Question[]
}

export interface UploadedFile {
  id: string
  name: string
  type: string // MIME type
  size: number // bytes
  url?: string // Preview URL (local or uploaded)
  uploadProgress?: number // 0-100
}

export interface Exercise {
  id: string
  type: "practice" | "reflection" | "scenario"
  prompt: string
  hints?: string[]
  estimatedTime: number
}

export interface Question {
  id: string
  type:
    | "mcq"
    | "true_false"
    | "short_answer"
    | "numerical"
    | "fill_blank"
    | "ordering"
    | "categorization"
    | "image_upload"
  [key: string]: any
}

export interface TaxonomyDimension {
  code: string
  name: string
  description: string
}

export interface TaxonomyLevel {
  level: number
  name: string
  dimensions: TaxonomyDimension[]
}
