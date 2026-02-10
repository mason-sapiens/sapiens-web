import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

// POST /api/rooms/[id]/messages - Send message in room
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { userId, message } = await request.json()

    if (!userId || !message) {
      return NextResponse.json(
        { error: 'Missing userId or message' },
        { status: 400 }
      )
    }

    console.log('Sending message in room:', id)

    // Get current room
    const room = await prisma.projectRoom.findUnique({
      where: { id },
    })

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }

    // Save user message
    const userMessage = await prisma.message.create({
      data: {
        projectRoomId: id,
        role: 'user',
        content: message,
        phase: room.phase,
      },
    })

    // Call AI backend
    const AI_BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://3.101.121.64:8000'

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    const aiResponse = await fetch(`${AI_BACKEND_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        message: message,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!aiResponse.ok) {
      throw new Error(`AI backend returned ${aiResponse.status}`)
    }

    const data = await aiResponse.json()

    // Save AI response
    const assistantMessage = await prisma.message.create({
      data: {
        projectRoomId: id,
        role: 'assistant',
        content: data.response,
        phase: data.current_state,
      },
    })

    // Update room phase and timestamp
    await prisma.projectRoom.update({
      where: { id: id },
      data: {
        phase: data.current_state,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      userMessage,
      assistantMessage,
      phase: data.current_state,
    })
  } catch (error: any) {
    console.error('Error sending message in room:', error)

    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'AI response timeout' },
        { status: 504 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to send message', details: error.message },
      { status: 500 }
    )
  }
}
