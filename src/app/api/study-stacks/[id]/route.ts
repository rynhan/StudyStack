import { NextRequest, NextResponse } from 'next/server'
import { studyStackApi } from '@/lib/mock-db'

// GET /api/study-stacks/[id] - Get a specific study stack
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const studyStack = studyStackApi.getById(id)

    if (!studyStack) {
      return NextResponse.json(
        { success: false, error: 'Study stack not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: studyStack
    })
  } catch (error) {
    console.error('Error fetching study stack:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch study stack' },
      { status: 500 }
    )
  }
}

// PUT /api/study-stacks/[id] - Update a study stack
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, description, emoji, isPublic } = body

    const updatedStudyStack = studyStackApi.update(id, {
      title,
      description,
      emoji,
      isPublic
    })

    if (!updatedStudyStack) {
      return NextResponse.json(
        { success: false, error: 'Study stack not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedStudyStack
    })
  } catch (error) {
    console.error('Error updating study stack:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update study stack' },
      { status: 500 }
    )
  }
}

// DELETE /api/study-stacks/[id] - Delete a study stack
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const deleted = studyStackApi.delete(id)

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Study stack not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Study stack deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting study stack:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete study stack' },
      { status: 500 }
    )
  }
}
