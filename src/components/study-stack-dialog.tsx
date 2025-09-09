"use client"

import React, { useState, useEffect } from "react"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import ReusableEmojiPicker from "@/components/reusable-emoji-picker"

type StudyStackData = {
  title: string
  description: string
  emoji?: string
  isPublic?: boolean
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
    emoji: "📚",
    isPublic: false
  })

  useEffect(() => {
    if (initialData) {
      setForm(initialData)
    } else {
      setForm({ title: "", description: "", emoji: "📚", isPublic: false })
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
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="emoji">Emoji</Label>
            <div className="flex items-center gap-3">
              {/* Circular emoji display */}
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full text-2xl">
                {form.emoji}
              </div>
              
              {/* Change emoji button using reusable component */}
              <ReusableEmojiPicker
                emoji={form.emoji || "📚"}
                onEmojiSelect={(emoji) => setForm({ ...form, emoji })}
              >
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                >
                  Change emoji
                </Button>
              </ReusableEmojiPicker>
            </div>
          </div>

          <div className="space-y-2">
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
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea 
              id="description"
              name="description" 
              placeholder="Enter study stack description" 
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y" 
              value={form.description} 
              onChange={handleChange} 
              rows={3} 
            />
          </div>

          <div className="flex items-center space-x-3">
            <Switch
              id="isPublic"
              checked={form.isPublic}
              onCheckedChange={(checked) => setForm({ ...form, isPublic: checked })}
            />
            <Label htmlFor="isPublic" className="flex items-center gap-2">
              <span>
                This stack is <strong>{form.isPublic ? 'Public 🌐' : 'Private 🔒'}</strong>
              </span>
            </Label>
          </div>
          
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
