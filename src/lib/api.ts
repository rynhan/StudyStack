import axios from 'axios'

export interface Stack {
  _id: string
  title: string
  description: string
  emoji: string
  isPublic: boolean
  ownerId: string
  resourceCount?: number
  createdAt: string
  updatedAt: string
}

export interface Resource {
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

export type ResourceData = {
  title: string
  description: string
  resourceType: 'youtube' | 'webpage' | 'document' | 'image'
  resourceUrl?: string
  embedUrl?: string
  file?: File
  userNotes: string
  status?: 'reference' | 'todo' | 'inprogress' | 'done'
}

// API functions
export const stacksApi = {
  getAll: () => axios.get<Stack[]>('/api/v1/stacks').then(res => res.data),
  
  getById: (id: string) => axios.get<Stack>(`/api/v1/stacks/${id}`).then(res => res.data),
  
  create: (data: Partial<Stack>) => axios.post<Stack>('/api/v1/stacks', data).then(res => res.data),
  
  update: (id: string, data: Partial<Stack>) => axios.put<Stack>(`/api/v1/stacks/${id}`, data).then(res => res.data),
  
  delete: (id: string) => axios.delete(`/api/v1/stacks/${id}`),
  
  copy: (id: string, ownerId: string) => axios.post(`/api/v1/stacks/${id}/copy`, { ownerId })
}

export const resourcesApi = {
  getByStackId: (stackId: string) => 
    axios.get<Resource[]>(`/api/v1/stacks/${stackId}/resources`).then(res => res.data),
  
  create: (stackId: string, data: ResourceData) =>
    axios.post<Resource>(`/api/v1/stacks/${stackId}/resources`, data).then(res => res.data),
  
  update: (stackId: string, resourceId: string, data: Partial<ResourceData>) =>
    axios.put<Resource>(`/api/v1/stacks/${stackId}/resources/${resourceId}`, data).then(res => res.data),
  
  delete: (stackId: string, resourceId: string) =>
    axios.delete(`/api/v1/stacks/${stackId}/resources/${resourceId}`)
}
