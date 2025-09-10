import { useState, useEffect } from 'react'
import { stacksApi, resourcesApi, Stack, Resource, ResourceData } from '@/lib/api'
import { detectResourceType, getYouTubeEmbedUrl } from '@/lib/resource-utils'

export const useStack = (stackId: string | undefined) => {
  const [studyStack, setStudyStack] = useState<Stack | null>(null)
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)

  const refreshData = async () => {
    if (!stackId) return
    
    try {
      setLoading(true)
      const [stackData, resourcesData] = await Promise.all([
        stacksApi.getById(stackId),
        resourcesApi.getByStackId(stackId)
      ])
      setStudyStack(stackData)
      setResources(resourcesData)
    } catch (error) {
      console.error('Failed to load study stack:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshData()
  }, [stackId]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleStackPublic = async (checked: boolean) => {
    if (!stackId) return
    try {
      setStudyStack(prev => prev ? { ...prev, isPublic: checked } : prev)
      await stacksApi.update(stackId, { isPublic: checked })
    } catch (err) {
      // Revert on error
      setStudyStack(prev => prev ? { ...prev, isPublic: !prev.isPublic } : prev)
      console.error('Failed to update stack visibility', err)
    }
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

      await resourcesApi.create(stackId, {
        ...data,
        resourceType,
        resourceUrl: data.resourceUrl || '',
        embedUrl,
        status: data.status || 'reference',
      })

      // Refresh resources
      const resourcesData = await resourcesApi.getByStackId(stackId)
      setResources(resourcesData)
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

      await resourcesApi.update(stackId, resourceId, {
        ...data,
        resourceType,
        resourceUrl: data.resourceUrl || '',
        embedUrl,
        status: data.status || 'reference',
      })

      // Refresh resources
      const resourcesData = await resourcesApi.getByStackId(stackId)
      setResources(resourcesData)
    } catch (error) {
      console.error('Failed to edit resource:', error)
    }
  }

  const handleDeleteResource = async (resourceId: string) => {
    if (!stackId) return
    
    try {
      await resourcesApi.delete(stackId, resourceId)
      
      // Refresh resources
      const resourcesData = await resourcesApi.getByStackId(stackId)
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
      
      await resourcesApi.update(stackId, resourceId, {
        title: resource.title,
        description: resource.description,
        resourceType: resource.resourceType,
        resourceUrl: resource.resourceUrl,
        embedUrl: resource.embedUrl,
        userNotes: resource.userNotes,
        status: newStatus,
      })

      // Refresh resources
      const resourcesData = await resourcesApi.getByStackId(stackId)
      setResources(resourcesData)
    } catch (error) {
      console.error('Failed to update resource status:', error)
    }
  }

  return {
    studyStack,
    resources,
    loading,
    toggleStackPublic,
    handleAddResource,
    handleEditResource,
    handleDeleteResource,
    handleStatusChange,
    refreshData
  }
}
