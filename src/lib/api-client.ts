// API client for StudyStack application
import { useState } from 'react'
import { StudyStack, Resource } from './mock-db'

// Base API configuration
const API_BASE = '/api'

// Helper function for API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE}${endpoint}`
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || `HTTP error! status: ${response.status}`)
  }

  return data
}

// Study Stacks API
export const studyStackService = {
  // Get all study stacks for a user
  getMyStudyStacks: async (ownerId: string): Promise<StudyStack[]> => {
    const response = await apiRequest(`/study-stacks?ownerId=${ownerId}`)
    return response.data
  },

  // Get public study stacks
  getPublicStudyStacks: async (): Promise<StudyStack[]> => {
    const response = await apiRequest('/study-stacks?public=true')
    return response.data
  },

  // Get a specific study stack
  getStudyStack: async (id: string): Promise<StudyStack> => {
    const response = await apiRequest(`/study-stacks/${id}`)
    return response.data
  },

  // Create a new study stack
  createStudyStack: async (data: {
    title: string
    description: string
    emoji?: string
    isPublic?: boolean
    ownerId: string
  }): Promise<StudyStack> => {
    const response = await apiRequest('/study-stacks', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return response.data
  },

  // Update a study stack
  updateStudyStack: async (id: string, data: {
    title?: string
    description?: string
    emoji?: string
    isPublic?: boolean
  }): Promise<StudyStack> => {
    const response = await apiRequest(`/study-stacks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    return response.data
  },

  // Delete a study stack
  deleteStudyStack: async (id: string): Promise<void> => {
    await apiRequest(`/study-stacks/${id}`, {
      method: 'DELETE',
    })
  },

  // Copy a study stack
  copyStudyStack: async (id: string, ownerId: string): Promise<StudyStack> => {
    const response = await apiRequest(`/study-stacks/${id}/copy`, {
      method: 'POST',
      body: JSON.stringify({ ownerId }),
    })
    return response.data
  },
}

// Resources API
export const resourceService = {
  // Get all resources for a study stack
  getResources: async (studyStackId: string): Promise<Resource[]> => {
    const response = await apiRequest(`/resources?studyStackId=${studyStackId}`)
    return response.data
  },

  // Get a specific resource
  getResource: async (id: string): Promise<Resource> => {
    const response = await apiRequest(`/resources/${id}`)
    return response.data
  },

  // Create a new resource
  createResource: async (data: {
    studyStackId: string
    title: string
    description?: string
    resourceType: 'youtube' | 'webpage' | 'document' | 'image'
    resourceUrl: string
    embedUrl?: string
    filePath?: string
    userNotes?: string
    orderIndex?: number
  }): Promise<Resource> => {
    const response = await apiRequest('/resources', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return response.data
  },

  // Update a resource
  updateResource: async (id: string, data: {
    title?: string
    description?: string
    resourceType?: 'youtube' | 'webpage' | 'document' | 'image'
    resourceUrl?: string
    embedUrl?: string
    filePath?: string
    userNotes?: string
    orderIndex?: number
  }): Promise<Resource> => {
    const response = await apiRequest(`/resources/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    return response.data
  },

  // Delete a resource
  deleteResource: async (id: string): Promise<void> => {
    await apiRequest(`/resources/${id}`, {
      method: 'DELETE',
    })
  },
}

// Utility functions
export const apiUtils = {
  // Extract YouTube video ID from URL
  getYouTubeVideoId: (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ]
    
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) return match[1]
    }
    
    return null
  },

  // Generate YouTube embed URL
  getYouTubeEmbedUrl: (url: string): string | null => {
    const videoId = apiUtils.getYouTubeVideoId(url)
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null
  },

  // Detect resource type from URL
  detectResourceType: (url: string): 'youtube' | 'webpage' => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube'
    }
    return 'webpage'
  },

  // Format date for display
  formatDate: (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  },
}

// Error types for better error handling
export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message)
    this.name = 'ApiError'
  }
}

// React hooks for data fetching (optional, but useful)
export const useApiStatus = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = async <T>(apiCall: () => Promise<T>): Promise<T | null> => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiCall()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, execute }
}
