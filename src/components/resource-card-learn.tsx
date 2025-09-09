"use client"

import React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, FileText, Video, Image as ImageIcon, CheckCircle, Clock, Circle } from "lucide-react"

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


const getStatusColor = (status?: Resource['status']) => {
  switch (status) {
    case 'todo':
      return 'border-purple-200 bg-purple-50'
    case 'inprogress':
      return 'border-sky-200 bg-sky-50'
    case 'done':
      return 'border-lime-200 bg-lime-50'
    default:
      return 'border-gray-200 bg-gray-50'
  }
}

const getStatusText = (status?: Resource['status']) => {
  switch (status) {
    case 'todo':
      return 'To Do'
    case 'inprogress':
      return 'In Progress'
    case 'done':
      return 'Completed'
    default:
      return 'Not Started'
  }
}

const getStatusTextColor = (status?: Resource['status']) => {
  switch (status) {
    case 'todo':
      return 'text-purple-600 font-medium'
    case 'inprogress':
      return 'text-sky-600 font-semibold'
    case 'done':
      return 'text-lime-600 font-semibold'
    default:
      return 'text-gray-400 font-medium'
  }
}

interface ResourceCardLearnProps {
  resource: Resource
  isOwner?: boolean
  onClick?: (resource: Resource) => void
  onStatusChange?: (resourceId: string, newStatus: Resource['status']) => void
}

export default function ResourceCardLearn({
  resource,
  isOwner = false,
  onClick,
  onStatusChange,
}: ResourceCardLearnProps) {
  const handleCardClick = () => {
    onClick?.(resource)
  }

  const handleStatusChange = (newStatus: Resource['status']) => {
    onStatusChange?.(resource._id, newStatus)
  }

  // Don't show reference items in learn view
  if (resource.status === 'reference') {
    return null
  }

  return (
    <Card 
      className={`p-4 hover:shadow-md transition-all duration-200 cursor-pointer ${getStatusColor(resource.status)}`}
      onClick={handleCardClick}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-gray-900 leading-tight">
                {resource.title}
              </h3>
            </div>
            <div className={`text-xs ${getStatusTextColor(resource.status)}`}>
              {getStatusText(resource.status)}
            </div>
          </div>
          
          {resource.description && (
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              {resource.description}
            </p>
          )}
          
          {resource.userNotes && (
            <div className="bg-blue-50 border border-blue-100 rounded-md p-2 mb-2">
              <p className="text-xs text-blue-800">
                <span className="font-medium">Note:</span> {resource.userNotes}
              </p>
            </div>
          )}

          {/* Quick Status Actions for owners */}
          {isOwner && (
            <div className="flex gap-1 mt-3">
              <Button
                size="sm"
                variant={resource.status === 'todo' ? 'secondary' : 'outline'}
                className="h-6 px-2 text-xs border-1"
                onClick={(e) => {
                  e.stopPropagation()
                  handleStatusChange('todo')
                }}
              >
                To Do
              </Button>
              <Button
                size="sm"
                variant={resource.status === 'inprogress' ? 'secondary' : 'outline'}
                className="h-6 px-2 text-xs border-1"
                onClick={(e) => {
                  e.stopPropagation()
                  handleStatusChange('inprogress')
                }}
              >
                In Progress
              </Button>
              <Button
                size="sm"
                variant={resource.status === 'done' ? 'secondary' : 'outline'}
                className="h-6 px-2 text-xs border-1"
                onClick={(e) => {
                  e.stopPropagation()
                  handleStatusChange('done')
                }}
              >
                Done
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
