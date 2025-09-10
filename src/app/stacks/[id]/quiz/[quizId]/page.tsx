"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Clock, CheckCircle, XCircle, Brain } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { SignedIn, SignedOut } from '@clerk/nextjs'
import axios from 'axios'

interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
  difficulty?: 'easy' | 'medium' | 'hard'
}

interface Quiz {
  _id: string
  title: string
  description?: string
  questions: QuizQuestion[]
  numberOfQuestions: number
  useHOTS: boolean
  status: 'generating' | 'ready' | 'failed'
  resourceIds: Array<{ _id: string; title: string }>
}

interface UserAnswer {
  questionIndex: number
  selectedAnswer: number
  timeSpent: number
}

interface QuizResult {
  score: number
  totalQuestions: number
  correctAnswers: number
  timeSpent: number
  answers: Array<{
    questionIndex: number
    selectedAnswer: number
    isCorrect: boolean
    timeSpent: number
  }>
}

function AuthenticatedQuizContent() {
  const router = useRouter()
  const params = useParams()
  
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [quizStartTime, setQuizStartTime] = useState<number>(Date.now())
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null)
  const [showResults, setShowResults] = useState(false)

  const stackId = Array.isArray(params.id) ? params.id[0] : params.id
  const quizId = Array.isArray(params.quizId) ? params.quizId[0] : params.quizId

  useEffect(() => {
    const loadQuiz = async () => {
      if (!stackId || !quizId) return
      
      try {
        setLoading(true)
        const response = await axios.get(`/api/v1/stacks/${stackId}/quizzes/${quizId}`)
        const quizData: Quiz = response.data
        
        if (quizData.status !== 'ready') {
          router.push(`/stacks/${stackId}`)
          return
        }
        
        setQuiz(quizData)
        setQuizStartTime(Date.now())
        setQuestionStartTime(Date.now())
      } catch (error) {
        console.error('Failed to load quiz:', error)
        router.push(`/stacks/${stackId}`)
      } finally {
        setLoading(false)
      }
    }

    loadQuiz()
  }, [stackId, quizId, router])

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
  }

  const handleNextQuestion = () => {
    if (selectedAnswer === null || !quiz) return

    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000)
    
    const newAnswer: UserAnswer = {
      questionIndex: currentQuestionIndex,
      selectedAnswer,
      timeSpent
    }

    const updatedAnswers = [...userAnswers, newAnswer]
    setUserAnswers(updatedAnswers)
    setSelectedAnswer(null)

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setQuestionStartTime(Date.now())
    } else {
      // Submit quiz
      submitQuiz(updatedAnswers)
    }
  }

  const submitQuiz = async (answers: UserAnswer[]) => {
    if (!quiz || !stackId || !quizId) return

    setIsSubmitting(true)
    try {
      const totalTimeSpent = Math.round((Date.now() - quizStartTime) / 1000)
      
      const response = await axios.post(`/api/v1/stacks/${stackId}/quizzes/${quizId}/attempts`, {
        answers,
        timeSpent: totalTimeSpent
      })

      setQuizResult(response.data)
      setShowResults(true)
    } catch (error) {
      console.error('Failed to submit quiz:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 70) return 'default'
    return 'secondary'
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center">
          <p className="text-gray-500">Loading quiz...</p>
        </div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Quiz not found</h1>
          <Button onClick={() => router.push(`/stacks/${stackId}`)}>
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  if (showResults && quizResult) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push(`/stacks/${stackId}`)}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Stack
          </Button>
        </div>

        {/* Results */}
        <Card className="mb-6">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Brain className="h-6 w-6 text-blue-600" />
              <CardTitle className="text-2xl">{quiz.title}</CardTitle>
            </div>
            <div className="flex items-center justify-center gap-4">
              <Badge 
                variant={getScoreBadgeVariant(quizResult.score)} 
                className="text-lg px-3 py-1"
              >
                {quizResult.score}%
              </Badge>
              <span className="text-gray-600">
                {quizResult.correctAnswers} out of {quizResult.totalQuestions} correct
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-gray-50 rounded-lg">
                <Clock className="h-5 w-5 mx-auto mb-2 text-gray-600" />
                <div className="text-sm text-gray-600">Time Spent</div>
                <div className="font-semibold">{formatTime(quizResult.timeSpent)}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Average per Question</div>
                <div className="font-semibold">
                  {formatTime(Math.round(quizResult.timeSpent / quizResult.totalQuestions))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Review */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold mb-4">Question Review</h3>
          {quiz.questions.map((question, index) => {
            const userAnswer = quizResult.answers.find(a => a.questionIndex === index)
            const isCorrect = userAnswer?.isCorrect || false
            
            return (
              <Card key={index} className="border-l-4 border-l-gray-200">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-medium text-gray-900 flex-1">
                      {index + 1}. {question.question}
                    </h4>
                    <div className="flex items-center gap-2 ml-4">
                      {isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <Badge variant={isCorrect ? "default" : "destructive"} className="text-xs">
                        {isCorrect ? "Correct" : "Incorrect"}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => {
                      const isSelected = userAnswer?.selectedAnswer === optionIndex
                      const isCorrectAnswer = question.correctAnswer === optionIndex
                      
                      let className = "p-3 rounded border text-sm "
                      if (isCorrectAnswer) {
                        className += "bg-green-50 border-green-200 text-green-800"
                      } else if (isSelected && !isCorrectAnswer) {
                        className += "bg-red-50 border-red-200 text-red-800"
                      } else {
                        className += "bg-gray-50 border-gray-200"
                      }
                      
                      return (
                        <div key={optionIndex} className={className}>
                          <div className="flex items-center justify-between">
                            <span>{option}</span>
                            <div className="flex gap-1">
                              {isSelected && (
                                <Badge variant="outline" className="text-xs">Your answer</Badge>
                              )}
                              {isCorrectAnswer && (
                                <Badge variant="default" className="text-xs">Correct</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  
                  {question.explanation && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-sm text-blue-800">
                        <strong>Explanation:</strong> {question.explanation}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Actions */}
        <div className="mt-8 text-center">
          <Button onClick={() => router.push(`/stacks/${stackId}`)}>
            Back to Stack
          </Button>
        </div>
      </div>
    )
  }

  const currentQuestion = quiz.questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.push(`/stacks/${stackId}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Stack
        </Button>
        
        <div className="text-sm text-gray-600">
          Question {currentQuestionIndex + 1} of {quiz.questions.length}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <Progress value={progress} className="h-2" />
      </div>

      {/* Quiz Header */}
      <Card className="mb-6">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Brain className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-xl">{quiz.title}</CardTitle>
          </div>
          {quiz.useHOTS && (
            <Badge variant="secondary" className="w-fit mx-auto">
              Higher Order Thinking Skills
            </Badge>
          )}
        </CardHeader>
      </Card>

      {/* Question */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold mb-6 leading-relaxed">
            {currentQuestion.question}
          </h2>
          
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  selectedAnswer === index
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <span className="w-8 h-8 rounded-full border-2 flex items-center justify-center mr-3 text-sm font-medium">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-end">
        <Button
          onClick={handleNextQuestion}
          disabled={selectedAnswer === null || isSubmitting}
          size="lg"
        >
          {isSubmitting ? (
            "Submitting..."
          ) : currentQuestionIndex === quiz.questions.length - 1 ? (
            "Submit Quiz"
          ) : (
            "Next Question"
          )}
        </Button>
      </div>
    </div>
  )
}

export default function QuizPage() {
  const router = useRouter()
  
  return (
    <>
      <SignedOut>
        <div className="container mx-auto p-6 max-w-4xl">
          <div className="text-center mt-20">
            <div className="text-8xl mb-8">🔐</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Access Restricted</h1>
            <p className="text-xl text-gray-600 mb-8">
              Please sign in to take quizzes
            </p>
            <Button onClick={() => router.push('/')}> 
              Go Back Home
            </Button>
          </div>
        </div>
      </SignedOut>
      
      <SignedIn>
        <AuthenticatedQuizContent />
      </SignedIn>
    </>
  )
}
