"use client"

import { Trophy, BookOpen, Target, CheckCircle, Clock } from "lucide-react"
import { useTranslation } from "@/lib/i18n/use-translation"
import type { Activity } from "@/types/learner"

interface ActivityTimelineProps {
  activities: Activity[]
  onActivityClick?: (activity: Activity) => void
}

export function ActivityTimeline({ activities, onActivityClick }: ActivityTimelineProps) {
  const { t } = useTranslation()

  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "mastered_cell":
        return <Trophy className="h-4 w-4 text-green-600" />
      case "completed_glo":
        return <CheckCircle className="h-4 w-4 text-blue-600" />
      case "started_glo":
        return <BookOpen className="h-4 w-4 text-purple-600" />
      case "assessment_passed":
        return <Target className="h-4 w-4 text-orange-600" />
    }
  }

  const getRelativeTime = (timestamp: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - timestamp.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) {
      return t("dashboard.timeAgo.minutes", { count: diffMins })
    } else if (diffHours < 24) {
      return t("dashboard.timeAgo.hours", { count: diffHours })
    } else {
      return t("dashboard.timeAgo.days", { count: diffDays })
    }
  }

  return (
    <div className="space-y-3">
      {activities.map((activity, index) => (
        <div
          key={activity.id}
          className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
          onClick={() => onActivityClick?.(activity)}
        >
          {/* Icon */}
          <div className="mt-0.5 p-2 rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors">
            {getActivityIcon(activity.type)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 line-clamp-2">{activity.title}</p>
            <div className="flex items-center gap-2 mt-1">
              <Clock className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500">{getRelativeTime(activity.timestamp)}</span>
            </div>
          </div>

          {/* Cell Badge */}
          {activity.cellCode && (
            <span className="shrink-0 px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
              {activity.cellCode}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
