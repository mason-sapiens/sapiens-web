import { NextRequest, NextResponse } from 'next/server'
import { aiService } from '@/lib/ai-client'

export async function POST(request: NextRequest) {
  try {
    const { userId, message } = await request.json()

    if (!userId || !message) {
      return NextResponse.json(
        { error: 'Missing userId or message' },
        { status: 400 }
      )
    }

    // Send message to AI backend
    const aiResponse = await aiService.sendMessage(userId, message)

    return NextResponse.json({
      success: true,
      response: aiResponse.response,
      state: aiResponse.current_state,
    })
  } catch (error: any) {
    console.error('AI backend error:', error)
    return NextResponse.json(
      {
        error: 'Failed to get AI response',
        details: error.message
      },
      { status: 500 }
    )
  }
}
