"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lightbulb, ChevronDown, ChevronUp, X, Video, MessageSquare, BookOpen, Code, Share2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { InsightAIChat } from "./insight-ai-chat"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { InsightFeedbackBar } from "@/components/insight-feedback-bar"
import { useStudent } from "@/hooks/use-student"

export interface RealWorldInsight {
  id: string
  title: string
  teaser: string
  level1Content: {
    what: { text: string; durationSeconds: number }
    how: {
      diagram: {
        steps: Array<{
          label: string
          example?: string
          description: string
          bloomLevel: string
          studentProgress: "mastered" | "current" | "upcoming"
          highlight?: boolean
        }>
      }
      durationSeconds: number
    }
    whyItMatters: {
      scaleOfUse: string[]
      specificImpact: {
        challenge: string
        solution: string[]
        difference: Array<{
          metric: string
          before: string
          after: string
          improvement?: string
        }>
        humanImpact: string
      }
      durationSeconds: number
    }
    yourConnection: {
      currentBloomCell: string
      masteryPercentage: number
      masteredPrerequisites: Array<{ name: string; mastery: number }>
      currentlyLearning: Array<{ name: string; mastery: number; active?: boolean }>
      upcoming: string[]
      gapToProduction: number
      durationSeconds: number
    }
    goDeeperOptions: Array<{
      type: "video" | "ai_chat" | "article" | "demo"
      title: string
      durationMinutes?: number
      url?: string
      suggestions?: string[]
    }>
  }
}

interface RealWorldInsightCardProps {
  insight: RealWorldInsight
  language: string
  onDismiss?: () => void
}

const ENABLE_ENGAGEMENT_TRACKING = true // Set to true after running scripts and reverting to UUID

export function RealWorldInsightCard({ insight, language, onDismiss }: RealWorldInsightCardProps) {
  const { studentId, studentCode, isLoading: isLoadingStudent } = useStudent()

  const [isExpanded, setIsExpanded] = useState(false)
  const [showAIChat, setShowAIChat] = useState(false)
  const [engagementStartTime, setEngagementStartTime] = useState<number | null>(null)
  const [sectionsViewed, setSectionsViewed] = useState<string[]>([])
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isLoadingStudent || !studentId) {
      return
    }

    if (isExpanded) {
      setEngagementStartTime(Date.now())
      if (ENABLE_ENGAGEMENT_TRACKING) {
        trackEngagement("viewed_teaser")
        trackEngagement("expanded_level_1")
        trackEngagement("reached_level", { level: 1 })
      }
    } else if (engagementStartTime && ENABLE_ENGAGEMENT_TRACKING) {
      // Calculate time spent
      const timeSpent = Math.floor((Date.now() - engagementStartTime) / 1000)
      trackEngagement("time_on_level_1", { time_spent: timeSpent })
      trackEngagement("sections_viewed", { sections_viewed: sectionsViewed })
      trackEngagement("completed_full_read", { completed_full_read: sectionsViewed.length >= 4 })
    }
  }, [isExpanded, isLoadingStudent, studentId])

  const trackEngagement = async (event: string, metadata?: Record<string, any>) => {
    if (!ENABLE_ENGAGEMENT_TRACKING) {
      console.log("[v0] Engagement tracking disabled")
      return
    }

    try {
      await fetch("/api/insights/engagement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          insight_id: insight.id,
          student_id: studentId, // Using real UUID from useStudent hook
          event,
          metadata,
        }),
      })
    } catch (error) {
      console.warn("[v0] Engagement tracking failed:", error)
    }
  }

  const getBloomColor = (level: string) => {
    const colors = {
      remember: "bg-green-100 border-green-500 text-green-900",
      understand: "bg-blue-100 border-blue-500 text-blue-900",
      apply: "bg-purple-100 border-purple-500 text-purple-900",
      analyze: "bg-orange-100 border-orange-500 text-orange-900",
      evaluate: "bg-red-100 border-red-500 text-red-900",
      create: "bg-pink-100 border-pink-500 text-pink-900",
    }
    return colors[level as keyof typeof colors] || "bg-gray-100 border-gray-500 text-gray-900"
  }

  const getMasteryColor = (mastery: number) => {
    if (mastery >= 80) return "text-green-600"
    if (mastery >= 60) return "text-blue-600"
    return "text-gray-600"
  }

  const aiChatOption = insight.level1Content.goDeeperOptions.find((opt) => opt.type === "ai_chat")

  return (
    <>
      <Card
        className="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950 shadow-sm hover:shadow-md transition-all duration-200 animate-in fade-in duration-500"
        ref={cardRef}
      >
        <div className="p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-start gap-3 flex-1">
              <div className="bg-blue-600 rounded-lg p-2 flex-shrink-0">
                <Lightbulb className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-base text-gray-900 mb-1">{insight.title}</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{insight.teaser}</p>
              </div>
            </div>
            {onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-gray-600 h-8 w-8 p-0 flex-shrink-0"
                onClick={onDismiss}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 font-medium h-9"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <>
                  Collapse <ChevronUp className="ml-1 h-4 w-4" />
                </>
              ) : (
                <>
                  Learn More <ChevronDown className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div className="border-t border-blue-200 bg-white dark:bg-gray-900 animate-in slide-in-from-top duration-500">
            <div className="p-6 space-y-6 max-h-[800px] overflow-y-auto">
              {/* 1️⃣ WHAT IT DOES */}
              <div>
                <h4 className="font-semibold text-base mb-2 flex items-center gap-2">
                  <span>1️⃣</span>
                  <span>WHAT IT DOES</span>
                  <span className="text-xs text-gray-500">({insight.level1Content.what.durationSeconds}s)</span>
                </h4>
                <p className="text-sm leading-relaxed text-gray-700">{insight.level1Content.what.text}</p>
              </div>

              <div className="border-t border-gray-200" />

              {/* 2️⃣ HOW IT WORKS */}
              <div>
                <h4 className="font-semibold text-base mb-4 flex items-center gap-2">
                  <span>2️⃣</span>
                  <span>HOW IT WORKS</span>
                  <span className="text-xs text-gray-500">({insight.level1Content.how.durationSeconds}s)</span>
                </h4>
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 p-4 rounded-lg border border-gray-200">
                  <div className="space-y-3">
                    {insight.level1Content.how.diagram.steps.map((step, index) => (
                      <div
                        key={index}
                        className={cn(
                          "p-3 rounded border-l-4 transition-all",
                          step.highlight
                            ? "bg-blue-100 border-blue-500 font-semibold shadow-md"
                            : "bg-white border-gray-300",
                        )}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-medium text-sm">{step.label}</div>
                          {step.highlight && (
                            <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">YOU ARE HERE! 🎯</span>
                          )}
                        </div>
                        {step.example && <div className="text-xs text-gray-600 font-mono mb-1">"{step.example}"</div>}
                        <div className="text-sm text-gray-700">{step.description}</div>
                        <div className="mt-2 flex items-center gap-2">
                          <span className={cn("text-xs px-2 py-0.5 rounded border", getBloomColor(step.bloomLevel))}>
                            {step.bloomLevel}
                          </span>
                          <span className="text-xs text-gray-600">
                            {step.studentProgress === "mastered"
                              ? "✓ Mastered"
                              : step.studentProgress === "current"
                                ? "🎯 Learning now"
                                : "⏳ Coming soon"}
                          </span>
                        </div>
                        {index < insight.level1Content.how.diagram.steps.length - 1 && (
                          <div className="flex justify-center my-1">
                            <span className="text-gray-400">↓</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200" />

              {/* 3️⃣ WHY IT MATTERS */}
              <div>
                <h4 className="font-semibold text-base mb-4 flex items-center gap-2">
                  <span>3️⃣</span>
                  <span>WHY IT MATTERS</span>
                  <span className="text-xs text-gray-500">({insight.level1Content.whyItMatters.durationSeconds}s)</span>
                </h4>

                {/* Scale of Use */}
                <div className="mb-4">
                  <h5 className="font-semibold text-sm mb-2 flex items-center gap-1">
                    <span>🌍</span>
                    <span>Scale of Use:</span>
                  </h5>
                  <ul className="space-y-1">
                    {insight.level1Content.whyItMatters.scaleOfUse.map((impact, index) => (
                      <li key={index} className="text-sm text-gray-700">
                        • {impact}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Specific Impact Section with special styling */}
                <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 dark:from-blue-950 dark:via-purple-950 dark:to-indigo-950 border-l-4 border-blue-600 rounded-lg p-4">
                  <h5 className="font-semibold text-base mb-3 text-blue-900 dark:text-blue-100">💡 SPECIFIC IMPACT</h5>

                  {/* The Challenge */}
                  <div className="mb-4">
                    <h6 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-2">The Challenge:</h6>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {insight.level1Content.whyItMatters.specificImpact.challenge}
                    </p>
                  </div>

                  {/* How It Solves */}
                  <div className="mb-4">
                    <h6 className="font-semibold text-sm text-blue-800 dark:text-blue-200 mb-2">
                      How {insight.title.split(" ")[0]} Solves It:
                    </h6>
                    <ul className="space-y-1.5">
                      {insight.level1Content.whyItMatters.specificImpact.solution.map((item, index) => (
                        <li key={index} className="text-sm text-gray-700 dark:text-gray-300 pl-4 relative">
                          <span className="absolute left-0 text-blue-600 font-bold">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* The Difference - with highlighted metrics */}
                  <div className="mb-4">
                    <h6 className="font-semibold text-sm text-green-800 dark:text-green-200 mb-2">The Difference:</h6>
                    <div className="space-y-2">
                      {insight.level1Content.whyItMatters.specificImpact.difference.map((diff, index) => (
                        <div key={index} className="text-sm text-gray-700 dark:text-gray-300 pl-5 relative">
                          <span className="absolute left-0 text-green-600 font-bold text-lg leading-none">→</span>
                          <span className="font-medium">{diff.metric}:</span>{" "}
                          <span className="text-gray-600 dark:text-gray-400">{diff.before}</span>
                          {" → "}
                          <span className="bg-yellow-100 dark:bg-yellow-900 px-1.5 py-0.5 rounded font-semibold">
                            {diff.after}
                          </span>
                          {diff.improvement && (
                            <span className="text-green-600 dark:text-green-400 ml-1">({diff.improvement})</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Human Impact - styled as a quote/callout */}
                  <div className="bg-blue-100 dark:bg-blue-900 border-l-3 border-blue-500 p-3 rounded">
                    <p className="text-sm text-gray-800 dark:text-gray-200 italic leading-relaxed">
                      {insight.level1Content.whyItMatters.specificImpact.humanImpact}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200" />

              {/* 4️⃣ YOUR CONNECTION */}
              <div>
                <h4 className="font-semibold text-base mb-4 flex items-center gap-2">
                  <span>4️⃣</span>
                  <span>YOUR CONNECTION</span>
                  <span className="text-xs text-gray-500">
                    ({insight.level1Content.yourConnection.durationSeconds}s)
                  </span>
                </h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Your Progress in This Skill:</span>
                      <span
                        className={cn(
                          "font-semibold",
                          getMasteryColor(insight.level1Content.yourConnection.masteryPercentage),
                        )}
                      >
                        {insight.level1Content.yourConnection.masteryPercentage}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all duration-500"
                        style={{ width: `${insight.level1Content.yourConnection.masteryPercentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <h5 className="text-xs font-semibold text-green-700 mb-2">✅ You've mastered:</h5>
                      <ul className="space-y-1">
                        {insight.level1Content.yourConnection.masteredPrerequisites.map((item, index) => (
                          <li key={index} className="text-sm text-gray-700">
                            • {item.name} ({item.mastery}%)
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold text-blue-700 mb-2">🎯 Currently learning:</h5>
                      <ul className="space-y-1">
                        {insight.level1Content.yourConnection.currentlyLearning.map((item, index) => (
                          <li
                            key={index}
                            className={cn("text-sm", item.active ? "font-semibold text-blue-900" : "text-gray-700")}
                          >
                            • {item.name} ({item.mastery}%) {item.active && "← Active now"}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold text-gray-700 mb-2">⏳ Coming next:</h5>
                      <ul className="space-y-1">
                        {insight.level1Content.yourConnection.upcoming.map((item, index) => (
                          <li key={index} className="text-sm text-gray-700">
                            • {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      💡 You're {insight.level1Content.yourConnection.gapToProduction}% away from the skill level used
                      in production AI systems like ChatGPT!
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200" />

              {/* 5️⃣ GO DEEPER */}
              <div>
                <h4 className="font-semibold text-base mb-4 flex items-center gap-2">
                  <span>5️⃣</span>
                  <span>GO DEEPER</span>
                  <span className="text-xs text-gray-500">(Optional)</span>
                </h4>
                <div className="grid gap-3">
                  {insight.level1Content.goDeeperOptions.map((option, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 p-3 rounded-lg border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => {
                        if (option.type === "ai_chat") {
                          setShowAIChat(true)
                        } else if (option.url) {
                          window.open(option.url, "_blank")
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {option.type === "video" && <Video className="h-5 w-5 text-blue-600" />}
                          {option.type === "ai_chat" && <MessageSquare className="h-5 w-5 text-blue-600" />}
                          {option.type === "article" && <BookOpen className="h-5 w-5 text-blue-600" />}
                          {option.type === "demo" && <Code className="h-5 w-5 text-blue-600" />}
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-sm mb-1">{option.title}</h5>
                          {option.type === "video" && option.durationMinutes && (
                            <p className="text-xs text-gray-600">Visual explanation ({option.durationMinutes} min)</p>
                          )}
                          {option.type === "ai_chat" && option.suggestions && (
                            <p className="text-xs text-gray-600">Ask: "{option.suggestions[0]}" and more...</p>
                          )}
                          {option.type === "article" && option.durationMinutes && (
                            <p className="text-xs text-gray-600">Deep dive ({option.durationMinutes} min read)</p>
                          )}
                          {option.type === "demo" && <p className="text-xs text-gray-600">Interactive visualization</p>}
                        </div>
                        <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-700 shrink-0">
                          {option.type === "ai_chat" ? "Start →" : option.type === "video" ? "▶ Watch" : "Read →"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                  onClick={() => setIsExpanded(false)}
                >
                  <ChevronUp className="mr-1 h-4 w-4" />
                  Collapse
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-700 hover:bg-gray-100">
                  <Share2 className="mr-1 h-4 w-4" />
                  Share
                </Button>
                {onDismiss && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-gray-700 hover:bg-gray-100 ml-auto"
                    onClick={onDismiss}
                  >
                    Dismiss Forever
                  </Button>
                )}
              </div>
            </div>

            <InsightFeedbackBar
              insightId={insight.id}
              section="level_1_expanded"
              studentId={studentId} // Using real UUID from useStudent hook
              language={language}
            />
          </div>
        )}
      </Card>

      {/* AI Chat Dialog */}
      {aiChatOption && (
        <Dialog open={showAIChat} onOpenChange={setShowAIChat}>
          <DialogContent className="max-w-3xl max-h-[70vh] p-0">
            <InsightAIChat
              insightTitle={insight.title}
              suggestions={aiChatOption.suggestions || []}
              language={language}
              onClose={() => setShowAIChat(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
