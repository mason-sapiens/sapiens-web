import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, message } = body

    console.log('Received chat request:', { userId, message })

    if (!userId || !message) {
      return NextResponse.json(
        { error: 'Missing userId or message' },
        { status: 400 }
      )
    }

    // Call AI backend directly from API route
    const AI_BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://3.101.121.64:8000'

    console.log('Calling AI backend:', AI_BACKEND_URL)

    const aiResponse = await fetch(`${AI_BACKEND_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        message: message,
      }),
    })

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text()
      console.error('AI backend error:', aiResponse.status, errorText)
      throw new Error(`AI backend returned ${aiResponse.status}: ${errorText}`)
    }

    const data = await aiResponse.json()
    console.log('AI response received:', data)

    return NextResponse.json({
      success: true,
      response: data.response,
      state: data.current_state,
    })
  } catch (error: any) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      {
        error: 'Failed to get AI response',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
