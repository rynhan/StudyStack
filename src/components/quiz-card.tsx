"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, Clock, BookOpen, MoreVertical, Trash2, AlertCircle } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Quiz {
  _id: string
  title: string
  description?: string
  numberOfQuestions: number
  useHOTS: boolean
  status: 'generating' | 'ready' | 'failed'
  resourceIds: Array<{ _id: string; title: string }>
  generatedAt?: string
  createdAt: string
}

interface QuizCardProps {
  quiz: Quiz
  isOwner: boolean
  onClick: () => void
  onDelete?: (quizId: string) => void
  lastAttempt?: {
    score: number
    completedAt: string
  }
}

export default function QuizCard({ 
  quiz, 
  isOwner, 
  onClick, 
  onDelete,
  lastAttempt 
}: QuizCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'generating':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'ready':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'generating':
        return 'Generating...'
      case 'ready':
        return 'Ready'
      case 'failed':
        return 'Failed'
      default:
        return status
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    onDelete?.(quiz._id)
    setIsDeleteDialogOpen(false)
  }

  const isClickable = quiz.status === 'ready'

  return (
    <>
      <Card 
      className={`transition-all hover:shadow-md ${
        isClickable ? 'cursor-pointer hover:border-blue-300' : 'opacity-75'
      } ${quiz.status === 'generating' ? 'animate-pulse' : ''}`}
      onClick={isClickable ? onClick : undefined}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <h3 className="font-semibold text-gray-900 truncate">{quiz.title}</h3>
              <Badge 
                variant="outline" 
                className={`text-xs ${getStatusColor(quiz.status)}`}
              >
                {getStatusText(quiz.status)}
              </Badge>
            </div>
            
            {quiz.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                {quiz.description}
              </p>
            )}
          </div>

          {isOwner && (
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 ml-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-32 p-1" align="end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Quiz Info */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{quiz.numberOfQuestions} questions</span>
            </div>
            
            {quiz.useHOTS && (
              <Badge variant="secondary" className="text-xs">
                HOTS
              </Badge>
            )}
          </div>

          {/* Resources */}
          <div className="text-sm">
            <span className="text-gray-600">Based on: </span>
            <span className="text-gray-900">
              {quiz.resourceIds.slice(0, 2).map(r => r.title).join(', ')}
              {quiz.resourceIds.length > 2 && ` +${quiz.resourceIds.length - 2} more`}
            </span>
          </div>

          {/* Last Attempt or Status Info */}
          {quiz.status === 'ready' && lastAttempt ? (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Last attempt:</span>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={lastAttempt.score >= 70 ? "default" : "secondary"}
                  className="text-xs"
                >
                  {lastAttempt.score}%
                </Badge>
                <span className="text-gray-500">
                  {formatDate(lastAttempt.completedAt)}
                </span>
              </div>
            </div>
          ) : quiz.status === 'failed' ? (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
              <AlertCircle className="h-4 w-4" />
              <span>Failed to generate quiz</span>
            </div>
          ) : quiz.status === 'generating' ? (
            <div className="flex items-center gap-2 text-sm text-yellow-700 bg-yellow-50 p-2 rounded">
              <Clock className="h-4 w-4" />
              <span>AI is generating your quiz...</span>
            </div>
          ) : quiz.generatedAt ? (
            <div className="text-sm text-gray-500">
              Generated {formatDate(quiz.generatedAt)}
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              Created {formatDate(quiz.createdAt)}
            </div>
          )}
        </div>
      </CardContent>
    </Card>

    {/* Delete Confirmation Dialog */}
    <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Quiz</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &ldquo;{quiz.title}&rdquo;? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
}
