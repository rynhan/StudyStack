"use client"

import React from "react"
import { Progress } from "@/components/ui/progress"

interface Resource {
  status?: 'reference' | 'todo' | 'inprogress' | 'done'
}

interface LearningProgressProps {
  resources: Resource[]
  className?: string
}

const getProgressMessage = (percent: number): { message: string; emoji: string } => {
  if (percent === 0) {
    return { message: "Ready to start your learning journey", emoji: "🚀" }
  } else if (percent <= 15) {
    return { message: "Just getting started", emoji: "🌱" }
  } else if (percent <= 25) {
    return { message: "Building momentum", emoji: "⚡" }
  } else if (percent <= 35) {
    return { message: "Making steady progress", emoji: "📈" }
  } else if (percent <= 45) {
    return { message: "Halfway there", emoji: "🎯" }
  } else if (percent <= 55) {
    return { message: "Great progress", emoji: "💪" }
  } else if (percent <= 65) {
    return { message: "Really picking up steam", emoji: "🔥" }
  } else if (percent <= 75) {
    return { message: "Excellent work", emoji: "⭐" }
  } else if (percent <= 85) {
    return { message: "Almost there", emoji: "🏃‍♂️" }
  } else if (percent <= 95) {
    return { message: "So close to completion", emoji: "🎊" }
  } else {
    return { message: "Congratulations! All done", emoji: "🎉" }
  }
}

export default function LearningProgress({ resources, className = "" }: LearningProgressProps) {
  // Calculate progress
  const learningResources = resources.filter(r => r.status !== 'reference')
  const total = learningResources.length
  const doneCount = learningResources.filter(r => r.status === 'done').length
  const progressPercent = total === 0 ? 0 : Math.round((doneCount / total) * 100)
  
  const { message, emoji } = getProgressMessage(progressPercent)
  
  // progress bar styling is handled by the shared Progress component

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-zinc-700">Learning Progress</div>
        <div className="text-sm font-bold text-zinc-800">{progressPercent}%</div>
      </div>
      
      <div>
        <Progress value={progressPercent} className="h-3" />
      </div>
      
      <div className="flex items-center gap-2 text-sm text-zinc-600">
        <span className="text-base">{emoji}</span>
        <span>{message}</span>
      </div>
    </div>
  )
}
