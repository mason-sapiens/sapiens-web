'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function ChatPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState('')
  const [initialized, setInitialized] = useState(false)
  const [currentState, setCurrentState] = useState<string>('onboarding')
  const [roomCreated, setRoomCreated] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Get or create persistent user ID
    let id = localStorage.getItem('userId')
    if (!id) {
      id = 'user_' + Math.random().toString(36).substring(2, 15)
      localStorage.setItem('userId', id)
    }
    setUserId(id)

    // Check if user was already initialized in this session
    const initKey = `user_initialized_${id}`
    const alreadyInitialized = sessionStorage.getItem(initKey)

    if (!alreadyInitialized) {
      initializeUser(id)
    } else {
      console.log('User already initialized in this session')
      setInitialized(true)
    }
  }, [])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const initializeUser = async (id: string) => {
    try {
      console.log('Initializing user:', id)
      const response = await fetch('/api/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id }),
      })

      if (response.ok) {
        console.log('User initialized successfully')
        // Mark user as initialized for this session
        const initKey = `user_initialized_${id}`
        sessionStorage.setItem(initKey, 'true')
        setInitialized(true)
      } else {
        const error = await response.json()
        console.error('Failed to initialize user:', error)
        alert('Failed to connect to AI system. Please refresh and try again.')
      }
    } catch (error) {
      console.error('Failed to initialize user:', error)
      alert('Failed to connect to AI system. Please refresh and try again.')
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || loading || !initialized) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      console.log('Sending message:', { userId, message: input })

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          message: input,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Chat API error:', errorData)
        throw new Error(errorData.error || 'Failed to send message')
      }

      const data = await response.json()
      console.log('Received response:', data)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, assistantMessage])

      // Track state changes
      const newState = data.state || 'onboarding'
      console.log('State transition:', currentState, '->', newState)

      // If we've moved past onboarding and haven't created a room yet, create one
      if (currentState === 'onboarding' && newState !== 'onboarding' && !roomCreated) {
        console.log('Creating project room...')
        await createProjectRoom(newState)
      }

      setCurrentState(newState)
    } catch (error: any) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}. Please try again or refresh the page.`,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const createProjectRoom = async (phase: string) => {
    try {
      // Extract project details from messages
      const targetRole = extractTargetRole(messages)
      const targetDomain = extractTargetDomain(messages)

      console.log('Creating room with data:', { userId, phase, targetRole, targetDomain })

      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          projectData: {
            phase,
            targetRole,
            targetDomain,
          },
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const roomId = data.room.id
        console.log('Room created:', roomId)

        // Save onboarding messages to the room
        await saveMessagesToRoom(roomId, messages)

        setRoomCreated(true)

        // Navigate to the new room after a brief moment
        setTimeout(() => {
          router.push(`/room/${roomId}`)
        }, 1500)
      }
    } catch (error) {
      console.error('Failed to create project room:', error)
    }
  }

  const saveMessagesToRoom = async (roomId: string, msgs: Message[]) => {
    try {
      // Save each message to the database via the room's message endpoint
      for (const msg of msgs) {
        await fetch(`/api/rooms/${roomId}/save-message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role: msg.role,
            content: msg.content,
            phase: 'onboarding',
          }),
        })
      }
      console.log('Saved', msgs.length, 'messages to room', roomId)
    } catch (error) {
      console.error('Failed to save messages to room:', error)
    }
  }

  const extractTargetRole = (msgs: Message[]): string | null => {
    // Look for role in user messages (simple extraction)
    const userMessages = msgs.filter(m => m.role === 'user')
    if (userMessages.length > 0) {
      return userMessages[0].content
    }
    return null
  }

  const extractTargetDomain = (msgs: Message[]): string | null => {
    // Could be extracted from conversation context
    // For now, return null and let it be filled later
    return null
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      {/* Header */}
      <header className="bg-teal text-ivory p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-h2 font-serif">Sapiens</h1>
            <p className="text-small opacity-90 mt-1">
              Your AI Career Coach
            </p>
          </div>
          <Link
            href="/profile"
            className="px-4 py-2 bg-ivory text-teal rounded hover:bg-ivory-dark transition-colors text-small"
          >
            My Projects
          </Link>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {!initialized && (
            <div className="text-center text-charcoal/60">
              Connecting to AI system...
            </div>
          )}

          {messages.length === 0 && initialized && (
            <div className="text-center space-y-4 py-12">
              <h2 className="text-h3 text-teal">Welcome to Sapiens!</h2>
              <p className="text-body text-charcoal/70">
                I'll guide you through building a portfolio project that impresses recruiters.
              </p>
              <p className="text-small text-charcoal/60">
                Try saying: <strong>"Product Manager"</strong> or <strong>"Data Scientist"</strong>
              </p>
            </div>
          )}

          {messages.map((message) => (
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

          {loading && (
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

          {roomCreated && (
            <div className="bg-teal/10 border border-teal rounded-lg p-6 text-center">
              <div className="text-h3 text-teal mb-2">✓ Project Room Created</div>
              <p className="text-body text-charcoal/70">
                Redirecting you to your project room...
              </p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-charcoal/10 bg-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={loading || !initialized}
              className="flex-1 px-6 py-4 border border-charcoal/20 rounded-lg focus:outline-none focus:border-teal bg-ivory text-charcoal placeholder:text-charcoal/40 font-serif text-body"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !initialized || !input.trim()}
              className="px-8 py-4 bg-teal text-ivory rounded-lg hover:bg-teal-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-serif text-body"
            >
              {loading ? 'Sending...' : 'Send'}
            </button>
          </div>

          {userId && (
            <p className="text-small text-charcoal/40 mt-2">
              User ID: {userId}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
