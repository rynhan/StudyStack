"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import StudyStackCard from "@/components/study-stack-card"
import StudyStackDialog from "@/components/study-stack-dialog"
import { useRouter } from "next/navigation"
import { studyStackService } from "@/lib/api-client"
import { StudyStack } from "@/lib/mock-db"

export default function Home() {
  const router = useRouter()
  const [privateStacks, setPrivateStacks] = useState<StudyStack[]>([])
  const [publicStacks, setPublicStacks] = useState<StudyStack[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  
  const currentUserId = "current-user-id" // In a real app, this would come from Clerk's useUser hook

  useEffect(() => { // Load data on component mount
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Load private stacks for current user
        const myStudyStacks = await studyStackService.getMyStudyStacks(currentUserId)
        setPrivateStacks(myStudyStacks)
        
        // Load public stacks
        const publicStudyStacks = await studyStackService.getPublicStudyStacks()
        setPublicStacks(publicStudyStacks)
      } catch (error) {
        console.error('Failed to load study stacks:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [currentUserId])

  const handleEditStack = async (id: string, data: { title: string; description: string }) => {
    try {
      await studyStackService.updateStudyStack(id, data)
      // Refresh the private stacks
      const myStudyStacks = await studyStackService.getMyStudyStacks(currentUserId)
      setPrivateStacks(myStudyStacks)
    } catch (error) {
      console.error('Failed to edit stack:', error)
    }
  }

  const handleDeleteStack = async (id: string) => {
    try {
      await studyStackService.deleteStudyStack(id)
      // Refresh the private stacks
      const myStudyStacks = await studyStackService.getMyStudyStacks(currentUserId)
      setPrivateStacks(myStudyStacks)
    } catch (error) {
      console.error('Failed to delete stack:', error)
    }
  }

  const handleCopyStack = async (id: string) => {
    try {
      await studyStackService.copyStudyStack(id, currentUserId)
      // Refresh the private stacks to show the new copy
      const myStudyStacks = await studyStackService.getMyStudyStacks(currentUserId)
      setPrivateStacks(myStudyStacks)
    } catch (error) {
      console.error('Failed to copy stack:', error)
    }
  }

  const handleCreateStack = async (data: { title: string; description: string; emoji?: string }) => {
    try {
      const newStack = await studyStackService.createStudyStack({
        ...data,
        ownerId: currentUserId
      })
      router.push(`/stacks/${newStack.id}`)
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
                  key={stack.id} 
                  set={stack} 
                  isOwner={stack.ownerId === currentUserId}
                  onCopy={handleCopyStack}
                  onClick={() => handleViewStack(stack.id)}
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
                  key={stack.id} 
                  set={stack} 
                  isOwner={stack.ownerId === currentUserId}
                  onEdit={handleEditStack}
                  onDelete={handleDeleteStack}
                  onClick={() => handleViewStack(stack.id)}
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
