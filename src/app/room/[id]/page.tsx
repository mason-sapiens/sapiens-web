'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import TypeformOnboarding from './components/TypeformOnboarding'
import AssignmentProblemDefinition from './components/AssignmentProblemDefinition'

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

// Custom markdown components with styling
const createMarkdownComponents = (isUser: boolean) => ({
  // Headings
  h1: ({ children }: any) => (
    <h1 className={`text-2xl font-serif font-bold mb-4 mt-6 ${isUser ? 'text-ivory' : 'text-charcoal'}`}>
      {children}
    </h1>
  ),
  h2: ({ children }: any) => (
    <h2 className={`text-xl font-serif font-bold mb-3 mt-5 ${isUser ? 'text-ivory' : 'text-charcoal'}`}>
      {children}
    </h2>
  ),
  h3: ({ children }: any) => (
    <h3 className={`text-lg font-serif font-semibold mb-2 mt-4 ${isUser ? 'text-ivory' : 'text-charcoal'}`}>
      {children}
    </h3>
  ),

  // Emphasis
  strong: ({ children }: any) => (
    <strong className={`font-bold ${isUser ? 'text-ivory font-extrabold' : 'text-teal'}`}>
      {children}
    </strong>
  ),
  em: ({ children }: any) => (
    <em className={`italic ${isUser ? 'text-ivory' : 'text-charcoal'}`}>
      {children}
    </em>
  ),

  // Lists
  ul: ({ children }: any) => (
    <ul className={`list-disc list-inside space-y-2 my-3 ml-2 ${isUser ? 'text-ivory' : ''}`}>
      {children}
    </ul>
  ),
  ol: ({ children }: any) => (
    <ol className={`list-decimal list-inside space-y-2 my-3 ml-2 ${isUser ? 'text-ivory' : ''}`}>
      {children}
    </ol>
  ),
  li: ({ children }: any) => (
    <li className={`text-body leading-relaxed ${isUser ? 'text-ivory' : ''}`}>
      {children}
    </li>
  ),

  // Paragraphs
  p: ({ children }: any) => (
    <p className={`text-body leading-relaxed mb-3 last:mb-0 ${isUser ? 'text-ivory' : ''}`}>
      {children}
    </p>
  ),

  // Code
  code: ({ inline, children }: any) =>
    inline ? (
      <code className={`px-2 py-1 rounded text-sm font-mono ${
        isUser ? 'bg-ivory/20 text-ivory' : 'bg-charcoal/10 text-teal'
      }`}>
        {children}
      </code>
    ) : (
      <code className={`block p-4 rounded-lg text-sm font-mono overflow-x-auto my-3 ${
        isUser ? 'bg-ivory/20 text-ivory' : 'bg-charcoal/5'
      }`}>
        {children}
      </code>
    ),

  // Blockquote for important content
  blockquote: ({ children }: any) => (
    <blockquote className={`border-l-4 pl-4 py-3 my-4 rounded-r-lg ${
      isUser
        ? 'border-ivory/50 bg-ivory/10 text-ivory'
        : 'border-teal bg-teal/5 text-charcoal'
    }`}>
      <div className="text-body">{children}</div>
    </blockquote>
  ),

  // Links
  a: ({ href, children }: any) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`underline transition-colors ${
        isUser
          ? 'text-ivory hover:text-ivory/80'
          : 'text-teal hover:text-teal-dark'
      }`}
    >
      {children}
    </a>
  ),

  // Horizontal rule
  hr: () => (
    <hr className={`border-t my-6 ${isUser ? 'border-ivory/30' : 'border-charcoal/20'}`} />
  ),
})

// Component to render message content with markdown
function MessageContent({ content, role }: { content: string; role: 'user' | 'assistant' }) {
  const isUser = role === 'user'
  const isAssistant = role === 'assistant'

  // Check if message contains a project proposal or important action items
  const hasProjectProposal = content.includes('PROJECT PROPOSAL') || content.includes('# PROJECT')
  const hasKeyActions = content.includes('Next Steps:') || content.includes('Action Items:') || content.includes('TODO:')

  return (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={createMarkdownComponents(isUser)}
      >
        {content}
      </ReactMarkdown>

      {/* Add visual indicator for important messages */}
      {isAssistant && (hasProjectProposal || hasKeyActions) && (
        <div className="mt-4 pt-4 border-t border-teal/20">
          <div className="flex items-center gap-2 text-small">
            <span className="text-xl">💡</span>
            <span className="font-bold text-teal">
              {hasProjectProposal ? 'Project Proposal Generated - Review carefully!' : 'Action Required - Check the steps above'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// Phase descriptions for visual separation
const PHASE_INFO = {
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
  const [activeTab, setActiveTab] = useState<'chat' | 'archive' | 'timeline'>('chat')
  const [loading, setLoading] = useState(true)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [userId, setUserId] = useState('')
  const [viewingPhase, setViewingPhase] = useState<string | null>(null)

  useEffect(() => {
    // Redirect to sign in if not authenticated
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'loading') {
      return
    }

    // Use authenticated user's ID
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

        // Set viewing phase to current phase if not set
        if (!viewingPhase) {
          setViewingPhase(data.room.phase)
        }

        // If room is empty (no messages), trigger initial greeting from AI
        if (data.room.messages.length === 0 && session?.user?.id) {
          console.log('Room is empty, triggering initial AI greeting...')
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
      // Send an empty message to trigger the AI's greeting
      const response = await fetch(`/api/rooms/${roomId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          message: 'START', // Special trigger message for initial greeting
        }),
      })

      if (response.ok) {
        await loadRoom() // Reload to get the AI's greeting
      }
    } catch (error) {
      console.error('Error triggering initial greeting:', error)
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
    const groups: { phase: string; messages: Message[] }[] = []
    let currentPhase = messages[0]?.phase || room?.phase || 'onboarding'
    let currentGroup: Message[] = []

    messages.forEach((message) => {
      const messagePhase = message.phase || room?.phase || 'onboarding'

      if (messagePhase !== currentPhase && currentGroup.length > 0) {
        groups.push({ phase: currentPhase, messages: currentGroup })
        currentGroup = []
        currentPhase = messagePhase
      }

      currentGroup.push(message)
    })

    if (currentGroup.length > 0) {
      groups.push({ phase: currentPhase, messages: currentGroup })
    }

    return groups
  }

  // Render phase header
  const renderPhaseHeader = (phase: string) => {
    const info = PHASE_INFO[phase as keyof typeof PHASE_INFO] || {
      title: phase,
      description: '',
      icon: '📋',
    }

    return (
      <div className="my-8 relative">
        <div className="absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-transparent via-charcoal/20 to-transparent" />
        <div className="relative flex justify-center">
          <div className="bg-ivory px-6 py-4">
            <div className="bg-white border-2 border-teal/30 rounded-xl px-8 py-4 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{info.icon}</span>
                <div>
                  <h3 className="text-h3 font-serif text-teal">{info.title}</h3>
                  <p className="text-small text-charcoal/70 mt-1">{info.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
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

  // Determine which phase we're currently viewing
  const currentViewingPhase = viewingPhase || room.phase
  const isViewingCurrentPhase = currentViewingPhase === room.phase

  // Typeform-style onboarding UI (only when viewing current onboarding phase)
  if (isViewingCurrentPhase && room.phase === 'onboarding') {
    const onboardingMessages = room.messages.filter((m) => m.phase === 'onboarding' || !m.phase)
    return (
      <TypeformOnboarding
        messages={onboardingMessages}
        onSendMessage={async (message: string) => {
          if (!message.trim() || sending || !userId) return
          setSending(true)
          setInput('')
          try {
            const response = await fetch(`/api/rooms/${roomId}/messages`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: userId, message: message }),
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
        }}
        isSending={sending}
      />
    )
  }

  // Assignment-style problem definition UI (only when viewing current problem_definition phase)
  if (isViewingCurrentPhase && room.phase === 'problem_definition') {
    const problemDefMessages = room.messages.filter((m) => m.phase === 'problem_definition')
    const hasUserResponse = problemDefMessages.some((m) => m.role === 'user')

    // Show assignment form if no user response yet
    if (!hasUserResponse && problemDefMessages.length > 0) {
      return (
        <AssignmentProblemDefinition
          messages={problemDefMessages}
          onSendMessage={async (message: string) => {
            if (!message.trim() || sending || !userId) return
            setSending(true)
            try {
              const response = await fetch(`/api/rooms/${roomId}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: userId, message: message }),
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
          }}
          isSending={sending}
        />
      )
    }
  }

  // Full Project Room UI (after onboarding)
  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      {/* Project Info Header */}
      <div className="bg-white border-b border-charcoal/10 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-h3 font-serif text-charcoal">
              {room.targetRole ? `${room.targetRole} Project` : 'Project Room'}
            </h1>
            {room.targetDomain && (
              <p className="text-small text-charcoal/60">{room.targetDomain}</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-small text-charcoal/60">
              Phase: <span className="font-semibold text-teal">{room.phase}</span>
            </div>
            <button
              onClick={createNewRoom}
              className="px-4 py-2 border border-teal text-teal rounded-lg hover:bg-teal hover:text-ivory transition-colors font-serif text-small"
            >
              + New Chat
            </button>
          </div>
        </div>
      </div>

      {/* Phase Navigation */}
      {activeTab === 'chat' && (
        <div className="bg-white border-b border-charcoal/10">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex gap-2 overflow-x-auto py-2">
              {PHASE_ORDER.map((phaseName, index) => {
                const phaseMessages = room.messages.filter((m) => m.phase === phaseName || (!m.phase && phaseName === 'onboarding'))
                const currentPhaseIndex = PHASE_ORDER.indexOf(room.phase)
                const isCurrentPhase = room.phase === phaseName
                const isCompleted = index < currentPhaseIndex
                const hasContent = phaseMessages.length > 0 || isCurrentPhase
                const isSelected = currentViewingPhase === phaseName
                const phaseInfo = PHASE_INFO[phaseName as keyof typeof PHASE_INFO] || { title: phaseName, icon: '📋' }

                // Skip phases that haven't started yet
                if (!hasContent) return null

                return (
                  <button
                    key={phaseName}
                    onClick={() => setViewingPhase(phaseName)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap text-small ${
                      isSelected
                        ? 'bg-teal text-ivory'
                        : 'bg-charcoal/5 text-charcoal/70 hover:bg-charcoal/10'
                    }`}
                  >
                    <span>{phaseInfo.icon}</span>
                    <span className="font-serif">Phase {index + 1}</span>
                    {isCurrentPhase && (
                      <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded text-xs">
                        Current
                      </span>
                    )}
                    {isCompleted && <span className="text-green-400">✓</span>}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

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
                {/* Phase header */}
                {(() => {
                  const phaseInfo = PHASE_INFO[currentViewingPhase as keyof typeof PHASE_INFO] || { title: currentViewingPhase, description: '', icon: '📋' }
                  return (
                    <div className="bg-white border-2 border-teal/30 rounded-xl p-6 shadow-sm mb-6">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{phaseInfo.icon}</span>
                        <div>
                          <h3 className="text-h3 font-serif text-teal">{phaseInfo.title}</h3>
                          <p className="text-small text-charcoal/70 mt-1">{phaseInfo.description}</p>
                        </div>
                      </div>
                    </div>
                  )
                })()}

                {/* Messages for selected phase */}
                {room.messages
                  .filter((m) => m.phase === currentViewingPhase || (!m.phase && currentViewingPhase === 'onboarding'))
                  .map((message) => (
                    <div
                      key={message.id}
                      className={`flex mb-6 ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-6 py-4 ${
                          message.role === 'user'
                            ? 'bg-teal text-ivory'
                            : 'bg-white border border-charcoal/10 text-charcoal shadow-sm'
                        }`}
                      >
                        <MessageContent content={message.content} role={message.role} />
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
