"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  EmojiPicker,
  EmojiPickerSearch,
  EmojiPickerContent,
  EmojiPickerFooter,
} from "@/components/ui/emoji-picker"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface ReusableEmojiPickerProps {
  emoji: string
  onEmojiSelect: (emoji: string) => void
  triggerClassName?: string
  popoverClassName?: string
  children?: React.ReactNode
}

export default function ReusableEmojiPicker({ 
  emoji, 
  onEmojiSelect, 
  triggerClassName,
  popoverClassName,
  children 
}: ReusableEmojiPickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  
  // Handler to stop event propagation for scroll events
  const stopPropagation = (e: React.WheelEvent | React.TouchEvent) => e.stopPropagation()

  return (
    <Popover onOpenChange={setIsOpen} open={isOpen}>
      <PopoverTrigger asChild>
        {children || (
          <Button
            type="button"
            variant="outline"
            className={triggerClassName}
          >
            <span className="mr-2 text-lg">{emoji}</span>
            <span className="text-muted-foreground">Choose emoji</span>
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent 
        className={`w-fit p-0 ${popoverClassName || ''}`}
        align="start" 
        sideOffset={4}
        onWheel={stopPropagation}
        onTouchMove={stopPropagation}
      >
        <EmojiPicker
          className="h-[320px]"
          onEmojiSelect={({ emoji: selectedEmoji }) => {
            setIsOpen(false)
            onEmojiSelect(selectedEmoji)
          }}
        >
          <EmojiPickerSearch placeholder="Search emojis..." />
          <EmojiPickerContent />
          <EmojiPickerFooter />
        </EmojiPicker>
      </PopoverContent>
    </Popover>
  )
}
