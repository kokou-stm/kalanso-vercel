"use client"

import { useQuery } from "@tanstack/react-query"
import { getDailyInsight } from "@/lib/api/insights"
import type { Insight } from "@/types/insights"

export function useInsight(studentId: string) {
  return useQuery<Insight | null>({
    queryKey: ["daily-insight", studentId],
    queryFn: () => getDailyInsight(studentId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!studentId,
  })
}
