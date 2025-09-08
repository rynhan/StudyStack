import { NextRequest, NextResponse } from 'next/server'
import { studyStackApi } from '@/lib/mock-db'

// POST /api/study-stacks/[id]/copy - Copy a study stack
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { ownerId } = body

    if (!ownerId) {
      return NextResponse.json(
        { success: false, error: 'ownerId is required' },
        { status: 400 }
      )
    }

    const copiedStudyStack = studyStackApi.copy(id, ownerId)

    if (!copiedStudyStack) {
      return NextResponse.json(
        { success: false, error: 'Study stack not found or cannot be copied' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: copiedStudyStack,
      message: 'Study stack copied successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error copying study stack:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to copy study stack' },
      { status: 500 }
    )
  }
}
