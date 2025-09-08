"use client"

import React, { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus, ExternalLink, FileText, Video, Image as ImageIcon, Edit, Trash2, MoreVertical } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import AddResourceDialog from "@/components/resource-dialog"
import { studyStackService, resourceService, apiUtils } from "@/lib/api-client"
import { StudyStack, Resource as ApiResource } from "@/lib/mock-db"

type Resource = {
  id: string
  title: string
  description?: string
  resourceType: 'youtube' | 'webpage' | 'document' | 'image'
  resourceUrl: string
  embedUrl?: string
  filePath?: string
  userNotes?: string
  orderIndex: number
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

export default function SetPage() {
  const router = useRouter()
  const params = useParams()
  const [isAddResourceOpen, setIsAddResourceOpen] = useState(false)
  const [isEditResourceOpen, setIsEditResourceOpen] = useState(false)
  const [editingResource, setEditingResource] = useState<ApiResource | null>(null)
  const [studySet, setStudySet] = useState<StudyStack | null>(null)
  const [resources, setResources] = useState<ApiResource[]>([])
  const [loading, setLoading] = useState(true)
  
  const currentUserId = "current-user-id" // Would come from Clerk in real app
  const setId = Array.isArray(params.id) ? params.id[0] : params.id

  useEffect(() => { // Load study set and resources on mount
    const loadData = async () => {
      if (!setId) return
      
      try {
        setLoading(true)
        
        // Load study set details
        const studySetData = await studyStackService.getStudyStack(setId)
        setStudySet(studySetData)
        
        // Load resources for this study set
        const resourcesData = await resourceService.getResources(setId)
        setResources(resourcesData)
      } catch (error) {
        console.error('Failed to load study set:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [setId])
  
  if (loading) {
    return (
      <div className="container mx-auto p-12">
        <div className="text-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  if (!studySet) {
    return (
      <div className="container mx-auto p-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Set Not Found</h1>
          <Button onClick={() => router.push('/')}>Go Back Home</Button>
        </div>
      </div>
    )
  }

  const isOwner = studySet.ownerId === currentUserId

  const handleAddResource = async (data: ResourceData) => {
    if (!setId) return
    
    try {
      // Auto-detect resource type and generate embed URL for YouTube
      let resourceType = data.resourceType
      let embedUrl: string | undefined

      if (data.resourceUrl) {
        resourceType = apiUtils.detectResourceType(data.resourceUrl)
        if (resourceType === 'youtube') {
          embedUrl = apiUtils.getYouTubeEmbedUrl(data.resourceUrl) || undefined
        }
      }

      await resourceService.createResource({
        studyStackId: setId,
        title: data.title,
        description: data.description,
        resourceType,
        resourceUrl: data.resourceUrl || '',
        embedUrl,
        userNotes: data.userNotes,
      })

      // Refresh resources
      const resourcesData = await resourceService.getResources(setId)
      setResources(resourcesData)
      
      setIsAddResourceOpen(false)
    } catch (error) {
      console.error('Failed to add resource:', error)
    }
  }

  const handleEditResource = async (data: ResourceData) => {
    if (!editingResource) return
    
    try {
      // Auto-detect resource type and generate embed URL for YouTube
      let resourceType = data.resourceType
      let embedUrl: string | undefined

      if (data.resourceUrl) {
        resourceType = apiUtils.detectResourceType(data.resourceUrl)
        if (resourceType === 'youtube') {
          embedUrl = apiUtils.getYouTubeEmbedUrl(data.resourceUrl) || undefined
        }
      }

      await resourceService.updateResource(editingResource.id, {
        title: data.title,
        description: data.description,
        resourceType,
        resourceUrl: data.resourceUrl || '',
        embedUrl,
        userNotes: data.userNotes,
      })

      // Refresh resources
      if (setId) {
        const resourcesData = await resourceService.getResources(setId)
        setResources(resourcesData)
      }
      
      setIsEditResourceOpen(false)
      setEditingResource(null)
    } catch (error) {
      console.error('Failed to edit resource:', error)
    }
  }

  const handleDeleteResource = async (resourceId: string) => {
    try {
      await resourceService.deleteResource(resourceId)
      
      // Refresh resources
      if (setId) {
        const resourcesData = await resourceService.getResources(setId)
        setResources(resourcesData)
      }
    } catch (error) {
      console.error('Failed to delete resource:', error)
    }
  }

  const openEditDialog = (resource: ApiResource) => {
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

      {/* Set Info */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <span className="text-4xl">{studySet.emoji}</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{studySet.title}</h1>
              <p className="text-gray-600 text-lg">{studySet.description}</p>
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
          {!isOwner && ' • Public Set'}
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
                  ? "Start building your study set by adding your first resource."
                  : "This study set doesn't have any resources yet."
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
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map((resource) => (
              <Card 
                key={resource.id} 
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
                                handleDeleteResource(resource.id)
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
