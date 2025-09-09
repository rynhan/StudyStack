"use client"

import React, { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ExternalLink, FileText, Video, Image as ImageIcon, Edit, Trash2, MoreVertical } from "lucide-react"
import AddResourceDialog from "./resource-dialog"

interface Resource {
  _id: string
  studyStackId: string
  title: string
  description?: string
  resourceType: 'youtube' | 'webpage' | 'document' | 'image'
  status?: 'reference' | 'todo' | 'inprogress' | 'done'
  resourceUrl: string
  embedUrl?: string
  filePath?: string
  userNotes?: string
  createdAt: string
  updatedAt: string
}

type ResourceData = {
  title: string
  description: string
  resourceType: 'youtube' | 'webpage' | 'document' | 'image'
  resourceUrl?: string
  file?: File
  userNotes: string
  status?: 'reference' | 'todo' | 'inprogress' | 'done'
}

const getResourceIcon = (type: Resource['resourceType']) => {
  switch (type) {
    case 'youtube':
      return <Video className="h-5 w-5 text-red-500" />
    case 'webpage':
      return <ExternalLink className="h-5 w-5 text-blue-500" />
    case 'document':
      return <FileText className="h-5 w-5 text-green-500" />
    case 'image':
      return <ImageIcon className="h-5 w-5 text-purple-500" />
    default:
      return <FileText className="h-5 w-5 text-gray-500" />
  }
}

interface ResourceCardProps {
  resource: Resource
  isOwner?: boolean
  onClick?: (resource: Resource) => void
  onEdit?: (resourceId: string, data: ResourceData) => void
  onDelete?: (resourceId: string) => void
  onStatusChange?: (resourceId: string, newStatus: Resource['status']) => void
}

export default function ResourceCard({
  resource,
  isOwner = false,
  onClick,
  onEdit,
  onDelete,
  onStatusChange,
}: ResourceCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditDialogOpen(true)
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    onDelete?.(resource._id)
    setIsDeleteDialogOpen(false)
  }

  const handleEditSubmit = (data: ResourceData) => {
    onEdit?.(resource._id, data)
    setIsEditDialogOpen(false)
  }

  const handleCardClick = () => {
    onClick?.(resource)
  }

  return (
    <>
      <Card 
        className="p-6 hover:shadow-md transition-shadow relative group cursor-pointer"
        onClick={handleCardClick}
      >
        {/* Action Menu for Owners */}
        {isOwner && (
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
                  onClick={handleMenuClick}
                >
                  <MoreVertical className="h-4 w-4 text-gray-500" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-32 p-1" align="end">
                <div className="flex flex-col">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="justify-start h-8 px-2 text-sm"
                    onClick={handleEditClick}
                  >
                    <Edit className="h-3 w-3 mr-2" />
                    Edit
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="justify-start h-8 px-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handleDeleteClick}
                  >
                    <Trash2 className="h-3 w-3 mr-2" />
                    Delete
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}

        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-1">
            {getResourceIcon(resource.resourceType)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-lg text-gray-900 leading-tight">
                {resource.title}
              </h3>
            </div>
            {resource.description && (
              <p className="text-gray-600 mb-3 leading-relaxed">
                {resource.description}
              </p>
            )}
            {resource.userNotes && (
              <div className="bg-blue-50 border-l-4 border-blue-200 p-3">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Note:</span> {resource.userNotes}
                </p>
              </div>
            )}
            
            {/* Start Learning Button for reference/unspecified resources */}
            {isOwner && onStatusChange && (!resource.status || !['todo', 'inprogress', 'done'].includes(resource.status)) && (
              <div className="mt-4">
                <Button
                  size="sm"
                  variant="default"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={(e) => {
                    e.stopPropagation()
                    onStatusChange(resource._id, 'todo')
                  }}
                >
                  Start Learning
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Edit Dialog */}
      <AddResourceDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSubmit={handleEditSubmit}
        mode="edit"
        initialData={{
          title: resource.title,
          description: resource.description || '',
          resourceType: resource.resourceType,
          resourceUrl: resource.resourceUrl,
          userNotes: resource.userNotes || '',
          status: resource.status,
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Resource</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{resource.title}&rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
