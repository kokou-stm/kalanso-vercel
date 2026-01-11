"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Clock,
  FileText,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Trophy,
  Flame,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface UpcomingAssessmentData {
  assessment: {
    id: string
    assessment_code: string
    title: string
    mastery_threshold: number
    question_count: number
    time_limit_minutes: number
    glo_id: string
  }
  prediction: {
    predicted_score: number
    confidence: number
    readiness_level: "not_ready" | "partially_ready" | "ready" | "highly_ready"
    recommendation: string
    estimated_prep_time_minutes: number
  }
  recentPractice: {
    count: number
    avgAccuracy: number
    totalTime: number
    lastSession: string | null
  }
  mastery: {
    overall_mastery: number
    successful_practice_streak: number
  }
}

interface UpcomingAssessmentCardProps {
  studentId: string
  onStartAssessment?: (assessmentId: string) => void
  onGenerateReadinessCheck?: (assessmentId: string) => void
}

export function UpcomingAssessmentCard({
  studentId,
  onStartAssessment,
  onGenerateReadinessCheck,
}: UpcomingAssessmentCardProps) {
  const [data, setData] = useState<UpcomingAssessmentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/assessments/upcoming?studentId=${encodeURIComponent(studentId)}`)

        if (!response.ok) {
          throw new Error("Failed to fetch assessment data")
        }

        const result = await response.json()

        if (result.error) {
          throw new Error(result.error)
        }

        if (!result.data) {
          setData(null)
          setLoading(false)
          return
        }

        console.log("[v0] Loaded assessment from API:", result.data.assessment.title)
        setData(result.data)
      } catch (err) {
        console.error("[v0] Error loading assessment data:", err)
        setError(err instanceof Error ? err.message : "Failed to load assessment")
      } finally {
        setLoading(false)
      }
    }

    if (studentId) {
      loadData()
    }
  }, [studentId])

  if (loading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState error={error} />
  }

  if (!data) {
    return <NoUpcomingAssessments />
  }

  if (!data.prediction) {
    return <ErrorState error="Failed to generate readiness prediction" />
  }

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50/50 to-white">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{data.assessment.title}</CardTitle>
            <CardDescription className="mt-1">
              {data.assessment.question_count} questions • {data.assessment.time_limit_minutes} minutes •{" "}
              {(data.assessment.mastery_threshold * 100).toFixed(0)}% for mastery
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300">
            Upcoming
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* AI PREDICTION */}
        <AIReadinessIndicator
          level={data.prediction.readiness_level}
          score={data.prediction.predicted_score}
          confidence={data.prediction.confidence}
        />

        {/* RECENT PRACTICE STATS */}
        <RecentPracticeStats
          count={data.recentPractice.count}
          accuracy={data.recentPractice.avgAccuracy}
          lastSession={data.recentPractice.lastSession}
          streak={data.mastery.successful_practice_streak}
        />

        {/* RECOMMENDATION */}
        <RecommendationBox
          text={data.prediction.recommendation}
          prepTime={data.prediction.estimated_prep_time_minutes}
        />
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button onClick={() => onGenerateReadinessCheck?.(data.assessment.id)} variant="outline" className="flex-1">
          <Sparkles className="h-4 w-4 mr-2" />
          Readiness Check
        </Button>
        <Button
          onClick={() => onStartAssessment?.(data.assessment.id)}
          className="flex-1 bg-purple-600 hover:bg-purple-700"
        >
          Start Assessment
        </Button>
      </CardFooter>
    </Card>
  )
}

// AI Readiness Indicator Component
function AIReadinessIndicator({
  level,
  score,
  confidence,
}: {
  level: "not_ready" | "partially_ready" | "ready" | "highly_ready"
  score: number
  confidence: number
}) {
  const colors = {
    not_ready: "bg-red-50 border-red-500 text-red-700",
    partially_ready: "bg-amber-50 border-amber-500 text-amber-700",
    ready: "bg-blue-50 border-blue-500 text-blue-700",
    highly_ready: "bg-green-50 border-green-500 text-green-700",
  }

  const labels = {
    not_ready: "More Practice Needed",
    partially_ready: "Getting Ready",
    ready: "Ready to Assess",
    highly_ready: "Highly Confident",
  }

  const icons = {
    not_ready: AlertCircle,
    partially_ready: Clock,
    ready: CheckCircle2,
    highly_ready: Trophy,
  }

  const Icon = icons[level]

  return (
    <div className={`border-l-4 p-4 rounded-r ${colors[level]}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon className="h-6 w-6" />
          <div>
            <div className="font-semibold text-base">{labels[level]}</div>
            <div className="text-sm opacity-80">Predicted Score: {(score * 100).toFixed(0)}%</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold">{(score * 100).toFixed(0)}%</div>
          <div className="text-xs opacity-60">{(confidence * 100).toFixed(0)}% confidence</div>
        </div>
      </div>
    </div>
  )
}

// Recent Practice Stats Component
function RecentPracticeStats({
  count,
  accuracy,
  lastSession,
  streak,
}: {
  count: number
  accuracy: number
  lastSession: string | null
  streak: number
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard label="Practice Sessions" value={count} subtext="Last 30 days" icon={FileText} />
      <StatCard
        label="Avg Accuracy"
        value={`${(accuracy * 100).toFixed(0)}%`}
        trend={accuracy >= 0.8 ? "up" : accuracy >= 0.6 ? "neutral" : "down"}
        icon={accuracy >= 0.8 ? TrendingUp : accuracy >= 0.6 ? Minus : TrendingDown}
      />
      <StatCard
        label="Last Session"
        value={lastSession ? formatDistanceToNow(new Date(lastSession), { addSuffix: true }) : "Never"}
        icon={Clock}
      />
      <StatCard
        label="Success Streak"
        value={streak}
        subtext={streak >= 3 ? "On fire!" : undefined}
        icon={Flame}
        highlight={streak >= 3}
      />
    </div>
  )
}

// Stat Card Component
function StatCard({
  label,
  value,
  subtext,
  trend,
  icon: Icon,
  highlight,
}: {
  label: string
  value: string | number
  subtext?: string
  trend?: "up" | "down" | "neutral"
  icon?: any
  highlight?: boolean
}) {
  return (
    <div
      className={`bg-white rounded-lg p-3 border ${highlight ? "border-orange-300 bg-orange-50" : "border-gray-200"}`}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="text-xs font-medium text-gray-600">{label}</div>
        {Icon && <Icon className={`h-4 w-4 ${highlight ? "text-orange-600" : "text-gray-400"}`} />}
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      {subtext && (
        <div className={`text-xs mt-1 ${highlight ? "text-orange-600 font-semibold" : "text-gray-500"}`}>{subtext}</div>
      )}
    </div>
  )
}

// Recommendation Box Component
function RecommendationBox({
  text,
  prepTime,
}: {
  text: string
  prepTime: number
}) {
  return (
    <Alert className="border-purple-200 bg-purple-50/50">
      <Sparkles className="h-4 w-4 text-purple-600" />
      <AlertDescription className="ml-2">
        <div className="font-medium text-gray-900 mb-1">AI Recommendation</div>
        <div className="text-sm text-gray-700">{text}</div>
        {prepTime > 0 && (
          <div className="text-xs text-purple-600 font-medium mt-2">Estimated prep time: {prepTime} minutes</div>
        )}
      </AlertDescription>
    </Alert>
  )
}

// Loading State
function LoadingState() {
  return (
    <Card className="border-2 border-purple-200">
      <CardHeader>
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-4 gap-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
        <Skeleton className="h-16 w-full" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  )
}

// Error State
function ErrorState({ error }: { error: string }) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <div className="font-medium">Failed to load assessment</div>
        <div className="text-sm mt-1">{error}</div>
      </AlertDescription>
    </Alert>
  )
}

// No Upcoming Assessments
function NoUpcomingAssessments() {
  return (
    <Card className="border-2 border-gray-200">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <CheckCircle2 className="h-12 w-12 text-gray-400 mb-4" />
        <div className="text-center">
          <div className="font-semibold text-gray-900 mb-1">No Upcoming Assessments</div>
          <div className="text-sm text-gray-600">You're all caught up! Check back later for new assessments.</div>
        </div>
      </CardContent>
    </Card>
  )
}
