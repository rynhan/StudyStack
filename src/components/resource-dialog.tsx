"use client"

import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Link, Upload, FileText } from "lucide-react"

type ResourceData = {
  title: string
  description: string
  resourceType: 'youtube' | 'webpage' | 'document' | 'image'
  resourceUrl?: string
  file?: File
  userNotes: string
}

interface AddResourceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: ResourceData) => void
  mode?: 'add' | 'edit'
  initialData?: Partial<ResourceData>
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
    
    // Reset form
    setForm({
      title: "",
      description: "",
      resourceType: "webpage",
      resourceUrl: "",
      userNotes: "",
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Edit Resource' : 'Add Resource'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
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
                  <Label htmlFor="resourceUrl">Resource URL</Label>
                  <Input
                    id="resourceUrl"
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
                  <Label htmlFor="file">Upload File</Label>
                  <Input
                    id="file"
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
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter resource title"
                value={form.title}
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Brief description of the resource"
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            {/* Personal Notes */}
            <div>
              <Label htmlFor="userNotes">Personal Notes</Label>
              <textarea
                id="userNotes"
                className="w-full min-h-[60px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Add your personal notes about this resource"
                value={form.userNotes}
                onChange={(e) => setForm(prev => ({ ...prev, userNotes: e.target.value }))}
              />
            </div>

            {/* Resource Type Preview */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText className="h-4 w-4" />
                <span>Type: </span>
                <span className="font-medium capitalize">{form.resourceType}</span>
              </div>
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
