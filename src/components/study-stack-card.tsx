"use client"

import React, { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { EllipsisVertical, Copy } from 'lucide-react'
import StudyStackDialog from "./study-stack-dialog"

type StudyStack = {
  id: string
  title: string
  description?: string
  updatedAt?: string
  resourceCount?: number
  emoji?: string
  isPublic?: boolean
  ownerId?: string
}

export default function StudyStackCard({
  set,
  className,
  onClick,
  onEdit,
  onDelete,
  onCopy,
  isOwner = false,
}: {
  set: StudyStack
  className?: string
  onClick?: () => void
  onEdit?: (id: string, data: { title: string; description: string; emoji?: string; isPublic?: boolean }) => void
  onDelete?: (id: string) => void
  onCopy?: (id: string) => void
  isOwner?: boolean
}) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditDialogOpen(true)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDeleteDialogOpen(true)
  }

  const handleSaveEdit = (data: { title: string; description: string; emoji?: string; isPublic?: boolean }) => {
    onEdit?.(set.id, data)
  }

  const handleConfirmDelete = () => {
    onDelete?.(set.id)
    setIsDeleteDialogOpen(false)
  }

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    onCopy?.(set.id)
  }

  return (
    <>
      <Card className={`relative h-60 p-6 flex flex-col hover:shadow-lg transition-shadow cursor-pointer group ${className ?? ""}`}>
        {/* Menu Button */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          {isOwner ? (
            // Owner can edit/delete
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
                  onClick={handleMenuClick}
                >
                  <EllipsisVertical className="h-4 w-4 text-gray-500" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-32 p-1" align="end">
                <div className="flex flex-col">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="justify-start h-8 px-2 text-sm"
                    onClick={handleEdit}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="justify-start h-8 px-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handleDelete}
                  >
                    Delete
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            // Non-owner can copy
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
              onClick={handleCopy}
              title="Copy to My Stacks"
            >
              <Copy className="h-4 w-4 text-gray-500" />
            </Button>
          )}
        </div>

        {/* Card Content */}
        <div className="flex-1 flex flex-col" onClick={onClick}>
          
          {/* Emoji */}
          <div className="flex items-center mb-3">
            <span className="text-3xl">{set.emoji}</span>
          </div>

          {/* Title */}
          <div className="mb-3">
            <h3 className="font-semibold text-xl leading-tight line-clamp-2 text-gray-900">
              {set.title}
            </h3>
          </div>

          {/* Description */}
          <div className="flex-1">
            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
              {set.description}
            </p>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center pt-3 border-gray-100">
            <span className="text-xs text-gray-500">
              {set.updatedAt ? new Date(set.updatedAt).toLocaleDateString('en-GB', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              }) : ''}
            </span>
            <span className="text-xs text-gray-500 font-medium">
              {set.resourceCount ?? 0} resources {set.isPublic ? ' 🌐' : ' 🔒'}
            </span>
          </div>
        </div>
      </Card>

      {/* Edit Dialog */}
      <StudyStackDialog
        mode="edit"
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        initialData={{ 
          title: set.title, 
          description: set.description || "",
          emoji: set.emoji,
          isPublic: set.isPublic || false
        }}
        onSubmit={handleSaveEdit}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Study Set</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{set.title}&rdquo;? This action cannot be undone.
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
