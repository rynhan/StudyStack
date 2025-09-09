"use client"

import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Link, Upload } from "lucide-react"

type ResourceData = {
  title: string
  description: string
  resourceType: 'youtube' | 'webpage' | 'document' | 'image'
  resourceUrl?: string
  file?: File
  userNotes: string
  status?: 'reference' | 'todo' | 'inprogress' | 'done'
}

interface AddResourceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: ResourceData) => void
  mode?: 'add' | 'edit'
  initialData?: Partial<ResourceData & { status?: 'reference' | 'todo' | 'inprogress' | 'done' }>
}

export default function AddResourceDialog({
  open,
  onOpenChange,
  onSubmit,
  mode = 'add',
  initialData,
}: AddResourceDialogProps) {
  const [form, setForm] = useState<ResourceData>({
    title: "",
    description: "",
    resourceType: "webpage",
    resourceUrl: "",
    userNotes: "",
  status: 'reference',
  })
  const [activeTab, setActiveTab] = useState("url")

  // Reset form when dialog opens/closes or when initial data changes
  useEffect(() => {
    if (open) {
  if (initialData && mode === 'edit') {
    setForm({
          title: initialData.title || "",
          description: initialData.description || "",
          resourceType: initialData.resourceType || "webpage",
          resourceUrl: initialData.resourceUrl || "",
          userNotes: initialData.userNotes || "",
  status: initialData.status || 'reference',
        })
        // Set active tab based on whether it's a URL resource or file
        setActiveTab(initialData.resourceUrl ? "url" : "file")
      } else {
        setForm({
          title: "",
          description: "",
          resourceType: "webpage",
    resourceUrl: "",
    userNotes: "",
    status: 'reference',
        })
        setActiveTab("url")
      }
    }
  }, [open, initialData, mode])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.title.trim()) return
    
    if (activeTab === "url" && !form.resourceUrl?.trim()) return
    if (activeTab === "file" && !form.file) return

    onSubmit(form)
    
    // Close dialog after successful submission
    onOpenChange(false)
    
    // Reset form
        setForm({
      title: "",
      description: "",
      resourceType: "webpage",
      resourceUrl: "",
      userNotes: "",
      status: 'reference',
    })
    setActiveTab("url")
  }

  const handleUrlChange = (url: string) => {
    setForm(prev => ({
      ...prev,
      resourceUrl: url,
      resourceType: getResourceTypeFromUrl(url)
    }))
  }

  const getResourceTypeFromUrl = (url: string): ResourceData['resourceType'] => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube'
    }
    return 'webpage'
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setForm(prev => ({
      ...prev,
      file,
      resourceType: getResourceTypeFromFile(file)
    }))
  }

  const getResourceTypeFromFile = (file: File): ResourceData['resourceType'] => {
    const type = file.type
    if (type.startsWith('image/')) {
      return 'image'
    }
    return 'document'
  }

  const isEdit = mode === 'edit'
  const title = isEdit ? 'Edit Resource' : 'Add New Resource'
  const description = isEdit 
    ? 'Update your resource information and notes.' 
    : 'Add a new resource to your study stack by URL or file upload.'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Resource Input Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="url" className="flex items-center gap-2">
                  <Link className="h-4 w-4" />
                  URL
                </TabsTrigger>
                <TabsTrigger value="file" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload File
                </TabsTrigger>
              </TabsList>

              <TabsContent value="url" className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="resourceUrl"><p>Resource URL<b className="text-red-700">*</b></p></Label>
                  <Input
                    id="resourceUrl"
                    className="mt-2 mb-1"
                    placeholder="https://example.com or YouTube URL"
                    value={form.resourceUrl || ""}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Paste a YouTube video link, article URL, or any web resource
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="file" className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="file"><p>Upload File<b className="text-red-700">*</b></p></Label>
                  <Input
                    id="file"
                    className="mt-2 mb-1"
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*,.pdf,.doc,.docx,.txt,.ppt,.pptx"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Supported: Images, PDFs, Word docs, PowerPoint, Text files
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title"><p>Title<b className="text-red-700">*</b></p></Label>
              <Input
                id="title"
                placeholder="Enter resource title"
                value={form.title}
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                placeholder="Brief description of the resource"
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            {/* Personal Notes */}
            <div className="space-y-2">
              <Label htmlFor="userNotes">Personal Notes</Label>
              <textarea
                id="userNotes"
                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                placeholder="Add your personal notes about this resource"
                value={form.userNotes}
                onChange={(e) => setForm(prev => ({ ...prev, userNotes: e.target.value }))}
                rows={2}
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Progress Status</Label>
              <select
                id="status"
                aria-label="Resource progress status"
                className="mt-2 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.status}
                onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value as ResourceData['status'] }))}
              >
                <option value="reference">Reference</option>
                <option value="todo">To Do</option>
                <option value="inprogress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === 'edit' ? 'Save Changes' : 'Add Resource'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
