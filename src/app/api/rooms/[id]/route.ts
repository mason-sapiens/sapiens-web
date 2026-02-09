import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET /api/rooms/[id] - Get room details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const room = await prisma.projectRoom.findUnique({
      where: { id: params.id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        milestones: {
          orderBy: { order: 'asc' },
        },
        artifacts: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ room })
  } catch (error: any) {
    console.error('Error fetching room:', error)
    return NextResponse.json(
      { error: 'Failed to fetch room', details: error.message },
      { status: 500 }
    )
  }
}

// PATCH /api/rooms/[id] - Update room
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json()

    const room = await prisma.projectRoom.update({
      where: { id: params.id },
      data: updates,
    })

    return NextResponse.json({ room })
  } catch (error: any) {
    console.error('Error updating room:', error)
    return NextResponse.json(
      { error: 'Failed to update room', details: error.message },
      { status: 500 }
    )
  }
}
