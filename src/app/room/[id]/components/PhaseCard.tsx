'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { createMarkdownComponents, MessageContent } from './MessageContent'

interface PhaseCardProps {
  phase: string
  phaseInfo: {
    title: string
    description: string
    icon: string
  }
  messages: any[]
  isCurrentPhase: boolean
  isCompleted: boolean
  onSendMessage?: (message: string) => void
  isSending?: boolean
}

export default function PhaseCard({
  phase,
  phaseInfo,
  messages,
  isCurrentPhase,
  isCompleted,
  onSendMessage,
  isSending,
}: PhaseCardProps) {
  const [input, setInput] = React.useState('')

  const handleSend = () => {
    if (!input.trim() || !onSendMessage || isSending) return
    onSendMessage(input)
    setInput('')
  }

  return (
    <div
      className={`bg-white rounded-xl shadow-md overflow-hidden transition-all ${
        isCurrentPhase ? 'ring-2 ring-teal' : ''
      } ${isCompleted ? 'opacity-75' : ''}`}
    >
      {/* Phase Header */}
      <div
        className={`p-6 border-b-2 ${
          isCurrentPhase
            ? 'bg-gradient-to-r from-teal/10 to-teal/5 border-teal'
            : isCompleted
            ? 'bg-charcoal/5 border-charcoal/10'
            : 'bg-ivory border-charcoal/10'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <span className="text-4xl">{phaseInfo.icon}</span>
            <div>
              <h2 className="text-h3 font-serif text-charcoal mb-1">
                {phaseInfo.title}
              </h2>
              <p className="text-small text-charcoal/70">{phaseInfo.description}</p>
            </div>
          </div>
          <div>
            {isCompleted && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-small font-semibold">
                ✓ Completed
              </span>
            )}
            {isCurrentPhase && !isCompleted && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-teal/20 text-teal rounded-full text-small font-semibold">
                ⚡ Active
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-charcoal/40">
            <p>No messages in this phase yet.</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-5 py-4 ${
                  message.role === 'user'
                    ? 'bg-teal text-ivory'
                    : 'bg-charcoal/5 text-charcoal'
                }`}
              >
                <MessageContent content={message.content} role={message.role} />
              </div>
            </div>
          ))
        )}

        {isSending && (
          <div className="flex justify-start">
            <div className="bg-charcoal/5 rounded-lg px-5 py-4">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-teal rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-teal rounded-full animate-bounce"
                  style={{ animationDelay: '0.1s' }}
                ></div>
                <div
                  className="w-2 h-2 bg-teal rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input (only for current phase) */}
      {isCurrentPhase && !isCompleted && onSendMessage && (
        <div className="border-t border-charcoal/10 p-6 bg-ivory/50">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder="Type your message..."
              disabled={isSending}
              className="flex-1 px-4 py-3 border border-charcoal/20 rounded-lg focus:outline-none focus:border-teal bg-white text-charcoal placeholder:text-charcoal/40 font-serif text-body"
            />
            <button
              onClick={handleSend}
              disabled={isSending || !input.trim()}
              className="px-6 py-3 bg-teal text-ivory rounded-lg hover:bg-teal-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-serif text-body"
            >
              {isSending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Add React import
import React from 'react'
