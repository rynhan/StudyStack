"use client"

import React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, SortAsc, SortDesc } from "lucide-react"

interface SearchBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  sortBy: 'created' | 'updated'
  onSortByChange: (sortBy: 'created' | 'updated') => void
  sortOrder: 'asc' | 'desc'
  onSortOrderChange: (order: 'asc' | 'desc') => void
  showStatusFilter?: boolean
  statusFilter?: 'all' | 'reference' | 'todo' | 'inprogress' | 'done'
  onStatusFilterChange?: (status: 'all' | 'reference' | 'todo' | 'inprogress' | 'done') => void
  placeholder?: string
  className?: string
}

export default function SearchBar({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  showStatusFilter = false,
  statusFilter = 'all',
  onStatusFilterChange,
  placeholder = "Search resources by title, description, or notes...",
  className = ""
}: SearchBarProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Filter Controls */}
        <div className="flex gap-2">
          {/* Status Filter */}
          {showStatusFilter && (
            <Select 
              value={statusFilter} 
              onValueChange={onStatusFilterChange as (value: string) => void}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="reference">Reference</SelectItem>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="inprogress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
          )}
          
          {/* Sort By */}
          <Select value={sortBy} onValueChange={onSortByChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created">Created</SelectItem>
              <SelectItem value="updated">Modified</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Sort Order */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3"
          >
            {sortOrder === 'asc' ? (
              <SortAsc className="h-4 w-4" />
            ) : (
              <SortDesc className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
