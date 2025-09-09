"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import StudyStackCard from "@/components/study-stack-card"
import StudyStackDialog from "@/components/study-stack-dialog"
import { useRouter } from "next/navigation"
import { useUser } from '@clerk/nextjs'

// Type based on the API v1 response and Mongoose schema
interface Stack {
  _id: string
  title: string
  description: string
  emoji: string
  isPublic: boolean
  ownerId: string
  resourceCount: number // Now always included from API
  createdAt: string
  updatedAt: string
}

export default function Home() {
  const router = useRouter()
  const [privateStacks, setPrivateStacks] = useState<Stack[]>([])
  const [publicStacks, setPublicStacks] = useState<Stack[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const { user } = useUser() // Get current user from Clerk
  
  
  const currentUserId = user?.id // In a real app, this would come from Clerk's useUser hook

  useEffect(() => { // Load data on component mount
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Load all stacks from API v1
        const response = await fetch('/api/v1/stacks')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const allStacks: Stack[] = await response.json()
        
        // Filter all stacks owned by current user (private and public)
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

    loadData()
  }, [currentUserId])

  const handleEditStack = async (id: string, data: { title: string; description: string; emoji?: string; isPublic?: boolean }) => {
    try {
      const response = await fetch(`/api/v1/stacks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      // Refresh the stacks
      const allStacksResponse = await fetch('/api/v1/stacks')
      const allStacks: Stack[] = await allStacksResponse.json()
      
      // Filter all stacks owned by current user (private and public)
      const myStacks = allStacks.filter(stack => stack.ownerId === currentUserId)
      setPrivateStacks(myStacks)
      
      // Filter public stacks
      const publicStacksList = allStacks.filter(stack => stack.isPublic)
      setPublicStacks(publicStacksList)
    } catch (error) {
      console.error('Failed to edit stack:', error)
    }
  }

  const handleDeleteStack = async (id: string) => {
    try {
      const response = await fetch(`/api/v1/stacks/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      // Refresh the stacks
      const allStacksResponse = await fetch('/api/v1/stacks')
      const allStacks: Stack[] = await allStacksResponse.json()
      
      // Filter all stacks owned by current user (private and public)
      const myStacks = allStacks.filter(stack => stack.ownerId === currentUserId)
      setPrivateStacks(myStacks)
      
      // Filter public stacks
      const publicStacksList = allStacks.filter(stack => stack.isPublic)
      setPublicStacks(publicStacksList)
    } catch (error) {
      console.error('Failed to delete stack:', error)
    }
  }

  const handleCopyStack = async (id: string) => {
    try {
      const response = await fetch(`/api/v1/stacks/${id}/copy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ownerId: currentUserId }),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      // Refresh the stacks to show the new copy
      const allStacksResponse = await fetch('/api/v1/stacks')
      const allStacks: Stack[] = await allStacksResponse.json()
      
      // Filter all stacks owned by current user (private and public)
      const myStacks = allStacks.filter(stack => stack.ownerId === currentUserId)
      setPrivateStacks(myStacks)
      
      // Filter public stacks
      const publicStacksList = allStacks.filter(stack => stack.isPublic)
      setPublicStacks(publicStacksList)
    } catch (error) {
      console.error('Failed to copy stack:', error)
    }
  }

  const handleCreateStack = async (data: { title: string; description: string; emoji?: string; isPublic?: boolean }) => {
    try {
      const response = await fetch('/api/v1/stacks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          ownerId: currentUserId,
          isPublic: data.isPublic || false,
        }),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const newStack: Stack = await response.json()
      router.push(`/stacks/${newStack._id}`)
    } catch (error) {
      console.error('Failed to create stack:', error)
    }
  }

  const handleViewStack = (id: string) => {
    router.push(`/stacks/${id}`)
  }

  return (
    <main className="container mx-auto p-12">
      {loading ? (
        <div className="flex justify-center items-center min-h-64">
          <p className="text-gray-500">Loading...</p>
        </div>
      ) : (
        <Tabs defaultValue="private" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="private">My Stacks</TabsTrigger>
            <TabsTrigger value="public">Community Stacks</TabsTrigger>
          </TabsList>

          <TabsContent value="public">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* Only show public stacks, no create button */}
              {publicStacks.map(stack => (
                <StudyStackCard 
                  key={stack._id} 
                  set={{ ...stack, id: stack._id }} 
                  isOwner={stack.ownerId === currentUserId}
                  onCopy={handleCopyStack}
                  onClick={() => handleViewStack(stack._id)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="private">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* Create New Stack Card triggers dialog */}
              <Card 
                className="flex flex-col items-center justify-center h-60 cursor-pointer hover:shadow-lg transition"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Button size="icon" className="mb-2 rounded-full w-12 h-12 text-2xl">+</Button>
                <span className="font-medium">Create New Stack</span>
              </Card>
              {/* Private stacks */}
              {privateStacks.map(stack => (
                <StudyStackCard 
                  key={stack._id} 
                  set={{ ...stack, id: stack._id }} 
                  isOwner={stack.ownerId === currentUserId}
                  onEdit={handleEditStack}
                  onDelete={handleDeleteStack}
                  onClick={() => handleViewStack(stack._id)}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Single Create Stack Dialog */}
      <StudyStackDialog
        mode="create"
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateStack}
      />
    </main>
  )
}
