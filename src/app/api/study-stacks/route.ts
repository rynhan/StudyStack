import { NextRequest, NextResponse } from 'next/server'
import { studyStackApi } from '@/lib/mock-db'

// GET /api/study-stacks - Get all study stacks or filter by query params
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ownerId = searchParams.get('ownerId')
    const isPublic = searchParams.get('public')

    let studyStacks

    if (ownerId) {
      studyStacks = studyStackApi.getByOwner(ownerId)
    } else if (isPublic === 'true') {
      studyStacks = studyStackApi.getPublic()
    } else {
      studyStacks = studyStackApi.getAll()
    }

    return NextResponse.json({
      success: true,
      data: studyStacks
    })
  } catch (error) {
    console.error('Error fetching study stacks:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch study stacks' },
      { status: 500 }
    )
  }
}

// POST /api/study-stacks - Create a new study stack
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, emoji, isPublic = false, ownerId } = body

    // Validation
    if (!title || !ownerId) {
      return NextResponse.json(
        { success: false, error: 'Title and ownerId are required' },
        { status: 400 }
      )
    }

    const newStudyStack = studyStackApi.create({
      title,
      description: description || '',
      emoji: emoji || '📚',
      isPublic,
      ownerId
    })

    return NextResponse.json({
      success: true,
      data: newStudyStack
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating study stack:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create study stack' },
      { status: 500 }
    )
  }
}
