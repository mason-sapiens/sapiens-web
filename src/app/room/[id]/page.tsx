'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import TypeformOnboarding from './components/TypeformOnboarding'
import AssignmentProblemDefinition from './components/AssignmentProblemDefinition'
import PhaseCard from './components/PhaseCard'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
  phase?: string
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

// Phase descriptions
const PHASE_INFO: Record<string, { title: string; description: string; icon: string }> = {
  onboarding: {
    title: 'Phase 1: Onboarding',
    description: 'Getting to know your career goals and background',
    icon: '👋',
  },
  project_generation: {
    title: 'Phase 2: Project Generation',
    description: 'Creating a tailored project proposal for your target role',
    icon: '💡',
  },
  problem_definition: {
    title: 'Phase 3: Problem Definition',
    description: 'Defining the problem your project will solve',
    icon: '🎯',
  },
  solution_design: {
    title: 'Phase 4: Solution Design',
    description: 'Designing your solution approach and architecture',
    icon: '🏗️',
  },
  execution: {
    title: 'Phase 5: Execution',
    description: 'Building and implementing your project',
    icon: '⚡',
  },
  review: {
    title: 'Phase 6: Review',
    description: 'Reviewing progress and preparing deliverables',
    icon: '✅',
  },
  completed: {
    title: 'Phase 7: Completed',
    description: 'Project completed and ready to showcase',
    icon: '🎉',
  },
}

const PHASE_ORDER = [
  'onboarding',
  'project_generation',
  'problem_definition',
  'solution_design',
  'execution',
  'review',
  'completed',
]

export default function ProjectRoomPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.id as string
  const { data: session, status } = useSession()

  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [userId, setUserId] = useState('')
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'loading') {
      return
    }

    if (session?.user?.id) {
      setUserId(session.user.id)
      loadRoom()
    }
  }, [roomId, session, status, router])

  const loadRoom = async () => {
    try {
      const response = await fetch(`/api/rooms/${roomId}`)
      if (response.ok) {
        const data = await response.json()
        setRoom(data.room)

        if (data.room.messages.length === 0 && session?.user?.id) {
          await triggerInitialGreeting(session.user.id)
        }
      }
    } catch (error) {
      console.error('Failed to load room:', error)
    } finally {
      setLoading(false)
    }
  }

  const triggerInitialGreeting = async (userId: string) => {
    try {
      const response = await fetch(`/api/rooms/${roomId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          message: 'START',
        }),
      })

      if (response.ok) {
        await loadRoom()
      }
    } catch (error) {
      console.error('Error triggering initial greeting:', error)
    }
  }

  const sendMessage = async (message: string) => {
    if (!message.trim() || sending || !room || !userId) return

    setSending(true)

    try {
      const response = await fetch(`/api/rooms/${roomId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          message: message,
        }),
      })

      if (response.ok) {
        await loadRoom()
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

  const createNewRoom = async () => {
    if (!userId) return

    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          projectData: {
            phase: 'onboarding',
          },
        }),
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/room/${data.room.id}`)
      }
    } catch (error) {
      console.error('Error creating new room:', error)
    }
  }

  // Group messages by phase
  const groupMessagesByPhase = (messages: Message[]) => {
    const phaseGroups: Record<string, Message[]> = {}

    messages.forEach((message) => {
      const messagePhase = message.phase || 'onboarding'
      if (!phaseGroups[messagePhase]) {
        phaseGroups[messagePhase] = []
      }
      phaseGroups[messagePhase].push(message)
    })

    return phaseGroups
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

  const currentPhaseIndex = PHASE_ORDER.indexOf(room.phase)
  const messagesByPhase = groupMessagesByPhase(room.messages)

  // Set selected phase to current phase on load
  useEffect(() => {
    if (room && !selectedPhase) {
      setSelectedPhase(room.phase)
    }
  }, [room, selectedPhase])

  // Determine which phase to display
  const displayPhase = selectedPhase || room.phase

  // Special rendering for onboarding phase when it's the current phase and viewing it
  if (displayPhase === 'onboarding' && room.phase === 'onboarding') {
    return (
      <TypeformOnboarding
        messages={messagesByPhase['onboarding'] || []}
        onSendMessage={sendMessage}
        isSending={sending}
      />
    )
  }

  // Special rendering for problem_definition phase when viewing it and it's current
  if (displayPhase === 'problem_definition' && room.phase === 'problem_definition' && messagesByPhase['problem_definition']?.length > 0) {
    const problemDefMessages = messagesByPhase['problem_definition']
    const hasUserResponse = problemDefMessages.some((m) => m.role === 'user')

    // Show assignment form if no user response yet
    if (!hasUserResponse) {
      return (
        <AssignmentProblemDefinition
          messages={problemDefMessages}
          onSendMessage={sendMessage}
          isSending={sending}
        />
      )
    }
  }

  // Card-based layout for all phases
  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-ivory to-teal/5">
      {/* Header */}
      <div className="bg-white border-b border-charcoal/10 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/profile"
                className="text-small text-teal hover:underline mb-2 inline-block"
              >
                ← Back to My Projects
              </Link>
              <h1 className="text-h2 font-serif text-charcoal">
                {room.targetRole ? `${room.targetRole} Project` : 'Your Project Journey'}
              </h1>
              {room.targetDomain && (
                <p className="text-small text-charcoal/60">{room.targetDomain}</p>
              )}
            </div>
            <Link
              href="/chat?new=true"
              className="px-4 py-2 border border-teal text-teal rounded-lg hover:bg-teal hover:text-ivory transition-colors font-serif text-small"
            >
              + New Chat
            </Link>
          </div>
        </div>
      </div>

      {/* Phase Navigation */}
      <div className="bg-white border-b border-charcoal/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-2 overflow-x-auto">
            {PHASE_ORDER.map((phaseName, index) => {
              const phaseMessages = messagesByPhase[phaseName] || []
              const isCurrentPhase = room.phase === phaseName
              const isCompleted = index < currentPhaseIndex
              const hasContent = phaseMessages.length > 0 || isCurrentPhase
              const isSelected = displayPhase === phaseName
              const phaseInfo = PHASE_INFO[phaseName] || {
                title: phaseName,
                description: '',
                icon: '📋',
              }

              // Skip phases that haven't started yet
              if (!hasContent) {
                return null
              }

              return (
                <button
                  key={phaseName}
                  onClick={() => setSelectedPhase(phaseName)}
                  className={`flex items-center gap-2 px-4 py-4 border-b-2 transition-all whitespace-nowrap ${
                    isSelected
                      ? 'border-teal text-teal bg-teal/5'
                      : 'border-transparent text-charcoal/60 hover:text-charcoal hover:bg-charcoal/5'
                  }`}
                >
                  <span className="text-xl">{phaseInfo.icon}</span>
                  <span className="font-serif text-small">{phaseInfo.title}</span>
                  {isCurrentPhase && (
                    <span className="ml-2 px-2 py-0.5 bg-teal/20 text-teal rounded-full text-xs">
                      Active
                    </span>
                  )}
                  {isCompleted && (
                    <span className="ml-2 text-green-600">✓</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Selected Phase Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {(() => {
          const phaseMessages = messagesByPhase[displayPhase] || []
          const isCurrentPhase = room.phase === displayPhase
          const phaseIndex = PHASE_ORDER.indexOf(displayPhase)
          const isCompleted = phaseIndex < currentPhaseIndex
          const phaseInfo = PHASE_INFO[displayPhase] || {
            title: displayPhase,
            description: '',
            icon: '📋',
          }

          return (
            <PhaseCard
              key={displayPhase}
              phase={displayPhase}
              phaseInfo={phaseInfo}
              messages={phaseMessages}
              isCurrentPhase={isCurrentPhase}
              isCompleted={isCompleted}
              onSendMessage={isCurrentPhase ? sendMessage : undefined}
              isSending={sending}
            />
          )
        })()}

        {/* Quick Stats */}
        {room.milestones.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-md p-6">
            <h3 className="text-h3 font-serif text-charcoal mb-4">Project Progress</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-teal/5 rounded-lg">
                <div className="text-h2 font-serif text-teal">
                  {room.milestones.filter((m) => m.status === 'completed').length}
                </div>
                <div className="text-small text-charcoal/60">Milestones Completed</div>
              </div>
              <div className="text-center p-4 bg-charcoal/5 rounded-lg">
                <div className="text-h2 font-serif text-charcoal">{room.milestones.length}</div>
                <div className="text-small text-charcoal/60">Total Milestones</div>
              </div>
              <div className="text-center p-4 bg-teal/5 rounded-lg">
                <div className="text-h2 font-serif text-teal">{room.artifacts.length}</div>
                <div className="text-small text-charcoal/60">Documents Created</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
