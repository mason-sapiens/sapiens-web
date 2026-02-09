import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Allow up to 60 seconds for AI response

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

    // Set longer timeout for AI backend (30 seconds)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    const aiResponse = await fetch(`${AI_BACKEND_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        message: message,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

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

    // Handle timeout errors
    if (error.name === 'AbortError') {
      return NextResponse.json(
        {
          error: 'AI response timeout',
          details: 'The AI is taking longer than expected. Please try again.',
        },
        { status: 504 }
      )
    }

    // Handle connection errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return NextResponse.json(
        {
          error: 'Cannot connect to AI backend',
          details: 'The AI backend is not accessible. Please check if it is running.',
        },
        { status: 503 }
      )
    }

    return NextResponse.json(
      {
        error: 'Failed to get AI response',
        details: error.message || 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}
