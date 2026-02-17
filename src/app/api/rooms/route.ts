import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET /api/rooms - List all rooms for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      )
    }

    const rooms = await prisma.projectRoom.findMany({
      where: { userId },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
        milestones: {
          where: { status: { not: 'completed' } },
          take: 3,
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            messages: true,
            milestones: true,
            artifacts: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json({ rooms })
  } catch (error: any) {
    console.error('Error fetching rooms:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rooms', details: error.message },
      { status: 500 }
    )
  }
}

// POST /api/rooms - Create new room
export async function POST(request: NextRequest) {
  try {
    const { userId, projectData } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      )
    }

    console.log('Creating new project room for user:', userId)

    const room = await prisma.projectRoom.create({
      data: {
        userId,
        status: 'active',
        phase: projectData?.phase || 'onboarding',
        targetRole: projectData?.targetRole,
        targetDomain: projectData?.targetDomain,
        background: projectData?.background,
        interests: projectData?.interests,
        projectId: projectData?.projectId,
      },
    })

    console.log('Project room created:', room.id)

    return NextResponse.json({ room })
  } catch (error: any) {
    console.error('Error creating room:', error)
    return NextResponse.json(
      { error: 'Failed to create room', details: error.message },
      { status: 500 }
    )
  }
}
