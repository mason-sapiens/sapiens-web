import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// POST /api/rooms/[id]/save-message - Save a message to room (without AI call)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { role, content, phase } = await request.json()

    if (!role || !content) {
      return NextResponse.json(
        { error: 'Missing role or content' },
        { status: 400 }
      )
    }

    // Verify room exists
    const room = await prisma.projectRoom.findUnique({
      where: { id },
    })

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }

    // Save message
    const message = await prisma.message.create({
      data: {
        projectRoomId: id,
        role,
        content,
        phase: phase || room.phase,
      },
    })

    return NextResponse.json({ message })
  } catch (error: any) {
    console.error('Error saving message to room:', error)
    return NextResponse.json(
      { error: 'Failed to save message', details: error.message },
      { status: 500 }
    )
  }
}
