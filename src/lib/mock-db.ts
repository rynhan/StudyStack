// Mock database for StudyStack application
// In a real application, this would be replaced with actual database calls

export type StudyStack = {
  id: string
  title: string
  description: string
  emoji: string
  isPublic: boolean
  ownerId: string
  createdAt: string
  updatedAt: string
  resourceCount: number
}

export type Resource = {
  id: string
  studyStackId: string
  title: string
  description?: string
  resourceType: 'youtube' | 'webpage' | 'document' | 'image'
  resourceUrl: string
  embedUrl?: string
  filePath?: string
  userNotes?: string
  orderIndex: number
  createdAt: string
  updatedAt: string
}

// Mock data store
const studyStacks: StudyStack[] = [
  {
    id: "1",
    title: "Introduction to Biology",
    description: "A curated set of resources for Biology 101.",
    emoji: "🧬",
    isPublic: false,
    ownerId: "current-user-id",
    createdAt: "2025-09-08T00:00:00Z",
    updatedAt: "2025-09-08T00:00:00Z",
    resourceCount: 3,
  },
  {
    id: "2", 
    title: "World History",
    description: "Key articles and videos for world history.",
    emoji: "🌍",
    isPublic: false,
    ownerId: "current-user-id",
    createdAt: "2025-09-07T00:00:00Z",
    updatedAt: "2025-09-07T00:00:00Z",
    resourceCount: 1,
  },
  {
    id: "3",
    title: "Calculus Basics",
    description: "Fundamental concepts and practice problems. This set covers limits, derivatives, and integrals with examples.",
    emoji: "📐",
    isPublic: true,
    ownerId: "other-user-id",
    createdAt: "2025-09-06T00:00:00Z",
    updatedAt: "2025-09-06T00:00:00Z",
    resourceCount: 1,
  },
]

const resources: Resource[] = [
  {
    id: "r1",
    studyStackId: "1",
    title: "DNA Structure and Function",
    description: "Comprehensive overview of DNA structure, replication, and function in biological systems.",
    resourceType: "youtube",
    resourceUrl: "https://www.youtube.com/watch?v=8kK2zwjRV0M",
    embedUrl: "https://www.youtube.com/embed/8kK2zwjRV0M",
    userNotes: "Great introduction video for beginners",
    orderIndex: 1,
    createdAt: "2025-09-08T00:00:00Z",
    updatedAt: "2025-09-08T00:00:00Z",
  },
  {
    id: "r2",
    studyStackId: "1",
    title: "Cell Biology Fundamentals", 
    description: "Essential concepts in cell biology including organelles, cell division, and cellular processes.",
    resourceType: "webpage",
    resourceUrl: "https://example.com/cell-biology",
    userNotes: "Good reference material",
    orderIndex: 2,
    createdAt: "2025-09-08T00:00:00Z",
    updatedAt: "2025-09-08T00:00:00Z",
  },
  {
    id: "r3",
    studyStackId: "1",
    title: "Biology Lab Manual",
    description: "Laboratory exercises and procedures for introductory biology course.",
    resourceType: "document",
    resourceUrl: "/documents/bio-lab-manual.pdf",
    filePath: "/documents/bio-lab-manual.pdf",
    userNotes: "Required for lab work",
    orderIndex: 3,
    createdAt: "2025-09-08T00:00:00Z",
    updatedAt: "2025-09-08T00:00:00Z",
  },
  {
    id: "r4",
    studyStackId: "2",
    title: "World War II Timeline",
    description: "Interactive timeline covering major events of World War II from 1939-1945.",
    resourceType: "webpage",
    resourceUrl: "https://example.com/ww2-timeline",
    userNotes: "Interactive and engaging",
    orderIndex: 1,
    createdAt: "2025-09-07T00:00:00Z",
    updatedAt: "2025-09-07T00:00:00Z",
  },
  {
    id: "r5",
    studyStackId: "3",
    title: "Limits and Continuity",
    description: "Fundamental concepts of limits, continuity, and their applications in calculus.",
    resourceType: "youtube",
    resourceUrl: "https://www.youtube.com/watch?v=example",
    embedUrl: "https://www.youtube.com/embed/example",
    userNotes: "Clear explanations",
    orderIndex: 1,
    createdAt: "2025-09-06T00:00:00Z",
    updatedAt: "2025-09-06T00:00:00Z",
  },
]

// Helper function to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9)

// Study Stacks API Functions
export const studyStackApi = {
  // Get all study stacks
  getAll: (): StudyStack[] => {
    return studyStacks
  },

  // Get study stacks by owner
  getByOwner: (ownerId: string): StudyStack[] => {
    return studyStacks.filter(stack => stack.ownerId === ownerId)
  },

  // Get public study stacks
  getPublic: (): StudyStack[] => {
    return studyStacks.filter(stack => stack.isPublic)
  },

  // Get study stack by ID
  getById: (id: string): StudyStack | undefined => {
    return studyStacks.find(stack => stack.id === id)
  },

  // Create new study stack
  create: (data: Omit<StudyStack, 'id' | 'createdAt' | 'updatedAt' | 'resourceCount'>): StudyStack => {
    const now = new Date().toISOString()
    const newStack: StudyStack = {
      id: generateId(),
      ...data,
      createdAt: now,
      updatedAt: now,
      resourceCount: 0,
    }
    studyStacks.push(newStack)
    return newStack
  },

  // Update study stack
  update: (id: string, data: Partial<Omit<StudyStack, 'id' | 'createdAt' | 'resourceCount'>>): StudyStack | null => {
    const index = studyStacks.findIndex(stack => stack.id === id)
    if (index === -1) return null

    const updatedStack = {
      ...studyStacks[index],
      ...data,
      updatedAt: new Date().toISOString(),
    }
    studyStacks[index] = updatedStack
    return updatedStack
  },

  // Delete study stack
  delete: (id: string): boolean => {
    const index = studyStacks.findIndex(stack => stack.id === id)
    if (index === -1) return false

    // Also delete all resources for this stack
    const resourcesToKeep = resources.filter(resource => resource.studyStackId !== id)
    resources.splice(0, resources.length, ...resourcesToKeep)
    studyStacks.splice(index, 1)
    return true
  },

  // Copy study stack (duplicate with new owner)
  copy: (id: string, newOwnerId: string): StudyStack | null => {
    const originalStack = studyStacks.find(stack => stack.id === id)
    if (!originalStack) return null

    const now = new Date().toISOString()
    const copiedStack: StudyStack = {
      ...originalStack,
      id: generateId(),
      title: `${originalStack.title} (Copy)`,
      ownerId: newOwnerId,
      isPublic: false, // Copies are always private initially
      createdAt: now,
      updatedAt: now,
    }
    studyStacks.push(copiedStack)

    // Copy all resources
    const originalResources = resources.filter(r => r.studyStackId === id)
    originalResources.forEach(resource => {
      const copiedResource: Resource = {
        ...resource,
        id: generateId(),
        studyStackId: copiedStack.id,
        createdAt: now,
        updatedAt: now,
      }
      resources.push(copiedResource)
    })

    return copiedStack
  },

  // Update resource count
  updateResourceCount: (id: string): void => {
    const stack = studyStacks.find(s => s.id === id)
    if (stack) {
      stack.resourceCount = resources.filter(r => r.studyStackId === id).length
      stack.updatedAt = new Date().toISOString()
    }
  }
}

// Resources API Functions
export const resourceApi = {
  // Get all resources for a study stack
  getByStudyStackId: (studyStackId: string): Resource[] => {
    return resources
      .filter(resource => resource.studyStackId === studyStackId)
      .sort((a, b) => a.orderIndex - b.orderIndex)
  },

  // Get resource by ID
  getById: (id: string): Resource | undefined => {
    return resources.find(resource => resource.id === id)
  },

  // Create new resource
  create: (data: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>): Resource => {
    const now = new Date().toISOString()
    const newResource: Resource = {
      id: generateId(),
      ...data,
      createdAt: now,
      updatedAt: now,
    }
    resources.push(newResource)
    
    // Update study stack resource count
    studyStackApi.updateResourceCount(data.studyStackId)
    
    return newResource
  },

  // Update resource
  update: (id: string, data: Partial<Omit<Resource, 'id' | 'createdAt'>>): Resource | null => {
    const index = resources.findIndex(resource => resource.id === id)
    if (index === -1) return null

    const updatedResource = {
      ...resources[index],
      ...data,
      updatedAt: new Date().toISOString(),
    }
    resources[index] = updatedResource
    
    // Update study stack resource count if studyStackId changed
    if (data.studyStackId) {
      studyStackApi.updateResourceCount(data.studyStackId)
    }
    
    return updatedResource
  },

  // Delete resource
  delete: (id: string): boolean => {
    const index = resources.findIndex(r => r.id === id)
    if (index === -1) return false

    const resource = resources[index]
    resources.splice(index, 1)
    
    // Update study stack resource count
    studyStackApi.updateResourceCount(resource.studyStackId)
    
    return true
  },

  // Reorder resources
  reorder: (studyStackId: string, resourceIds: string[]): Resource[] => {
    const studyStackResources = resources.filter(r => r.studyStackId === studyStackId)
    
    resourceIds.forEach((resourceId, index) => {
      const resource = studyStackResources.find(r => r.id === resourceId)
      if (resource) {
        resource.orderIndex = index + 1
        resource.updatedAt = new Date().toISOString()
      }
    })
    
    return resourceApi.getByStudyStackId(studyStackId)
  }
}
