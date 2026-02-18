'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import PhaseNavigation from './PhaseNavigation'

interface TypeformOnboardingProps {
  messages: any[]
  onSendMessage: (message: string) => void
  isSending: boolean
  currentPhase: string
  viewingPhase: string
  allMessages: any[]
  onPhaseChange: (phase: string) => void
}

export default function TypeformOnboarding({
  messages,
  onSendMessage,
  isSending,
  currentPhase,
  viewingPhase,
  allMessages,
  onPhaseChange,
}: TypeformOnboardingProps) {
  const [currentInput, setCurrentInput] = useState('')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  // Get the current question (last assistant message)
  const questions = messages.filter((m) => m.role === 'assistant')
  const answers = messages.filter((m) => m.role === 'user')
  const currentQuestion = questions[currentQuestionIndex]

  // Auto-scroll to show current question
  useEffect(() => {
    setCurrentQuestionIndex(questions.length - 1)
  }, [questions.length])

  const handleSubmit = () => {
    if (!currentInput.trim() || isSending) return
    onSendMessage(currentInput)
    setCurrentInput('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal/5 via-ivory to-teal/5">
      {/* Header with New Chat button */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-charcoal/10 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/profile" className="text-small text-teal hover:underline">
            ← Back to My Projects
          </Link>
          <Link
            href="/chat?new=true"
            className="px-4 py-2 border border-teal text-teal rounded-lg hover:bg-teal hover:text-ivory transition-colors font-serif text-small"
          >
            + New Chat
          </Link>
        </div>
      </div>

      {/* Phase Navigation */}
      <PhaseNavigation
        currentPhase={currentPhase}
        viewingPhase={viewingPhase}
        allMessages={allMessages}
        onPhaseChange={onPhaseChange}
      />

      <div className="flex items-center justify-center p-6 min-h-[calc(100vh-73px)]">
        <div className="max-w-3xl w-full">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-small text-charcoal/60">
              Question {Math.min(questions.length, answers.length + 1)} of ~5
            </span>
            <span className="text-small text-charcoal/60">
              {Math.min(Math.round((answers.length / 5) * 100), 100)}% complete
            </span>
          </div>
          <div className="h-2 bg-charcoal/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal transition-all duration-500 ease-out"
              style={{ width: `${Math.min((answers.length / 5) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 min-h-[300px] flex flex-col justify-between">
          {currentQuestion ? (
            <>
              {/* Question number badge */}
              <div className="mb-4">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-teal/10 text-teal font-serif font-semibold text-small">
                  {currentQuestionIndex + 1}
                </span>
              </div>

              {/* Question content */}
              <div className="flex-1 mb-6">
                <div className="prose prose-lg max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {currentQuestion.content}
                  </ReactMarkdown>
                </div>
              </div>

              {/* Answer input */}
              <div className="space-y-3">
                <textarea
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your answer here..."
                  disabled={isSending}
                  rows={3}
                  className="w-full px-6 py-4 border-2 border-charcoal/20 rounded-xl focus:outline-none focus:border-teal bg-ivory text-charcoal placeholder:text-charcoal/40 font-serif text-body resize-none transition-colors"
                  autoFocus
                />

                <div className="flex items-center justify-between">
                  <div className="text-small text-charcoal/40">
                    Press <kbd className="px-2 py-1 bg-charcoal/10 rounded">Enter</kbd> to submit
                  </div>
                  <button
                    onClick={handleSubmit}
                    disabled={isSending || !currentInput.trim()}
                    className="px-6 py-3 bg-teal text-ivory rounded-lg hover:bg-teal-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all font-serif text-body flex items-center gap-2"
                  >
                    {isSending ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        Sending...
                      </>
                    ) : (
                      <>
                        Submit
                        <span>→</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-4xl mb-4">👋</div>
                <h2 className="text-h2 font-serif text-charcoal mb-2">
                  Welcome to Sapiens
                </h2>
                <p className="text-body text-charcoal/70">
                  Loading your first question...
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Previous answers - collapsed view */}
        {answers.length > 0 && (
          <div className="space-y-3">
            <button
              className="text-small text-charcoal/60 hover:text-charcoal transition-colors flex items-center gap-2"
              onClick={() => {
                const element = document.getElementById('previous-answers')
                element?.classList.toggle('hidden')
              }}
            >
              <span>📝</span>
              View previous answers ({answers.length})
            </button>

            <div id="previous-answers" className="hidden space-y-2">
              {answers.map((answer, index) => (
                <div
                  key={answer.id}
                  className="bg-white/60 rounded-lg p-4 border border-charcoal/10"
                >
                  <div className="text-small text-charcoal/60 mb-1">
                    Question {index + 1}
                  </div>
                  <div className="text-body text-charcoal">{answer.content}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
