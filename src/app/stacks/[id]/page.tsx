"use client"

import React, { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Plus, FileText, Search, BookOpen, Brain, GraduationCap } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import axios from 'axios'
import { useRouter, useParams } from "next/navigation"
import AddResourceDialog from "@/components/resource-dialog"
import ResourceCard from "@/components/resource-card"
import ResourceCardLearn from "@/components/resource-card-learn"
import LearningProgress from "@/components/reusable-learning-progress"
import SearchBar from "@/components/reusable-search-bar"
import { useUser } from '@clerk/nextjs'
import CreateQuizDialog from "@/components/quiz-dialog"
import QuizCard from "@/components/quiz-card"

// Utility functions for resource type detection
const detectResourceType = (url?: string): 'youtube' | 'webpage' | 'document' | 'image' => {
  if (!url) return 'webpage'
  
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'youtube'
  }
  
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
  const docExtensions = ['.pdf', '.doc', '.docx', '.txt', '.md']
  
  const lowerUrl = url.toLowerCase()
  
  if (imageExtensions.some(ext => lowerUrl.includes(ext))) {
    return 'image'
  }
  
  if (docExtensions.some(ext => lowerUrl.includes(ext))) {
    return 'document'
  }
  
  return 'webpage'
}

const getYouTubeEmbedUrl = (url: string): string | null => {
  // Convert regular YouTube URLs to embed URLs
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const match = url.match(youtubeRegex)
  
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}`
  }
  
  return null
}

// Types based on the API v1 response and Mongoose schema
interface Stack {
  _id: string
  title: string
  description: string
  emoji: string
  isPublic: boolean
  ownerId: string
  createdAt: string
  updatedAt: string
}

interface Resource {
  _id: string
  studyStackId: string
  title: string
  description?: string
  resourceType: 'youtube' | 'webpage' | 'document' | 'image'
  status?: 'reference' | 'todo' | 'inprogress' | 'done'
  resourceUrl: string
  embedUrl?: string
  filePath?: string
  userNotes?: string
  createdAt: string
  updatedAt: string
}

type ResourceData = {
  title: string
  description: string
  resourceType: 'youtube' | 'webpage' | 'document' | 'image'
  resourceUrl?: string
  file?: File
  userNotes: string
  status?: 'reference' | 'todo' | 'inprogress' | 'done'
}

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

interface QuizAttempt {
  _id: string
  score: number
  completedAt: string
}

export default function StackPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useUser()
  const [isAddResourceOpen, setIsAddResourceOpen] = useState(false)
  const [studyStack, setStudyStack] = useState<Stack | null>(null)
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<'created' | 'updated'>('created')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [statusFilter, setStatusFilter] = useState<'all' | 'reference' | 'todo' | 'inprogress' | 'done'>('all')
  
  // Quiz-related state
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [isCreateQuizOpen, setIsCreateQuizOpen] = useState(false)
  const [quizAttempts, setQuizAttempts] = useState<Record<string, QuizAttempt>>({}) // quizId -> latest attempt
  
  const currentUserId = user?.id // Get from Clerk
  const stackId = Array.isArray(params.id) ? params.id[0] : params.id

  const isOwner = studyStack?.ownerId === currentUserId

  const toggleStackPublic = async (checked: boolean) => {
    if (!stackId) return
    try {
      setStudyStack(prev => prev ? { ...prev, isPublic: checked } : prev)
      await axios.put(`/api/v1/stacks/${stackId}`, { isPublic: checked })
    } catch (err) {
      // Revert on error
      setStudyStack(prev => prev ? { ...prev, isPublic: !prev.isPublic } : prev)
      console.error('Failed to update stack visibility', err)
    }
  }

  useEffect(() => { // Load study stack and resources on mount
    const loadData = async () => {
      if (!stackId) return
      
      try {
        setLoading(true)
        
        // Load study stack details
        const stackResponse = await axios.get(`/api/v1/stacks/${stackId}`)
        const studyStackData: Stack = stackResponse.data
        setStudyStack(studyStackData)
        
        // Load resources for this study stack
        const resourcesResponse = await axios.get(`/api/v1/stacks/${stackId}/resources`)
        const resourcesData: Resource[] = resourcesResponse.data
        setResources(resourcesData)

        // Load quizzes for this study stack
        const quizzesResponse = await axios.get(`/api/v1/stacks/${stackId}/quizzes`)
        const quizzesData: Quiz[] = quizzesResponse.data
        setQuizzes(quizzesData)

        // Load quiz attempts for ready quizzes
        const readyQuizzes = quizzesData.filter(q => q.status === 'ready')
        const attempts: Record<string, QuizAttempt> = {}
        
        for (const quiz of readyQuizzes) {
          try {
            const attemptsResponse = await axios.get(`/api/v1/stacks/${stackId}/quizzes/${quiz._id}/attempts`)
            const userAttempts = attemptsResponse.data
            if (userAttempts.length > 0) {
              attempts[quiz._id] = userAttempts[0] // Get latest attempt
            }
          } catch {
            // User might not have attempts for this quiz
            console.log('No attempts found for quiz:', quiz._id)
          }
        }
        setQuizAttempts(attempts)
      } catch (error) {
        console.error('Failed to load study stack:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [stackId])

  // Poll for quiz status updates
  useEffect(() => {
    const generatingQuizzes = quizzes.filter(q => q.status === 'generating')
    if (generatingQuizzes.length === 0) return

    const pollInterval = setInterval(async () => {
      try {
        const quizzesResponse = await axios.get(`/api/v1/stacks/${stackId}/quizzes`)
        const updatedQuizzes: Quiz[] = quizzesResponse.data
        setQuizzes(updatedQuizzes)

        // Check if any quiz finished generating
        const stillGenerating = updatedQuizzes.filter(q => q.status === 'generating')
        if (stillGenerating.length === 0) {
          clearInterval(pollInterval)
        }
      } catch (error) {
        console.error('Failed to poll quiz status:', error)
      }
    }, 2000) // Poll every 2 seconds

    return () => clearInterval(pollInterval)
  }, [quizzes, stackId])

  // Filter and sort resources based on search query and sort preferences (Resources Tab)
  const filteredAndSortedResources = React.useMemo(() => {
    let filtered = resources

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = resources.filter(resource => 
        resource.title.toLowerCase().includes(query) ||
        resource.description?.toLowerCase().includes(query) ||
        resource.userNotes?.toLowerCase().includes(query)
      )
    }

    // Sort resources
    const sorted = [...filtered].sort((a, b) => {
      const dateA = new Date(sortBy === 'created' ? a.createdAt : a.updatedAt)
      const dateB = new Date(sortBy === 'created' ? b.createdAt : b.updatedAt)
        
      if (sortOrder === 'asc') {
        return dateA.getTime() - dateB.getTime()
      } else {
        return dateB.getTime() - dateA.getTime()
      }
    })

    return sorted
  }, [resources, searchQuery, sortBy, sortOrder])

  // Filter and sort resources for Learn Tab
  const filteredLearnResources = React.useMemo(() => {
    let filtered = resources.filter(r => r.status !== 'reference') // Exclude reference resources

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(resource => 
        resource.title.toLowerCase().includes(query) ||
        resource.description?.toLowerCase().includes(query) ||
        resource.userNotes?.toLowerCase().includes(query)
      )
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(resource => resource.status === statusFilter)
    }

    // Sort resources
    const sorted = [...filtered].sort((a, b) => {
      const dateA = new Date(sortBy === 'created' ? a.createdAt : a.updatedAt)
      const dateB = new Date(sortBy === 'created' ? b.createdAt : b.updatedAt)
      
      if (sortOrder === 'asc') {
        return dateA.getTime() - dateB.getTime()
      } else {
        return dateB.getTime() - dateA.getTime()
      }
    })

    return sorted
  }, [resources, searchQuery, statusFilter, sortBy, sortOrder])

  if (loading) {
    return (
      <div className="container mx-auto p-12">
        <div className="text-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  if (!studyStack || (!studyStack.isPublic && !isOwner)) {
    return (
      <main>
        <div className="text-center">
          <div className="text-8xl mb-8">🔒</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-xl text-gray-600 mb-8">
            {!studyStack ? 'Stack not found' : 'This stack is private'}
          </p>
          <Button onClick={() => router.push('/')}> 
            Go Back Home
          </Button>
        </div>
      </main>
    )
  }

  const handleAddResource = async (data: ResourceData) => {
    if (!stackId) return
    
    try {
      // Auto-detect resource type and generate embed URL for YouTube
      let resourceType = data.resourceType
      let embedUrl: string | undefined

      if (data.resourceUrl) {
        resourceType = detectResourceType(data.resourceUrl)
        if (resourceType === 'youtube') {
          embedUrl = getYouTubeEmbedUrl(data.resourceUrl) || undefined
        }
      }

      await axios.post(`/api/v1/stacks/${stackId}/resources`, {
        title: data.title,
        description: data.description,
        resourceType,
        resourceUrl: data.resourceUrl || '',
        embedUrl,
        userNotes: data.userNotes,
        status: data.status || 'reference',
      })

      // Refresh resources
      const resourcesResponse = await axios.get(`/api/v1/stacks/${stackId}/resources`)
      const resourcesData: Resource[] = resourcesResponse.data
      setResources(resourcesData)
      
      setIsAddResourceOpen(false)
    } catch (error) {
      console.error('Failed to add resource:', error)
    }
  }

  const handleEditResource = async (resourceId: string, data: ResourceData) => {
    if (!stackId) return
    
    try {
      // Auto-detect resource type and generate embed URL for YouTube
      let resourceType = data.resourceType
      let embedUrl: string | undefined

      if (data.resourceUrl) {
        resourceType = detectResourceType(data.resourceUrl)
        if (resourceType === 'youtube') {
          embedUrl = getYouTubeEmbedUrl(data.resourceUrl) || undefined
        }
      }

    await axios.put(`/api/v1/stacks/${stackId}/resources/${resourceId}`, {
          title: data.title,
          description: data.description,
          resourceType,
          resourceUrl: data.resourceUrl || '',
      embedUrl,
      userNotes: data.userNotes,
      status: data.status || 'reference',
    })

      // Refresh resources
      const resourcesResponse = await axios.get(`/api/v1/stacks/${stackId}/resources`)
      const resourcesData: Resource[] = resourcesResponse.data
      setResources(resourcesData)
    } catch (error) {
      console.error('Failed to edit resource:', error)
    }
  }

  const handleDeleteResource = async (resourceId: string) => {
    if (!stackId) return
    
    try {
      await axios.delete(`/api/v1/stacks/${stackId}/resources/${resourceId}`)

      // Refresh resources
      const resourcesResponse = await axios.get(`/api/v1/stacks/${stackId}/resources`)
      const resourcesData: Resource[] = resourcesResponse.data
      setResources(resourcesData)
    } catch (error) {
      console.error('Failed to delete resource:', error)
    }
  }

  const handleStatusChange = async (resourceId: string, newStatus: Resource['status']) => {
    if (!stackId) return
    
    try {
      const resource = resources.find(r => r._id === resourceId)
      if (!resource) return
      
    await axios.put(`/api/v1/stacks/${stackId}/resources/${resourceId}`, {
      title: resource.title,
      description: resource.description,
      resourceType: resource.resourceType,
      resourceUrl: resource.resourceUrl,
      embedUrl: resource.embedUrl,
      userNotes: resource.userNotes,
      status: newStatus,
    })

    // Refresh resources
    const resourcesResponse = await axios.get(`/api/v1/stacks/${stackId}/resources`)
    const resourcesData: Resource[] = resourcesResponse.data
      setResources(resourcesData)
    } catch (error) {
      console.error('Failed to update resource status:', error)
    }
  }

  const handleResourceClick = (resource: Resource) => {
    if (resource.resourceType === 'youtube') {
      window.open(resource.resourceUrl, '_blank')
    } else if (resource.resourceType === 'webpage') {
      window.open(resource.resourceUrl, '_blank')
    } else if (resource.resourceType === 'document' || resource.resourceType === 'image') {
      // Handle file download or preview
      window.open(resource.resourceUrl, '_blank')
    }
  }

  const handleCreateQuiz = async (data: {
    title: string
    description: string
    resourceIds: string[]
    numberOfQuestions: number
    useHOTS: boolean
  }) => {
    if (!stackId) return
    
    try {
      await axios.post(`/api/v1/stacks/${stackId}/quizzes`, data)
      
      // Refresh quizzes
      const quizzesResponse = await axios.get(`/api/v1/stacks/${stackId}/quizzes`)
      const quizzesData: Quiz[] = quizzesResponse.data
      setQuizzes(quizzesData)
      
      setIsCreateQuizOpen(false)
    } catch (error) {
      console.error('Failed to create quiz:', error)
    }
  }

  const handleDeleteQuiz = async (quizId: string) => {
    if (!stackId) return
    
    try {
      await axios.delete(`/api/v1/stacks/${stackId}/quizzes/${quizId}`)
      
      // Refresh quizzes
      const quizzesResponse = await axios.get(`/api/v1/stacks/${stackId}/quizzes`)
      const quizzesData: Quiz[] = quizzesResponse.data
      setQuizzes(quizzesData)
      
      // Remove attempts for deleted quiz
      setQuizAttempts(prev => {
        const updated = { ...prev }
        delete updated[quizId]
        return updated
      })
    } catch (error) {
      console.error('Failed to delete quiz:', error)
    }
  }

  const handleQuizClick = (quiz: Quiz) => {
    if (quiz.status === 'ready') {
      router.push(`/stacks/${stackId}/quiz/${quiz._id}`)
    }
  }



  return (
    <main className="container mx-auto p-6 max-w-4xl">
      {/* Back Button */}
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.push('/')}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Stack Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <span className="text-4xl">{studyStack.emoji}</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{studyStack.title}</h1>
              <p className="text-gray-600 text-lg">{studyStack.description}</p>
            </div>
          </div>
          {isOwner && (
            <div className="flex flex-col items-end gap-2">
              <Button 
                onClick={() => setIsAddResourceOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Resource
              </Button>

              <div className="flex items-center gap-3">
                <Switch id="isPublic" checked={!!studyStack?.isPublic} onCheckedChange={toggleStackPublic} />
                <span className="text-sm text-gray-600">{studyStack?.isPublic ? 'Public 🌐' : 'Private 🔒'}</span>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Tabs */}
      <Tabs defaultValue="resources" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="resources" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Resources
          </TabsTrigger>
          <TabsTrigger value="learn" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Learn
          </TabsTrigger>
          <TabsTrigger value="assessment" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Assessment
          </TabsTrigger>
        </TabsList>

        {/* Resources Tab */}
        <TabsContent value="resources" className="mt-6">
          {/* Search and Filter Bar */}
          {resources.length > 0 && (
            <div className="mb-6 space-y-4">
              <SearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                sortBy={sortBy}
                onSortByChange={setSortBy}
                sortOrder={sortOrder}
                onSortOrderChange={setSortOrder}
              />
              
              {/* Resource count and status */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {searchQuery ? (
                    <>
                      <span className="font-medium">
                        {filteredAndSortedResources.length}
                      </span>
                      {' '}of{' '}
                      <span className="font-medium">{resources.length}</span>
                      {' '}resource{resources.length !== 1 ? 's' : ''} found
                    </>
                  ) : (
                    <>
                      <span className="font-medium">{resources.length}</span>
                      {' '}resource{resources.length !== 1 ? 's' : ''}
                      {!isOwner && (
                        <span className="text-gray-400 ml-2">• Public Stack</span>
                      )}
                    </>
                  )}
                </div>
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchQuery('')}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Clear search
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Resources List */}
          <div className="space-y-4">
            {resources.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="text-gray-500 mb-4">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No resources yet</h3>
                  <p className="text-sm">
                    {isOwner 
                      ? "Start building your study stack by adding your first resource."
                      : "This study stack doesn't have any resources yet."
                    }
                  </p>
                </div>
                {isOwner && (
                  <Button 
                    onClick={() => setIsAddResourceOpen(true)}
                    className="mt-4"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Resource
                  </Button>
                )}
              </Card>
            ) : filteredAndSortedResources.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="text-gray-500">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No resources found</h3>
                  <p className="text-sm">
                    Try adjusting your search query or filter settings.
                  </p>
                </div>
              </Card>
            ) : (
              filteredAndSortedResources.map((resource) => (
                <ResourceCard
                  key={resource._id}
                  resource={resource}
                  isOwner={isOwner}
                  onClick={handleResourceClick}
                  onEdit={(resourceId, data) => handleEditResource(resourceId, data)}
                  onDelete={handleDeleteResource}
                  onStatusChange={handleStatusChange}
                />
              ))
            )}
          </div>
        </TabsContent>

        {/* Learn Tab */}
        <TabsContent value="learn" className="mt-6">
          <div className="space-y-6">
            {/* Progress Component */}
            <LearningProgress resources={resources} />
            
            {/* Search Bar with Status Filter */}
            {resources.filter(r => r.status !== 'reference').length > 0 && (
              <SearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                sortBy={sortBy}
                onSortByChange={setSortBy}
                sortOrder={sortOrder}
                onSortOrderChange={setSortOrder}
                showStatusFilter={true}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                placeholder="Search learning resources..."
              />
            )}
            
            {/* Filtered Results or Status Sections */}
            {searchQuery.trim() || statusFilter !== 'all' ? (
              // Show filtered results
              <div className="space-y-3">
                <div className="text-sm text-zinc-600 mb-4">
                  {filteredLearnResources.length} resource{filteredLearnResources.length !== 1 ? 's' : ''} found
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchQuery('')}
                      className="ml-2 text-xs"
                    >
                      Clear search
                    </Button>
                  )}
                </div>
                {filteredLearnResources.length === 0 ? (
                  <Card className="p-8 text-center">
                    <div className="text-gray-500">
                      <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">No resources found</h3>
                      <p className="text-sm">
                        Try adjusting your search query or filter settings.
                      </p>
                    </div>
                  </Card>
                ) : (
                  filteredLearnResources.map((resource) => (
                    <ResourceCardLearn
                      key={resource._id}
                      resource={resource}
                      isOwner={isOwner}
                      onClick={handleResourceClick}
                      onStatusChange={handleStatusChange}
                    />
                  ))
                )}
              </div>
            ) : (
              // Show status sections
              <div className="space-y-6">
                {['todo', 'inprogress', 'done'].map((status) => {
                  const statusResources = resources.filter(r => r.status === status)
                  const statusTitle = status === 'todo' ? 'To Do' : status === 'inprogress' ? 'In Progress' : 'Completed'
                  const statusColor = status === 'todo' ? 'text-purple-500' : status === 'inprogress' ? 'text-sky-500' : 'text-lime-700'

                  if (statusResources.length === 0) return null
                  
                  return (
                    <div key={status}>
                      <h3 className={`text-lg font-semibold mb-2 ${statusColor}`}>
                        {statusTitle} ({statusResources.length})
                      </h3>
                      <div className="grid gap-3">
                        {statusResources.map((resource) => (
                          <ResourceCardLearn
                            key={resource._id}
                            resource={resource}
                            isOwner={isOwner}
                            onClick={handleResourceClick}
                            onStatusChange={handleStatusChange}
                          />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            
            {/* Empty state for learn tab */}
            {resources.filter(r => r.status !== 'reference').length === 0 && (
              <Card className="p-8 text-center">
                <div className="text-gray-500 mb-4">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No learning resources yet</h3>
                  <p className="text-sm">
                    Add some resources and set their status to start tracking your learning progress.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Assessment Tab */}
        <TabsContent value="assessment" className="mt-6">
          <div className="space-y-6">
            {/* Create Quiz Button */}
            {isOwner && resources.length > 0 && (
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">AI-Generated Quizzes</h3>
                  <p className="text-sm text-gray-600">
                    Create quizzes based on your study resources using AI
                  </p>
                </div>
                <Button 
                  onClick={() => setIsCreateQuizOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create Quiz
                </Button>
              </div>
            )}

            {/* Quizzes List */}
            <div className="space-y-4">
              {quizzes.length === 0 ? (
                <Card className="p-8 text-center">
                  <div className="text-gray-500 mb-4">
                    <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No quizzes yet</h3>
                    <p className="text-sm">
                      {isOwner 
                        ? resources.length === 0 
                          ? "Add some resources first, then create your first AI-generated quiz."
                          : "Create your first AI-generated quiz to test your knowledge."
                        : "This study stack doesn't have any quizzes yet."
                      }
                    </p>
                  </div>
                  {isOwner && resources.length > 0 && (
                    <Button 
                      onClick={() => setIsCreateQuizOpen(true)}
                      className="mt-4"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Quiz
                    </Button>
                  )}
                </Card>
              ) : (
                <>
                  <div className="text-sm text-gray-600 mb-4">
                    <span className="font-medium">{quizzes.length}</span>
                    {' '}quiz{quizzes.length !== 1 ? 'es' : ''}
                    {!isOwner && (
                      <span className="text-gray-400 ml-2">• Public Stack</span>
                    )}
                  </div>
                  
                  {quizzes.map((quiz) => (
                    <QuizCard
                      key={quiz._id}
                      quiz={quiz}
                      isOwner={isOwner}
                      onClick={() => handleQuizClick(quiz)}
                      onDelete={handleDeleteQuiz}
                      lastAttempt={quizAttempts[quiz._id]}
                    />
                  ))}
                </>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Resource Dialog */}
      {isOwner && (
        <AddResourceDialog
          open={isAddResourceOpen}
          onOpenChange={setIsAddResourceOpen}
          onSubmit={handleAddResource}
          mode="add"
        />
      )}

      {/* Create Quiz Dialog */}
      {isOwner && (
        <CreateQuizDialog
          open={isCreateQuizOpen}
          onOpenChange={setIsCreateQuizOpen}
          resources={resources}
          onSubmit={handleCreateQuiz}
        />
      )}
    </main>
  )
}
