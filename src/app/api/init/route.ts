import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      )
    }

    const AI_BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://3.101.121.64:8000'

    console.log('Initializing user:', userId)

    const response = await fetch(`${AI_BACKEND_URL}/api/users?user_id=${userId}`, {
      method: 'POST',
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('User initialization error:', response.status, errorText)
      throw new Error(`Failed to initialize user: ${response.status}`)
    }

    const data = await response.json()
    console.log('User initialized:', data)

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Init API error:', error)
    return NextResponse.json(
      {
        error: 'Failed to initialize user',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
