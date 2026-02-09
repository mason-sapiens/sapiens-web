'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface RoomPreview {
  id: string
  phase: string
  targetRole: string | null
  targetDomain: string | null
  updatedAt: string
  messages: Array<{ id: string; content: string; role: string }>
  milestones: Array<{ id: string; title: string; status: string }>
  _count: {
    messages: number
    milestones: number
    artifacts: number
  }
}

export default function ProfilePage() {
  const [rooms, setRooms] = useState<RoomPreview[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string>('')

  useEffect(() => {
    // Get or create user ID
    let id = localStorage.getItem('userId')
    if (!id) {
      id = 'user_' + Math.random().toString(36).substring(2, 15)
      localStorage.setItem('userId', id)
    }
    setUserId(id)
    loadRooms(id)
  }, [])

  const loadRooms = async (uid: string) => {
    try {
      const response = await fetch(`/api/rooms?userId=${uid}`)
      if (response.ok) {
        const data = await response.json()
        setRooms(data.rooms)
      }
    } catch (error) {
      console.error('Failed to load rooms:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-teal text-h3">Loading your projects...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ivory">
      {/* Content */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-h2 font-serif text-charcoal mb-2">Your Projects</h1>
          <p className="text-body text-charcoal/70">
            Manage and track all your career development projects
          </p>
        </div>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-h3 text-charcoal mb-2">Active Projects</h2>
            <p className="text-small text-charcoal/60">
              {rooms.length} {rooms.length === 1 ? 'project' : 'projects'} in progress
            </p>
          </div>
          <Link
            href="/chat"
            className="px-6 py-3 bg-teal text-ivory rounded-lg hover:bg-teal-dark transition-colors font-serif text-body"
          >
            Start New Project
          </Link>
        </div>

        {rooms.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-h3 text-charcoal mb-4">No projects yet</div>
            <p className="text-body text-charcoal/60 mb-8">
              Start your first career development project to get personalized guidance
            </p>
            <Link
              href="/chat"
              className="inline-block px-8 py-4 bg-teal text-ivory rounded-lg hover:bg-teal-dark transition-colors font-serif text-body"
            >
              Start Your First Project
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <Link
                key={room.id}
                href={`/room/${room.id}`}
                className="bg-white border border-charcoal/10 rounded-lg p-6 hover:border-teal/50 hover:shadow-lg transition-all"
              >
                <div className="mb-4">
                  <h3 className="text-h3 text-charcoal mb-2">
                    {room.targetRole || 'Career Project'}
                  </h3>
                  {room.targetDomain && (
                    <p className="text-small text-charcoal/60">{room.targetDomain}</p>
                  )}
                </div>

                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-teal/10 text-teal rounded text-small">
                    {room.phase}
                  </span>
                </div>

                {room.messages.length > 0 && (
                  <div className="mb-4 p-3 bg-ivory rounded text-small text-charcoal/70 line-clamp-2">
                    {room.messages[0].content}
                  </div>
                )}

                <div className="flex items-center gap-4 text-small text-charcoal/60 border-t border-charcoal/10 pt-4">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">{room._count.messages}</span>
                    <span>messages</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">{room._count.milestones}</span>
                    <span>milestones</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">{room._count.artifacts}</span>
                    <span>docs</span>
                  </div>
                </div>

                <div className="mt-4 text-small text-charcoal/40">
                  Updated {new Date(room.updatedAt).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
