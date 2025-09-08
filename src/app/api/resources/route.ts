import { NextRequest, NextResponse } from 'next/server'
import { resourceApi } from '@/lib/mock-db'

// GET /api/resources - Get resources by study stack ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studyStackId = searchParams.get('studyStackId')

    if (!studyStackId) {
      return NextResponse.json(
        { success: false, error: 'studyStackId is required' },
        { status: 400 }
      )
    }

    const resources = resourceApi.getByStudyStackId(studyStackId)

    return NextResponse.json({
      success: true,
      data: resources
    })
  } catch (error) {
    console.error('Error fetching resources:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch resources' },
      { status: 500 }
    )
  }
}

// POST /api/resources - Create a new resource
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      studyStackId, 
      title, 
      description, 
      resourceType, 
      resourceUrl, 
      embedUrl, 
      filePath, 
      userNotes, 
      orderIndex 
    } = body

    // Validation
    if (!studyStackId || !title || !resourceType || !resourceUrl) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'studyStackId, title, resourceType, and resourceUrl are required' 
        },
        { status: 400 }
      )
    }

    // Get the next order index if not provided
    let finalOrderIndex = orderIndex
    if (!finalOrderIndex) {
      const existingResources = resourceApi.getByStudyStackId(studyStackId)
      finalOrderIndex = existingResources.length + 1
    }

    const newResource = resourceApi.create({
      studyStackId,
      title,
      description: description || '',
      resourceType,
      resourceUrl,
      embedUrl,
      filePath,
      userNotes: userNotes || '',
      orderIndex: finalOrderIndex
    })

    return NextResponse.json({
      success: true,
      data: newResource
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating resource:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create resource' },
      { status: 500 }
    )
  }
}
