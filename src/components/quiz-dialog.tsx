"use client"

import React, { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle } from "lucide-react"

interface Resource {
  _id: string
  title: string
  description?: string
  resourceType: string
}

interface CreateQuizDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  resources: Resource[]
  onSubmit: (data: {
    title: string
    description: string
    resourceIds: string[]
    numberOfQuestions: number
    useHOTS: boolean
  }) => void
}

export default function CreateQuizDialog({
  open,
  onOpenChange,
  resources,
  onSubmit
}: CreateQuizDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [selectedResourceIds, setSelectedResourceIds] = useState<string[]>([])
  const [numberOfQuestions, setNumberOfQuestions] = useState(5)
  const [useHOTS, setUseHOTS] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim() || selectedResourceIds.length === 0) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        resourceIds: selectedResourceIds,
        numberOfQuestions,
        useHOTS
      })
      
      // Reset form
      setTitle("")
      setDescription("")
      setSelectedResourceIds([])
      setNumberOfQuestions(5)
      setUseHOTS(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResourceToggle = (resourceId: string) => {
    setSelectedResourceIds(prev => 
      prev.includes(resourceId)
        ? prev.filter(id => id !== resourceId)
        : [...prev, resourceId]
    )
  }

  const selectAllResources = () => {
    setSelectedResourceIds(resources.map(r => r._id))
  }

  const clearAllResources = () => {
    setSelectedResourceIds([])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Create Quiz</DialogTitle>
          <DialogDescription>
            Generate an AI-powered quiz based on your study resources.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {/* Quiz Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Quiz Title *</Label>
              <Input
                id="title"
                placeholder="e.g., JavaScript Fundamentals Quiz"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Quiz Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Brief description of this quiz"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Number of Questions */}
            <div className="space-y-2">
              <Label htmlFor="questions">Number of Questions</Label>
              <Select value={numberOfQuestions.toString()} onValueChange={(value) => setNumberOfQuestions(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 Questions</SelectItem>
                  <SelectItem value="10">10 Questions</SelectItem>
                  <SelectItem value="15">15 Questions</SelectItem>
                  <SelectItem value="20">20 Questions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* HOTS Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="hots">Higher Order Thinking Skills (HOTS)</Label>
                <p className="text-sm text-gray-600">
                  Generate more challenging analytical questions
                </p>
              </div>
              <Switch
                id="hots"
                checked={useHOTS}
                onCheckedChange={setUseHOTS}
              />
            </div>

            {/* Resource Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Select Resources *</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={selectAllResources}
                    className="text-xs"
                  >
                    Select All
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearAllResources}
                    className="text-xs"
                  >
                    Clear All
                  </Button>
                </div>
              </div>
              
              {resources.length === 0 ? (
                <div className="flex items-center gap-2 p-3 border rounded-md bg-yellow-50 text-yellow-800">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">No resources available. Add some resources first.</span>
                </div>
              ) : (
                <div className="border rounded-md max-h-40 overflow-y-auto">
                  {resources.map((resource) => (
                    <div key={resource._id} className="flex items-center space-x-2 p-3 border-b last:border-b-0">
                      <Checkbox
                        id={resource._id}
                        checked={selectedResourceIds.includes(resource._id)}
                        onCheckedChange={() => handleResourceToggle(resource._id)}
                      />
                      <label
                        htmlFor={resource._id}
                        className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {resource.title}
                        {resource.description && (
                          <p className="text-xs text-gray-500 mt-1">{resource.description}</p>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              )}
              
              {selectedResourceIds.length > 0 && (
                <p className="text-xs text-gray-600">
                  {selectedResourceIds.length} resource{selectedResourceIds.length !== 1 ? 's' : ''} selected
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || selectedResourceIds.length === 0 || isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Quiz"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
