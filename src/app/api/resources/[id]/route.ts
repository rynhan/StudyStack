import { NextRequest, NextResponse } from 'next/server'
import { resourceApi } from '@/lib/mock-db'

// GET /api/resources/[id] - Get a specific resource
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const resource = resourceApi.getById(id)

    if (!resource) {
      return NextResponse.json(
        { success: false, error: 'Resource not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: resource
    })
  } catch (error) {
    console.error('Error fetching resource:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch resource' },
      { status: 500 }
    )
  }
}

// PUT /api/resources/[id] - Update a resource
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { 
      title, 
      description, 
      resourceType, 
      resourceUrl, 
      embedUrl, 
      filePath, 
      userNotes, 
      orderIndex 
    } = body

    const updatedResource = resourceApi.update(id, {
      title,
      description,
      resourceType,
      resourceUrl,
      embedUrl,
      filePath,
      userNotes,
      orderIndex
    })

    if (!updatedResource) {
      return NextResponse.json(
        { success: false, error: 'Resource not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedResource
    })
  } catch (error) {
    console.error('Error updating resource:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update resource' },
      { status: 500 }
    )
  }
}

// DELETE /api/resources/[id] - Delete a resource
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const deleted = resourceApi.delete(id)

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Resource not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Resource deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting resource:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
