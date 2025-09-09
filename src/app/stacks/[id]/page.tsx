"use client"

import React, { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus, ExternalLink, FileText, Video, Image as ImageIcon, Edit, Trash2, MoreVertical } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import AddResourceDialog from "@/components/resource-dialog"
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

const getResourceIcon = (type: Resource['resourceType']) => {
  switch (type) {
    case 'youtube':
      return <Video className="h-5 w-5 text-red-500" />
    case 'webpage':
      return <ExternalLink className="h-5 w-5 text-blue-500" />
    case 'document':
      return <FileText className="h-5 w-5 text-green-500" />
    case 'image':
      return <ImageIcon className="h-5 w-5 text-purple-500" />
    default:
      return <FileText className="h-5 w-5 text-gray-500" />
  }
}

export default function StackPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useUser()
  const [isAddResourceOpen, setIsAddResourceOpen] = useState(false)
  const [isEditResourceOpen, setIsEditResourceOpen] = useState(false)
  const [editingResource, setEditingResource] = useState<Resource | null>(null)
  const [studyStack, setStudyStack] = useState<Stack | null>(null)
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  
  const currentUserId = user?.id // Get from Clerk
  const stackId = Array.isArray(params.id) ? params.id[0] : params.id

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
  
  if (loading) {
    return (
      <div className="container mx-auto p-12">
        <div className="text-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  if (!studyStack) {
    return (
      <div className="container mx-auto p-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Stack Not Found</h1>
          <Button onClick={() => router.push('/')}>Go Back Home</Button>
        </div>
      </div>
    )
  }

  const isOwner = studyStack.ownerId === currentUserId

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

  const handleEditResource = async (data: ResourceData) => {
    if (!editingResource || !stackId) return
    
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

      const response = await fetch(`/api/v1/stacks/${stackId}/resources/${editingResource._id}`, {
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
      
      setIsEditResourceOpen(false)
      setEditingResource(null)
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

  const openEditDialog = (resource: Resource) => {
    setEditingResource(resource)
    setIsEditResourceOpen(true)
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
        <div className="text-sm text-gray-500">
          {resources.length} resource{resources.length !== 1 ? 's' : ''}
          {!isOwner && ' • Public Stack'}
        </div>
      </div>

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
        ) : (
          resources
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
            .map((resource) => (
              <Card 
                key={resource._id} 
                className="p-6 hover:shadow-md transition-shadow relative group"
              >
                {/* Action Menu for Owners */}
                {isOwner && (
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
                        >
                          <MoreVertical className="h-4 w-4 text-gray-500" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-32 p-1" align="end">
                        <div className="flex flex-col">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="justify-start h-8 px-2 text-sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              openEditDialog(resource)
                            }}
                          >
                            <Edit className="h-3 w-3 mr-2" />
                            Edit
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="justify-start h-8 px-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (confirm('Are you sure you want to delete this resource?')) {
                                handleDeleteResource(resource._id)
                              }
                            }}
                          >
                            <Trash2 className="h-3 w-3 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                )}

                <div 
                  className="flex items-start gap-4 cursor-pointer"
                  onClick={() => handleResourceClick(resource)}
                >
                  <div className="flex-shrink-0 mt-1">
                    {getResourceIcon(resource.resourceType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg text-gray-900 leading-tight">
                        {resource.title}
                      </h3>
                    </div>
                    {resource.description && (
                      <p className="text-gray-600 mb-3 leading-relaxed">
                        {resource.description}
                      </p>
                    )}
                    {resource.userNotes && (
                      <div className="bg-blue-50 border-l-4 border-blue-200 p-3">
                        <p className="text-sm text-blue-800">
                          <span className="font-medium">Note:</span> {resource.userNotes}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      {/* <span className="text-xs text-gray-500 capitalize">
                        {resource.resourceType}
                      </span> */}
                      {/* <ExternalLink className="h-4 w-4 text-gray-400" /> */}
                    </div>
                  </div>
                </div>
              </Card>
            ))
        )}
      </div>

      {/* Add Resource Dialog */}
      {isOwner && (
        <>
          <AddResourceDialog
            open={isAddResourceOpen}
            onOpenChange={setIsAddResourceOpen}
            onSubmit={handleAddResource}
            mode="add"
          />
          
          {/* Edit Resource Dialog */}
          <AddResourceDialog
            open={isEditResourceOpen}
            onOpenChange={setIsEditResourceOpen}
            onSubmit={handleEditResource}
            mode="edit"
            initialData={editingResource ? {
              title: editingResource.title,
              description: editingResource.description || '',
              resourceType: editingResource.resourceType,
              resourceUrl: editingResource.resourceUrl,
              userNotes: editingResource.userNotes || '',
            } : undefined}
          />
        </>
      )}
    </main>
  )
}
