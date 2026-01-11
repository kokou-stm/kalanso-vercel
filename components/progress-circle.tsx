"use client"

import { useEffect, useState } from "react"

interface ProgressCircleProps {
  percentage: number // 0-100
  size?: number // diameter in pixels
  strokeWidth?: number
  showPercentage?: boolean
}

export function ProgressCircle({ percentage, size = 48, strokeWidth = 4, showPercentage = true }: ProgressCircleProps) {
  const [animatedPercentage, setAnimatedPercentage] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercentage(percentage)
    }, 100)
    return () => clearTimeout(timer)
  }, [percentage])

  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (animatedPercentage / 100) * circumference

  // Determine color based on mastery level
  const getColor = () => {
    if (percentage >= 85) return "#10B981" // Green - mastered
    if (percentage >= 70) return "#F59E0B" // Orange - approaching
    return "#EF4444" // Red - needs work
  }

  const color = getColor()

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#E5E7EB" strokeWidth={strokeWidth} fill="none" />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {showPercentage && (
        <span className="absolute text-xs font-semibold" style={{ color }}>
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  )
}
