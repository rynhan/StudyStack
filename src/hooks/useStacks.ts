import { useState, useEffect } from 'react'
import { stacksApi, Stack } from '@/lib/api'

export const useStacks = (currentUserId?: string) => {
  const [privateStacks, setPrivateStacks] = useState<Stack[]>([])
  const [publicStacks, setPublicStacks] = useState<Stack[]>([])
  const [loading, setLoading] = useState(true)

  const refreshStacks = async () => {
    try {
      setLoading(true)
      const allStacks = await stacksApi.getAll()
      
      // Filter stacks owned by current user
      const myStacks = allStacks.filter(stack => stack.ownerId === currentUserId)
      setPrivateStacks(myStacks)
      
      // Filter public stacks
      const publicStacksList = allStacks.filter(stack => stack.isPublic)
      setPublicStacks(publicStacksList)
    } catch (error) {
      console.error('Failed to load study stacks:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentUserId !== undefined) { // Only load when we have user info
      refreshStacks()
    }
  }, [currentUserId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleEditStack = async (id: string, data: Partial<Stack>) => {
    try {
      await stacksApi.update(id, data)
      await refreshStacks()
    } catch (error) {
      console.error('Failed to edit stack:', error)
    }
  }

  const handleDeleteStack = async (id: string) => {
    try {
      await stacksApi.delete(id)
      await refreshStacks()
    } catch (error) {
      console.error('Failed to delete stack:', error)
    }
  }

  const handleCopyStack = async (id: string) => {
    if (!currentUserId) return
    try {
      await stacksApi.copy(id, currentUserId)
      await refreshStacks()
    } catch (error) {
      console.error('Failed to copy stack:', error)
    }
  }

  const handleCreateStack = async (data: Partial<Stack>) => {
    try {
      const newStack = await stacksApi.create({
        ...data,
        ownerId: currentUserId,
        isPublic: data.isPublic || false,
      })
      return newStack
    } catch (error) {
      console.error('Failed to create stack:', error)
      throw error
    }
  }

  return {
    privateStacks,
    publicStacks,
    loading,
    handleEditStack,
    handleDeleteStack,
    handleCopyStack,
    handleCreateStack,
    refreshStacks
  }
}
