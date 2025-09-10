// Utility functions for resource type detection
export const detectResourceType = (url?: string): 'youtube' | 'webpage' | 'document' | 'image' => {
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

export const getYouTubeEmbedUrl = (url: string): string | null => {
  // Convert regular YouTube URLs to embed URLs
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const match = url.match(youtubeRegex)
  
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}`
  }
  
  return null
}

export const handleResourceClick = (resource: { resourceType: string, resourceUrl: string }) => {
  if (resource.resourceType === 'youtube') {
    window.open(resource.resourceUrl, '_blank')
  } else if (resource.resourceType === 'webpage') {
    window.open(resource.resourceUrl, '_blank')
  } else if (resource.resourceType === 'document' || resource.resourceType === 'image') {
    // Handle file download or preview
    window.open(resource.resourceUrl, '_blank')
  }
}
