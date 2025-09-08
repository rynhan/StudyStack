"use client"

import React, { useState } from "react"
import StudySetDialog from "./study-stack-dialog"

type CreateData = {
  title: string
  description: string
  emoji?: string
}

export default function DialogStack({ 
  children, 
  onCreate 
}: { 
  children: React.ReactNode, 
  onCreate?: (data: CreateData) => void 
}) {
  const [open, setOpen] = useState(false)

  const handleCreate = (data: CreateData) => {
    onCreate?.(data)
  }

  return (
    <StudySetDialog
      mode="create"
      open={open}
      onOpenChange={setOpen}
      onSubmit={handleCreate}
    >
      {children}
    </StudySetDialog>
  )
}
