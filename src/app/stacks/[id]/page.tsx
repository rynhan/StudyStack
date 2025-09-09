"use client"

import React, { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, FileText, Search, SortAsc, SortDesc } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import AddResourceDialog from "@/components/resource-dialog"
import ResourceCard from "@/components/resource-card"
import { useUser } from '@clerk/nextjs'

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
  
  const currentUserId = user?.id // Get from Clerk
  const stackId = Array.isArray(params.id) ? params.id[0] : params.id

  const isOwner = studyStack?.ownerId === currentUserId

  useEffect(() => { // Load study stack and resources on mount
    const loadData = async () => {
      if (!stackId) return
      
      try {
        setLoading(true)
        
        // Load study stack details
        const stackResponse = await fetch(`/api/v1/stacks/${stackId}`)
        if (!stackResponse.ok) {
          throw new Error(`HTTP error! status: ${stackResponse.status}`)
        }
        const studyStackData: Stack = await stackResponse.json()
        setStudyStack(studyStackData)
        
        // Load resources for this study stack
        const resourcesResponse = await fetch(`/api/v1/stacks/${stackId}/resources`)
        if (!resourcesResponse.ok) {
          throw new Error(`HTTP error! status: ${resourcesResponse.status}`)
        }
        const resourcesData: Resource[] = await resourcesResponse.json()
        setResources(resourcesData)
      } catch (error) {
        console.error('Failed to load study stack:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [stackId])

  // Filter and sort resources based on search query and sort preferences
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
  
  if (loading) {
    return (
      <div className="container mx-auto p-12">
        <div className="text-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
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

      const response = await fetch(`/api/v1/stacks/${stackId}/resources`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          resourceType,
          resourceUrl: data.resourceUrl || '',
          embedUrl,
          userNotes: data.userNotes,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Refresh resources
      const resourcesResponse = await fetch(`/api/v1/stacks/${stackId}/resources`)
      const resourcesData: Resource[] = await resourcesResponse.json()
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

      const response = await fetch(`/api/v1/stacks/${stackId}/resources/${resourceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          resourceType,
          resourceUrl: data.resourceUrl || '',
          embedUrl,
          userNotes: data.userNotes,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Refresh resources
      const resourcesResponse = await fetch(`/api/v1/stacks/${stackId}/resources`)
      const resourcesData: Resource[] = await resourcesResponse.json()
      setResources(resourcesData)
    } catch (error) {
      console.error('Failed to edit resource:', error)
    }
  }

  const handleDeleteResource = async (resourceId: string) => {
    if (!stackId) return
    
    try {
      const response = await fetch(`/api/v1/stacks/${stackId}/resources/${resourceId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      // Refresh resources
      const resourcesResponse = await fetch(`/api/v1/stacks/${stackId}/resources`)
      const resourcesData: Resource[] = await resourcesResponse.json()
      setResources(resourcesData)
    } catch (error) {
      console.error('Failed to delete resource:', error)
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

  return (
    <main className="container mx-auto p-6 max-w-4xl">

      {/* Header */}
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

      {/* Stack Info */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <span className="text-4xl">{studyStack.emoji}</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{studyStack.title}</h1>
              <p className="text-gray-600 text-lg">{studyStack.description}</p>
            </div>
          </div>
          {isOwner && (
            <Button 
              onClick={() => setIsAddResourceOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Resource
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filter Bar */}
      {resources.length > 0 && (
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search resources by title, description, or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filter Controls */}
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={(value: 'created' | 'updated') => setSortBy(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created">Created</SelectItem>
                  <SelectItem value="updated">Modified</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3"
              >
                {sortOrder === 'asc' ? (
                  <SortAsc className="h-4 w-4" />
                ) : (
                  <SortDesc className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
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
            />
          ))
        )}
      </div>

      {/* Add Resource Dialog */}
      {isOwner && (
        <AddResourceDialog
          open={isAddResourceOpen}
          onOpenChange={setIsAddResourceOpen}
          onSubmit={handleAddResource}
          mode="add"
        />
      )}
    </main>
  )
}
