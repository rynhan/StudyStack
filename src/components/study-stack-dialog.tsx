"use client"

import React, { useState, useEffect } from "react"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type StudyStackData = {
  title: string
  description: string
  emoji?: string
}

interface StudyStackDialogProps {
  children?: React.ReactNode
  mode: 'create' | 'edit'
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: StudyStackData
  onSubmit: (data: StudyStackData) => void
}

export default function StudyStackDialog({ 
  children, 
  mode, 
  open, 
  onOpenChange, 
  initialData, 
  onSubmit 
}: StudyStackDialogProps) {
  const [form, setForm] = useState<StudyStackData>({
    title: "",
    description: "",
    emoji: "📚"
  })

  useEffect(() => {
    if (initialData) {
      setForm(initialData)
    } else {
      setForm({ title: "", description: "", emoji: "📚" })
    }
  }, [initialData, open])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(form)
    onOpenChange(false)
  }

  const isCreate = mode === 'create'
  const title = isCreate ? 'Create New Study Stack' : 'Edit Study Stack'
  const description = isCreate 
    ? 'Create a new study stack to organize your learning materials.' 
    : 'Update your study stack information.'
  const submitText = isCreate ? 'Create' : 'Save Changes'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && (
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
      )}

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="title">Title</Label>
            <Input 
              id="title"
              name="title" 
              placeholder="Enter study stack title" 
              value={form.title} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <textarea 
              id="description"
              name="description" 
              placeholder="Enter study stack description" 
              className="w-full border rounded p-2 min-h-[80px] resize-y" 
              value={form.description} 
              onChange={handleChange} 
              rows={3} 
            />
          </div>

          {isCreate && (
            <div>
              <Label htmlFor="emoji">Emoji</Label>
              <Input 
                id="emoji"
                name="emoji" 
                placeholder="📚" 
                value={form.emoji} 
                onChange={handleChange}
                maxLength={2}
              />
            </div>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{submitText}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
