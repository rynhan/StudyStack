"use client"

import React, { useState, useEffect } from "react"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type StudySetData = {
  title: string
  description: string
  emoji?: string
}

interface StudySetDialogProps {
  children?: React.ReactNode
  mode: 'create' | 'edit'
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: StudySetData
  onSubmit: (data: StudySetData) => void
}

export default function StudyStackDialog({ 
  children, 
  mode, 
  open, 
  onOpenChange, 
  initialData, 
  onSubmit 
}: StudySetDialogProps) {
  const [form, setForm] = useState<StudySetData>({
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
  const title = isCreate ? 'Create New Study Set' : 'Edit Study Set'
  const description = isCreate 
    ? 'Create a new study set to organize your learning materials.' 
    : 'Update your study set information.'
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
              placeholder="Enter study set title" 
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
              placeholder="Enter study set description" 
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
