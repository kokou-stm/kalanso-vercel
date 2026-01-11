"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { trackInsightView, trackEngagement } from "@/lib/api/insights"

interface TrackingOptions {
  insightId: string
  studentId: string
  bloomCell: string
  mastery: number
}

export function useInsightTracking(options: TrackingOptions) {
  const [engagementId, setEngagementId] = useState<string | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const sessionId = useRef<string>(generateSessionId())

  // Initialize tracking on mount
  useEffect(() => {
    if (!isTracking && options.studentId) {
      initializeTracking()
    }
  }, [options.studentId])

  const initializeTracking = async () => {
    try {
      const deviceType = getDeviceType()
      const id = await trackInsightView({
        insightId: options.insightId,
        studentId: options.studentId,
        sessionId: sessionId.current,
        bloomCell: options.bloomCell,
        mastery: options.mastery,
        deviceType,
      })

      if (id) {
        setEngagementId(id)
        setIsTracking(true)
      }
    } catch (error) {
      console.error("[v0] Failed to initialize tracking:", error)
    }
  }

  const trackEvent = useCallback(
    async (updates: Record<string, any>) => {
      if (!engagementId) {
        console.warn("[v0] Cannot track event: No engagement ID")
        return
      }

      try {
        await trackEngagement({
          engagementId,
          updates,
        })
      } catch (error) {
        console.error("[v0] Failed to track event:", error)
      }
    },
    [engagementId],
  )

  return {
    trackEvent,
    engagementId,
    isTracking,
  }
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function getDeviceType(): string {
  if (typeof window === "undefined") return "unknown"

  const width = window.innerWidth
  if (width < 768) return "mobile"
  if (width < 1024) return "tablet"
  return "desktop"
}
