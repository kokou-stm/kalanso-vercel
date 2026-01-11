"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import {
  Target,
  Sparkles,
  Clock,
  TrendingUp,
  Lightbulb,
  CheckCircle2,
  XCircle,
  BarChart3,
  Trophy,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import confetti from "canvas-confetti"

interface BloomCell {
  cognitive: string
  knowledge: string
  currentMastery: number
  courseName: string
  moduleName: string
}

interface PracticeQuestion {
  id: string
  type: "code_completion" | "multiple_choice" | "code_debugging" | "true_false" | "ordering" | "matching"
  question: string
  codeTemplate?: string
  options?: string[]
  correctAnswer: string | number
  hints: Array<{
    level: number
    text: string
  }>
  explanation: string
  difficultyScore: number
}

interface PracticeGeneratorProps {
  isOpen: boolean
  onClose: () => void
  cell: BloomCell | null
  studentId: string
  onComplete: (masteryGain: number) => void
}

export function BloomPracticeGenerator({ isOpen, onClose, cell, studentId, onComplete }: PracticeGeneratorProps) {
  const [stage, setStage] = useState<"config" | "generating" | "practice" | "complete">("config")
  const [difficulty, setDifficulty] = useState<"easier" | "current_level" | "harder">("current_level")
  const [numQuestions, setNumQuestions] = useState(10)
  const [questions, setQuestions] = useState<PracticeQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState("")
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [hintLevel, setHintLevel] = useState(0)
  const [results, setResults] = useState<Array<{ correct: boolean; timeSpent: number }>>([])
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())
  const [totalTimeSpent, setTotalTimeSpent] = useState(0)

  const currentQuestion = questions[currentQuestionIndex]
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0
  const score = results.filter((r) => r.correct).length
  const scorePercentage = results.length > 0 ? (score / results.length) * 100 : 0

  useEffect(() => {
    if (stage === "generating") {
      generatePractice()
    }
  }, [stage])

  const generatePractice = async () => {
    // Simulate AI generation
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock questions based on difficulty and cell
    const mockQuestions: PracticeQuestion[] = Array.from({ length: numQuestions }, (_, i) => ({
      id: `q${i + 1}`,
      type: i % 3 === 0 ? "code_completion" : i % 3 === 1 ? "multiple_choice" : "code_debugging",
      question:
        i % 3 === 0
          ? "Complete this forward propagation function:"
          : i % 3 === 1
            ? "What is the purpose of the activation function in a neural network?"
            : "Fix the error in this backpropagation code:",
      codeTemplate:
        i % 3 === 0
          ? `def forward_pass(X, weights, bias):
    # Calculate weighted sum
    z = _____________________
    # Apply activation function
    activation = sigmoid(z)
    return activation`
          : i % 3 === 2
            ? `def backward_pass(output, target):
    error = output * target  # BUG HERE
    gradient = error * sigmoid_derivative(output)
    return gradient`
            : undefined,
      options:
        i % 3 === 1
          ? [
              "To introduce non-linearity into the model",
              "To speed up training",
              "To reduce overfitting",
              "To initialize weights",
            ]
          : undefined,
      correctAnswer: i % 3 === 0 ? "np.dot(X, weights) + bias" : i % 3 === 1 ? 0 : "output - target",
      hints: [
        { level: 1, text: "Think about the fundamental operation needed here." },
        { level: 2, text: "Consider using NumPy's matrix multiplication function." },
        { level: 3, text: "The answer involves np.dot() for matrix multiplication." },
      ],
      explanation:
        i % 3 === 0
          ? "The weighted sum (z) is calculated by taking the dot product of inputs (X) and weights, then adding the bias term. This is the fundamental operation in neural network forward propagation."
          : i % 3 === 1
            ? "Activation functions introduce non-linearity, allowing neural networks to learn complex patterns. Without them, the network would be limited to linear transformations."
            : "The error should be calculated as (output - target), not multiplied. Subtraction gives us the direction and magnitude of the mistake.",
      difficultyScore: 0.6 + (difficulty === "easier" ? -0.1 : difficulty === "harder" ? 0.1 : 0),
    }))

    setQuestions(mockQuestions)
    setStage("practice")
    setQuestionStartTime(Date.now())
  }

  const handleSubmitAnswer = () => {
    const timeSpent = (Date.now() - questionStartTime) / 1000
    let correct = false

    if (currentQuestion.type === "multiple_choice") {
      correct = Number.parseInt(userAnswer) === currentQuestion.correctAnswer
    } else {
      correct = userAnswer.trim().toLowerCase() === String(currentQuestion.correctAnswer).toLowerCase()
    }

    setIsCorrect(correct)
    setShowFeedback(true)
    setResults([...results, { correct, timeSpent }])
    setTotalTimeSpent((prev) => prev + timeSpent)
  }

  const handleNextQuestion = () => {
    setShowFeedback(false)
    setUserAnswer("")
    setHintLevel(0)

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setQuestionStartTime(Date.now())
    } else {
      // Calculate mastery gain
      const masteryGain = Math.floor((scorePercentage / 100) * 10)
      if (scorePercentage >= 80) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        })
      }
      setStage("complete")
    }
  }

  const handleShowHint = () => {
    if (hintLevel < currentQuestion.hints.length) {
      setHintLevel(hintLevel + 1)
    }
  }

  const resetPractice = () => {
    setStage("config")
    setDifficulty("current_level")
    setNumQuestions(10)
    setQuestions([])
    setCurrentQuestionIndex(0)
    setUserAnswer("")
    setShowFeedback(false)
    setResults([])
    setHintLevel(0)
    setTotalTimeSpent(0)
  }

  const estimatedTime = numQuestions * 1.5

  if (!cell) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        {stage === "config" && (
          <div className="space-y-6">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <Target className="h-6 w-6 text-purple-600" />
                Practice: {cell.cognitive}-{cell.knowledge}
              </DialogTitle>
              <p className="text-sm text-gray-600">{cell.moduleName}</p>
            </DialogHeader>

            <Card className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-purple-700">{cell.currentMastery}%</div>
                  <div className="text-xs text-gray-600">Current Mastery</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-700">80%</div>
                  <div className="text-xs text-gray-600">Target</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-700">+{80 - cell.currentMastery}%</div>
                  <div className="text-xs text-gray-600">Gap to Close</div>
                </div>
              </div>
            </Card>

            <div className="space-y-4">
              <div className="space-y-3">
                <Label className="text-base font-semibold">Difficulty</Label>
                <RadioGroup value={difficulty} onValueChange={(v: any) => setDifficulty(v)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="easier" id="easier" />
                    <Label htmlFor="easier" className="cursor-pointer">
                      Review Basics (Easier)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="current_level" id="current" />
                    <Label htmlFor="current" className="cursor-pointer font-semibold">
                      Match Current Level (Recommended)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="harder" id="harder" />
                    <Label htmlFor="harder" className="cursor-pointer">
                      Challenge Me (Harder)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold">Number of Questions</Label>
                <div className="flex gap-3">
                  {[5, 10, 15].map((num) => (
                    <Button
                      key={num}
                      variant={numQuestions === num ? "default" : "outline"}
                      onClick={() => setNumQuestions(num)}
                      className="flex-1"
                    >
                      {num}
                    </Button>
                  ))}
                </div>
              </div>

              <Card className="p-4 bg-blue-50 border-blue-200">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-semibold text-sm text-gray-900">Estimated time: ~{estimatedTime} minutes</div>
                    <p className="text-sm text-gray-600 mt-1">
                      Based on your history: You learn best with code examples followed by conceptual questions.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-green-50 border-green-200">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Sparkles className="h-4 w-4 text-green-600" />
                  This practice won't affect your grade
                </div>
              </Card>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setStage("generating")} className="flex-1" size="lg">
                <Zap className="mr-2 h-5 w-5" />
                Generate Practice Quiz
              </Button>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {stage === "generating" && (
          <div className="py-12 text-center space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <Sparkles className="h-16 w-16 text-purple-600 animate-pulse" />
                <div className="absolute inset-0 bg-purple-400 opacity-20 blur-xl animate-pulse" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Generating Your Practice Quiz</h3>
              <p className="text-gray-600 mt-2">
                Creating {numQuestions} personalized questions at{" "}
                {difficulty === "easier" ? "review" : difficulty === "harder" ? "challenge" : "current"} level...
              </p>
            </div>
            <Progress value={66} className="w-full max-w-xs mx-auto" />
          </div>
        )}

        {stage === "practice" && currentQuestion && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl">🎯 Practice Quiz: {cell.moduleName}</DialogTitle>
              <Badge variant="secondary">
                {currentQuestionIndex + 1} of {questions.length}
              </Badge>
            </div>

            <Progress value={progress} className="h-2" />

            {!showFeedback ? (
              <div className="space-y-6">
                <Card className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-semibold">
                      Question {currentQuestionIndex + 1}:{" "}
                      {currentQuestion.type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </h3>
                    <Badge variant="outline">
                      <Clock className="h-3 w-3 mr-1" />
                      {Math.floor((Date.now() - questionStartTime) / 1000)}s
                    </Badge>
                  </div>

                  <p className="text-gray-700">{currentQuestion.question}</p>

                  {currentQuestion.codeTemplate && (
                    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                      {currentQuestion.codeTemplate}
                    </pre>
                  )}

                  {currentQuestion.type === "multiple_choice" && currentQuestion.options ? (
                    <RadioGroup value={userAnswer} onValueChange={setUserAnswer}>
                      {currentQuestion.options.map((option, i) => (
                        <div key={i} className="flex items-center space-x-2 p-3 border rounded hover:bg-gray-50">
                          <RadioGroupItem value={String(i)} id={`option-${i}`} />
                          <Label htmlFor={`option-${i}`} className="cursor-pointer flex-1">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  ) : (
                    <div className="space-y-2">
                      <Label>Your answer:</Label>
                      <Textarea
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="Type your answer here..."
                        className="min-h-[100px] font-mono"
                      />
                    </div>
                  )}

                  {hintLevel > 0 && (
                    <Card className="p-4 bg-yellow-50 border-yellow-200">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <div className="font-semibold text-sm text-gray-900">Hint {hintLevel}:</div>
                          <p className="text-sm text-gray-700 mt-1">{currentQuestion.hints[hintLevel - 1].text}</p>
                        </div>
                      </div>
                    </Card>
                  )}
                </Card>

                <div className="flex gap-3">
                  <Button onClick={handleSubmitAnswer} disabled={!userAnswer} className="flex-1" size="lg">
                    Submit Answer
                  </Button>
                  {hintLevel < currentQuestion.hints.length && (
                    <Button variant="outline" onClick={handleShowHint}>
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Need a Hint?
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <Card
                  className={cn(
                    "p-6 space-y-4",
                    isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200",
                  )}
                >
                  <div className="flex items-center gap-2">
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                        <h3 className="text-xl font-bold text-green-900">Correct!</h3>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-6 w-6 text-red-600" />
                        <h3 className="text-xl font-bold text-red-900">Not Quite</h3>
                      </>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-semibold text-gray-700">Your answer:</div>
                      <div className="text-gray-900 font-mono bg-white p-2 rounded mt-1">
                        {currentQuestion.type === "multiple_choice" && currentQuestion.options
                          ? currentQuestion.options[Number.parseInt(userAnswer)]
                          : userAnswer}
                      </div>
                    </div>

                    {!isCorrect && (
                      <div>
                        <div className="text-sm font-semibold text-gray-700">Correct answer:</div>
                        <div className="text-gray-900 font-mono bg-white p-2 rounded mt-1">
                          {currentQuestion.type === "multiple_choice" && currentQuestion.options
                            ? currentQuestion.options[Number(currentQuestion.correctAnswer)]
                            : currentQuestion.correctAnswer}
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="text-sm font-semibold text-gray-700 mb-2">📚 Explanation:</div>
                      <p className="text-gray-700">{currentQuestion.explanation}</p>
                    </div>

                    <Card className="p-4 bg-blue-50 border-blue-200">
                      <div className="flex items-start gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <div className="font-semibold text-sm text-gray-900">Why this matters:</div>
                          <p className="text-sm text-gray-700 mt-1">
                            Understanding this concept is crucial for mastering {cell.cognitive.toLowerCase()} skills in{" "}
                            {cell.knowledge.toLowerCase()} knowledge.
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>
                </Card>

                <Button onClick={handleNextQuestion} className="w-full" size="lg">
                  {currentQuestionIndex < questions.length - 1 ? "Continue to Next Question →" : "View Results"}
                </Button>
              </div>
            )}
          </div>
        )}

        {stage === "complete" && (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  <Trophy className={cn("h-20 w-20", scorePercentage >= 80 ? "text-green-600" : "text-orange-600")} />
                  {scorePercentage >= 80 && (
                    <div className="absolute inset-0 bg-green-400 opacity-20 blur-xl animate-pulse" />
                  )}
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">🎉 Practice Complete!</h2>
                <div className="text-4xl font-bold text-purple-600 mt-4">
                  {score}/{questions.length} ({Math.round(scorePercentage)}%)
                </div>
                {scorePercentage >= 80 && <Badge className="mt-2 bg-green-600">✓ Great Job!</Badge>}
              </div>
            </div>

            <Card className="p-6 space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance Breakdown
              </h3>

              <div className="space-y-4">
                {scorePercentage >= 70 && (
                  <div>
                    <div className="text-sm font-semibold text-green-700 mb-2">✅ Strong Areas:</div>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      <li>Code completion exercises (excellent)</li>
                      <li>Conceptual understanding (strong)</li>
                    </ul>
                  </div>
                )}

                {scorePercentage < 100 && (
                  <div>
                    <div className="text-sm font-semibold text-orange-700 mb-2">📈 Areas to Review:</div>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      <li>
                        Debugging scenarios ({Math.round((1 - scorePercentage / 100) * 100)}%)
                        <span className="text-xs text-gray-600 ml-2">→ Practice: 3 more debugging problems</span>
                      </li>
                    </ul>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  Time: {Math.floor(totalTimeSpent / 60)} min {Math.floor(totalTimeSpent % 60)}s
                  {totalTimeSpent / 60 > estimatedTime && (
                    <span className="text-xs text-orange-600">
                      ({Math.floor(totalTimeSpent / 60 - estimatedTime)} min over estimate)
                    </span>
                  )}
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-purple-600 flex items-center justify-center">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">🎯 Impact on Mastery:</div>
                  <div className="text-lg font-bold text-purple-700 mt-1">
                    {cell.cognitive}-{cell.knowledge}: {cell.currentMastery}% →{" "}
                    {Math.min(100, cell.currentMastery + Math.floor((scorePercentage / 100) * 10))}%
                    <span className="text-green-600 ml-2">(+{Math.floor((scorePercentage / 100) * 10)}%) 🔥</span>
                  </div>
                </div>
              </div>
            </Card>

            <div className="space-y-3">
              <div className="font-semibold text-gray-900">Next Steps:</div>
              <div className="grid gap-3">
                <Button variant="outline" onClick={resetPractice} className="justify-start bg-transparent">
                  <Zap className="h-4 w-4 mr-2" />
                  Practice More - Generate another quiz
                </Button>
                <Button variant="outline" className="justify-start bg-transparent">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Review Weak Areas - Targeted content
                </Button>
                <Button
                  onClick={() => {
                    onComplete(Math.floor((scorePercentage / 100) * 10))
                    onClose()
                  }}
                  className="justify-start"
                >
                  Return to Dashboard - Continue learning
                </Button>
              </div>
            </div>

            <div className="text-center text-sm text-gray-600">💾 Progress automatically saved</div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
