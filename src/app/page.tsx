"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import StudyStackCard from "@/components/study-stack-card"
import DialogStack from "@/components/dialog-stack"

// Mock data for Study Sets
const privateSets = [
  {
    id: "1",
    title: "Introduction to Biology",
    description: "A curated set of resources for Biology 101.",
    date: "8 Sept 2025",
    resourceCount: 5,
    emoji: "🧬",
  },
  {
    id: "2",
    title: "World History",
    description: "Key articles and videos for world history.",
    date: "7 Sept 2025",
    resourceCount: 8,
    emoji: "🌍",
  },
]

const publicSets = [
  {
    id: "3",
    title: "Calculus Basics: A comprehensive guide to Calculus",
    description: "Fundamental concepts and practice problems. This set covers limits, derivatives, and integrals with examples.",
    date: "6 Sept 2025",
    resourceCount: 6,
    emoji: "📐",
  },
]

export default function Home() {
  const handleEditSet = (id: string, data: { title: string; description: string }) => {
    console.log('Edit set:', id, 'New data:', data)
    // TODO: Implement edit functionality - update the set in your state/database
  }

  const handleDeleteSet = (id: string) => {
    console.log('Delete set:', id)
    // TODO: Implement delete functionality - remove the set from your state/database
  }

  return (
    <main className="container mx-auto p-12">

      <Tabs defaultValue="private" className="w-full">

        <TabsList className="mb-6">
          <TabsTrigger value="private">My Stacks</TabsTrigger>
          <TabsTrigger value="public">Community Stacks</TabsTrigger>
        </TabsList>

        <TabsContent value="public">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Only show public sets, no create button */}
            {publicSets.map(set => (
              <StudyStackCard key={set.id} set={set} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="private">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Create New Stack Card triggers dialog */}
            <DialogStack onCreate={(data) => { console.log('create stack', data) }}>
              <Card className="flex flex-col items-center justify-center h-60 cursor-pointer hover:shadow-lg transition">
                <Button size="icon" className="mb-2 rounded-full w-12 h-12 text-2xl">+</Button>
                <span className="font-medium">Create New Stack</span>
              </Card>
            </DialogStack>
            {/* Private sets */}
            {privateSets.map(set => (
              <StudyStackCard 
                key={set.id} 
                set={set} 
                onEdit={handleEditSet}
                onDelete={handleDeleteSet}
              />
            ))}
          </div>
        </TabsContent>
        
      </Tabs>

    </main>
  )
}
