// ============================================
// PHASE 1: 4 CORE QUESTION TYPES
// ============================================

export type QuestionType =
  | "multiple_choice_single"
  | "true_false"
  | "short_answer"
  | "numerical"
  | "fill_blank"
  | "ordering"
  | "categorization" // Added categorization type
  | "image_upload" // Added image upload type

// Base interface all questions extend
export interface BaseQuestion {
  id: string
  type: QuestionType
  question: string
  cellCode: string // Taxonomy cell (e.g., "3C")
  points: number
  difficulty?: "easy" | "medium" | "hard"
  explanation: string
  hints?: string[]
}

// ============================================
// TYPE 1: MULTIPLE CHOICE (SINGLE)
// ============================================

export interface MultipleChoiceSingle extends BaseQuestion {
  type: "multiple_choice_single"
  options: string[]
  correctAnswer: number // Index of correct answer (0-based)
}

// ============================================
// TYPE 2: TRUE/FALSE
// ============================================

export interface TrueFalse extends BaseQuestion {
  type: "true_false"
  correctAnswer: boolean
}

// ============================================
// TYPE 3: SHORT ANSWER
// ============================================

export interface ShortAnswer extends BaseQuestion {
  type: "short_answer"
  minWords?: number
  maxWords?: number
  sampleAnswer?: string
  keywords?: string[]
  autoGrade: boolean // If false, needs coach review
}

// ============================================
// TYPE 4: NUMERICAL ANSWER
// ============================================

export interface NumericalAnswer extends BaseQuestion {
  type: "numerical"
  correctAnswer: number
  unit?: string // "°C", "g", "ml", etc.
  tolerance?: number // Acceptable margin
  toleranceType?: "absolute" | "percentage"
  format?: "integer" | "decimal"
  decimalPlaces?: number
  minValue?: number
  maxValue?: number
  showUnit: boolean
  placeholder?: string
}

// ============================================
// TYPE 5: FILL BLANK
// ============================================

export interface FillBlank extends BaseQuestion {
  type: "fill_blank"
  template: string // Text with blanks marked as __1__, __2__, etc.
  blanks: {
    id: string // "1", "2", "3" - matches __1__, __2__ in template
    acceptedAnswers: string[] // Multiple acceptable answers
    caseSensitive: boolean
    placeholder?: string // Hint shown in input field
  }[]
}

// ============================================
// TYPE 6: ORDERING
// ============================================

export interface Ordering extends BaseQuestion {
  type: "ordering"
  items: {
    id: string
    text: string
    correctPosition: number // 0-based index of correct position
  }[]
  allowPartialCredit: boolean // Award points for partially correct
}

// ============================================
// TYPE 7: CATEGORIZATION (DRAG & DROP)
// ============================================

export interface Categorization extends BaseQuestion {
  type: "categorization"
  items: {
    id: string
    text: string
    imageUrl?: string
    correctCategory: string
  }[]
  categories: {
    id: string
    label: string
    description?: string
    color?: string
  }[]
  allowMultiplePerCategory: boolean
  allowPartialCredit: boolean
}

// ============================================
// TYPE 8: IMAGE UPLOAD (PROCEDURAL ASSESSMENT)
// ============================================

export interface ImageUpload extends BaseQuestion {
  type: "image_upload"
  requirements: string
  minImages: number
  maxImages: number
  requiredAngles?: string[]
  rubric: {
    id: string
    criterion: string
    description: string
    points: number
  }[]
  requireCoachReview: boolean
  acceptedFormats: string[]
  maxFileSize: number
}

// Union type for all Phase 1 question types
export type AssessmentQuestion =
  | MultipleChoiceSingle
  | TrueFalse
  | ShortAnswer
  | NumericalAnswer
  | FillBlank
  | Ordering
  | Categorization
  | ImageUpload

// ============================================
// RESPONSE TYPES
// ============================================

export interface QuestionResponse {
  questionId: string
  questionType: QuestionType
  userAnswer: string | number | boolean
  isCorrect: boolean
  pointsEarned: number
  timeSpent: number // seconds
}

export interface FillBlankResponse {
  questionId: string
  questionType: "fill_blank"
  answers: { [blankId: string]: string }
  correctCount: number
  totalBlanks: number
  isCorrect: boolean
  pointsEarned: number
  timeSpent: number
}

export interface OrderingResponse {
  questionId: string
  questionType: "ordering"
  orderedItems: string[]
  correctPositions: number
  totalItems: number
  isCorrect: boolean
  pointsEarned: number
  timeSpent: number
}

export interface CategorizationResponse {
  questionId: string
  questionType: "categorization"
  placements: {
    itemId: string
    categoryId: string
  }[]
  correctPlacements: number
  totalItems: number
  isCorrect: boolean
  pointsEarned: number
  timeSpent: number
}

export interface ImageUploadResponse {
  questionId: string
  questionType: "image_upload"
  uploadedImages: {
    url: string
    filename: string
    uploadedAt: string
    angle?: string
  }[]
  requiresCoachReview: true
  status: "pending_review"
  submittedAt: string
  pointsEarned: number
  timeSpent: number
}

export interface AssessmentResult {
  score: number // 0-100 percentage
  totalQuestions: number
  correctAnswers: number
  responses: (QuestionResponse | FillBlankResponse | OrderingResponse | CategorizationResponse | ImageUploadResponse)[]
  timeTaken: number // total seconds
  totalPoints: number
  earnedPoints: number
  masteryThreshold: number
  passed: boolean
  mastered: boolean
}

export interface AssessmentInterfaceProps {
  questions: AssessmentQuestion[]
  masteryThreshold: number
  gloTitle: string
  taxonomyCell: string
  onComplete: (result: AssessmentResult) => void
  onRetake?: () => void
}
