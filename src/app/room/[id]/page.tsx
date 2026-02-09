'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

interface Milestone {
  id: string
  title: string
  description: string | null
  status: string
  order: number
}

interface Artifact {
  id: string
  title: string
  content: string
  type: string
  createdAt: string
}

interface Room {
  id: string
  phase: string
  targetRole: string | null
  targetDomain: string | null
  messages: Message[]
  milestones: Milestone[]
  artifacts: Artifact[]
}

export default function ProjectRoomPage() {
  const params = useParams()
  const roomId = params.id as string

  const [room, setRoom] = useState<Room | null>(null)
  const [activeTab, setActiveTab] = useState<'chat' | 'archive' | 'timeline'>('chat')
  const [loading, setLoading] = useState(true)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [userId, setUserId] = useState('')

  useEffect(() => {
    // Get persistent user ID
    const id = localStorage.getItem('userId') || 'user_' + Math.random().toString(36).substring(2, 15)
    if (!localStorage.getItem('userId')) {
      localStorage.setItem('userId', id)
    }
    setUserId(id)
    loadRoom()
  }, [roomId])

  const loadRoom = async () => {
    try {
      const response = await fetch(`/api/rooms/${roomId}`)
      if (response.ok) {
        const data = await response.json()
        setRoom(data.room)
      }
    } catch (error) {
      console.error('Failed to load room:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || sending || !room || !userId) return

    setSending(true)
    const userMessageContent = input
    setInput('')

    try {
      const response = await fetch(`/api/rooms/${roomId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId, // Use the persistent user ID
          message: userMessageContent,
        }),
      })

      if (response.ok) {
        await loadRoom() // Reload room to get new messages
      } else {
        alert('Failed to send message. Please try again.')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Error sending message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-teal text-h3">Loading project room...</div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-h3 text-charcoal">Room not found</div>
          <Link href="/chat" className="text-teal hover:underline">
            Start a new project
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      {/* Header */}
      <header className="bg-teal text-ivory p-4 border-b border-teal-dark">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-h3 font-serif">
              {room.targetRole ? `${room.targetRole} Project` : 'Project Room'}
            </h1>
            {room.targetDomain && (
              <p className="text-small opacity-90">{room.targetDomain}</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-small">
              Phase: <span className="font-semibold">{room.phase}</span>
            </div>
            <Link
              href="/profile"
              className="px-4 py-2 bg-ivory text-teal rounded hover:bg-ivory-dark transition-colors text-small"
            >
              All Projects
            </Link>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-charcoal/10 bg-white">
        <div className="max-w-6xl mx-auto flex gap-6 px-6">
          <button
            onClick={() => setActiveTab('chat')}
            className={`py-4 px-6 font-serif text-body transition-colors ${
              activeTab === 'chat'
                ? 'border-b-2 border-teal text-teal'
                : 'text-charcoal/60 hover:text-charcoal'
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => setActiveTab('archive')}
            className={`py-4 px-6 font-serif text-body transition-colors ${
              activeTab === 'archive'
                ? 'border-b-2 border-teal text-teal'
                : 'text-charcoal/60 hover:text-charcoal'
            }`}
          >
            Archive ({room.artifacts.length})
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-4 px-6 font-serif text-body transition-colors ${
              activeTab === 'timeline'
                ? 'border-b-2 border-teal text-teal'
                : 'text-charcoal/60 hover:text-charcoal'
            }`}
          >
            Timeline ({room.milestones.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'chat' && (
          <div className="h-full flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-4xl mx-auto space-y-6">
                {room.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-6 py-4 ${
                        message.role === 'user'
                          ? 'bg-teal text-ivory'
                          : 'bg-white border border-charcoal/10 text-charcoal'
                      }`}
                    >
                      <p className="text-body whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
                {sending && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-charcoal/10 rounded-lg px-6 py-4">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-teal rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-teal rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-teal rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Input */}
            <div className="border-t border-charcoal/10 bg-white p-6">
              <div className="max-w-4xl mx-auto flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Type your message..."
                  disabled={sending}
                  className="flex-1 px-6 py-4 border border-charcoal/20 rounded-lg focus:outline-none focus:border-teal bg-ivory text-charcoal placeholder:text-charcoal/40 font-serif text-body"
                />
                <button
                  onClick={sendMessage}
                  disabled={sending || !input.trim()}
                  className="px-8 py-4 bg-teal text-ivory rounded-lg hover:bg-teal-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-serif text-body"
                >
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'archive' && (
          <div className="h-full overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto space-y-4">
              <h2 className="text-h3 text-teal mb-6">Project Archive</h2>
              {room.artifacts.length === 0 ? (
                <p className="text-charcoal/60 text-center py-12">
                  No documents yet. They'll appear here as your project progresses.
                </p>
              ) : (
                room.artifacts.map((artifact) => (
                  <div
                    key={artifact.id}
                    className="bg-white border border-charcoal/10 rounded-lg p-6"
                  >
                    <h3 className="text-h3 text-charcoal mb-2">{artifact.title}</h3>
                    <p className="text-small text-charcoal/60 mb-4">
                      {artifact.type} • {new Date(artifact.createdAt).toLocaleDateString()}
                    </p>
                    <div className="text-body text-charcoal whitespace-pre-wrap">
                      {artifact.content}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="h-full overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto space-y-4">
              <h2 className="text-h3 text-teal mb-6">Project Timeline</h2>
              {room.milestones.length === 0 ? (
                <p className="text-charcoal/60 text-center py-12">
                  No milestones yet. They'll be created once your project plan is approved.
                </p>
              ) : (
                room.milestones.map((milestone, index) => (
                  <div
                    key={milestone.id}
                    className="bg-white border border-charcoal/10 rounded-lg p-6 relative"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-serif ${
                          milestone.status === 'completed'
                            ? 'bg-teal text-ivory'
                            : milestone.status === 'in_progress'
                            ? 'bg-teal/20 text-teal'
                            : 'bg-charcoal/10 text-charcoal/60'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-h3 text-charcoal mb-2">{milestone.title}</h3>
                        {milestone.description && (
                          <p className="text-body text-charcoal/70">{milestone.description}</p>
                        )}
                        <div className="mt-4 flex items-center gap-4">
                          <span
                            className={`text-small px-3 py-1 rounded ${
                              milestone.status === 'completed'
                                ? 'bg-teal/10 text-teal'
                                : milestone.status === 'in_progress'
                                ? 'bg-teal/20 text-teal'
                                : 'bg-charcoal/10 text-charcoal/60'
                            }`}
                          >
                            {milestone.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
