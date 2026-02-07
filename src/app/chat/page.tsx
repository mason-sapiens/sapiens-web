'use client'

import { useState, useEffect, useRef } from 'react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState('')
  const [initialized, setInitialized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Generate user ID on mount
    const id = 'user_' + Math.random().toString(36).substr(2, 9)
    setUserId(id)
    initializeUser(id)
  }, [])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const initializeUser = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users?user_id=${id}`, {
        method: 'POST',
      })
      if (response.ok) {
        setInitialized(true)
      }
    } catch (error) {
      console.error('Failed to initialize user:', error)
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
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          message: input,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
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
        <div className="max-w-4xl mx-auto">
          <h1 className="text-h2 font-serif">Sapiens</h1>
          <p className="text-small opacity-90 mt-1">
            Your AI Career Coach
          </p>
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
