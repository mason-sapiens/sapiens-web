'use client'

import { useState } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import PhaseNavigation from './PhaseNavigation'

interface AssignmentProblemDefinitionProps {
  messages: any[]
  onSendMessage: (message: string) => void
  isSending: boolean
  currentPhase: string
  viewingPhase: string
  allMessages: any[]
  onPhaseChange: (phase: string) => void
}

export default function AssignmentProblemDefinition({
  messages,
  onSendMessage,
  isSending,
  currentPhase,
  viewingPhase,
  allMessages,
  onPhaseChange,
}: AssignmentProblemDefinitionProps) {
  const [formData, setFormData] = useState({
    problemStatement: '',
    targetAudience: '',
    keyPainPoints: '',
    successMetrics: '',
  })

  // Get instructions from AI (first message)
  const instructions = messages.filter((m) => m.role === 'assistant')[0]

  // Check if user has submitted
  const userMessages = messages.filter((m) => m.role === 'user')
  const aiMessages = messages.filter((m) => m.role === 'assistant')
  const hasSubmitted = userMessages.length > 0

  // Get latest submission and feedback
  const latestSubmission = userMessages[userMessages.length - 1]
  const latestFeedback = aiMessages[aiMessages.length - 1]

  // Parse previous submission to pre-fill form
  const parsePreviousSubmission = (content: string) => {
    const problemMatch = content.match(/\*\*Problem Statement:\*\*\s*([\s\S]*?)(?=\*\*Target Audience:|$)/i)
    const audienceMatch = content.match(/\*\*Target Audience:\*\*\s*([\s\S]*?)(?=\*\*Key Pain Points:|$)/i)
    const painPointsMatch = content.match(/\*\*Key Pain Points:\*\*\s*([\s\S]*?)(?=\*\*Success Metrics:|$)/i)
    const metricsMatch = content.match(/\*\*Success Metrics:\*\*\s*([\s\S]*?)$/i)

    return {
      problemStatement: problemMatch ? problemMatch[1].trim() : '',
      targetAudience: audienceMatch ? audienceMatch[1].trim() : '',
      keyPainPoints: painPointsMatch ? painPointsMatch[1].trim() : '',
      successMetrics: metricsMatch ? metricsMatch[1].trim() : '',
    }
  }

  // Parse evaluation scores from feedback
  const parseScores = (content: string) => {
    const scores: Record<string, number> = {}
    const lines = content.split('\n')

    for (const line of lines) {
      if (line.includes('Market Relevance:') || line.includes('market_relevance')) {
        const match = line.match(/(\d+(?:\.\d+)?)/);
        if (match) scores.marketRelevance = parseFloat(match[1])
      }
      if (line.includes('Clarity:') || line.includes('clarity')) {
        const match = line.match(/(\d+(?:\.\d+)?)/);
        if (match) scores.clarity = parseFloat(match[1])
      }
      if (line.includes('Feasibility:') || line.includes('feasibility')) {
        const match = line.match(/(\d+(?:\.\d+)?)/);
        if (match) scores.feasibility = parseFloat(match[1])
      }
    }

    return scores
  }

  // Pre-fill form with previous submission if exists
  React.useEffect(() => {
    if (hasSubmitted && latestSubmission && formData.problemStatement === '') {
      const parsed = parsePreviousSubmission(latestSubmission.content)
      setFormData(parsed)
    }
  }, [hasSubmitted, latestSubmission])

  const scores = latestFeedback ? parseScores(latestFeedback.content) : {}
  const evaluationPassed = hasSubmitted && latestFeedback?.content.includes('ready to move to solution design')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Format the submission as a structured response
    const submission = `
**Problem Statement:**
${formData.problemStatement}

**Target Audience:**
${formData.targetAudience}

**Key Pain Points:**
${formData.keyPainPoints}

**Success Metrics:**
${formData.successMetrics}
    `.trim()

    onSendMessage(submission)

    // Don't clear form - keep values so user can revise if needed
  }

  const isFormValid = Object.values(formData).every((value) => value.trim().length > 0)

  return (
    <div className="min-h-screen bg-ivory">
      {/* Header with New Chat button */}
      <div className="bg-white border-b border-charcoal/10 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
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

      <div className="p-6">
        <div className="max-w-4xl mx-auto">
        {/* Assignment Header */}
        <div className="bg-white rounded-t-xl border-b-4 border-teal p-8 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-h2 font-serif text-charcoal mb-2">
                📋 Problem Definition Assignment
              </h1>
              <p className="text-body text-charcoal/70">
                Phase 3: Define the problem your project will solve
              </p>
            </div>
            <div className="text-right">
              <div className="text-small text-charcoal/60">Due: N/A</div>
              <div className={`text-small font-semibold ${hasSubmitted ? 'text-green-600' : 'text-teal'}`}>
                {hasSubmitted ? '✓ Submitted' : 'Not Submitted'}
              </div>
            </div>
          </div>

          {/* Instructions from AI */}
          {instructions && !hasSubmitted && (
            <div className="mt-6 p-4 bg-teal/5 rounded-lg border border-teal/20">
              <div className="font-semibold text-charcoal mb-2 flex items-center gap-2">
                <span>📖</span>
                Instructions
              </div>
              <div className="prose prose-sm max-w-none text-charcoal/80">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {instructions.content}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        {/* AI Feedback - Show above form if submitted */}
        {hasSubmitted && latestFeedback && (
          <div className={`p-6 rounded-xl shadow-sm border-l-4 ${
            evaluationPassed ? 'bg-green-50 border-green-500' : 'bg-amber-50 border-amber-500'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{evaluationPassed ? '✅' : '📝'}</span>
              <h3 className="font-serif font-semibold text-charcoal">
                {evaluationPassed ? 'Excellent Work!' : 'Feedback for Improvement'}
              </h3>
            </div>

            {/* Overall Scores */}
            {Object.keys(scores).length > 0 && (
              <div className="mb-4 p-4 bg-white rounded-lg">
                <div className="text-small font-semibold text-charcoal mb-2">Evaluation Scores:</div>
                <div className="grid grid-cols-3 gap-4">
                  {scores.marketRelevance && (
                    <div className="text-center">
                      <div className={`text-h3 font-bold ${scores.marketRelevance >= 7 ? 'text-green-600' : scores.marketRelevance >= 6 ? 'text-amber-600' : 'text-red-600'}`}>
                        {scores.marketRelevance}/10
                      </div>
                      <div className="text-small text-charcoal/60">Market Relevance</div>
                    </div>
                  )}
                  {scores.clarity && (
                    <div className="text-center">
                      <div className={`text-h3 font-bold ${scores.clarity >= 7 ? 'text-green-600' : scores.clarity >= 6 ? 'text-amber-600' : 'text-red-600'}`}>
                        {scores.clarity}/10
                      </div>
                      <div className="text-small text-charcoal/60">Clarity</div>
                    </div>
                  )}
                  {scores.feasibility && (
                    <div className="text-center">
                      <div className={`text-h3 font-bold ${scores.feasibility >= 7 ? 'text-green-600' : scores.feasibility >= 6 ? 'text-amber-600' : 'text-red-600'}`}>
                        {scores.feasibility}/10
                      </div>
                      <div className="text-small text-charcoal/60">Feasibility</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* AI Feedback Content */}
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {latestFeedback.content}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {/* Assignment Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-b-xl shadow-sm p-8">
          <div className="space-y-8">
            {/* Question 1 */}
            <div>
              <label className="block mb-3">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-body font-semibold text-charcoal">1.</span>
                  <span className="text-body font-semibold text-charcoal">
                    Problem Statement
                  </span>
                  <span className="text-small text-red-500">*</span>
                  {hasSubmitted && scores.clarity && (
                    <span className={`ml-2 px-2 py-0.5 rounded text-xs font-semibold ${
                      scores.clarity >= 7 ? 'bg-green-100 text-green-700' :
                      scores.clarity >= 6 ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {scores.clarity >= 7 ? '✓ Clear' : scores.clarity >= 6 ? '~ Needs improvement' : '✗ Unclear'}
                    </span>
                  )}
                </div>
                <p className="text-small text-charcoal/60 ml-6 mb-3">
                  Clearly describe the problem you're addressing. What challenge or gap exists?
                </p>
                <textarea
                  value={formData.problemStatement}
                  onChange={(e) =>
                    setFormData({ ...formData, problemStatement: e.target.value })
                  }
                  rows={4}
                  placeholder="Example: Small businesses struggle to manage customer relationships efficiently without expensive CRM software..."
                  className="w-full px-4 py-3 border border-charcoal/20 rounded-lg focus:outline-none focus:border-teal bg-white text-charcoal placeholder:text-charcoal/40 font-serif text-body resize-none"
                  required
                />
              </label>
            </div>

            {/* Question 2 */}
            <div>
              <label className="block mb-3">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-body font-semibold text-charcoal">2.</span>
                  <span className="text-body font-semibold text-charcoal">
                    Target Audience
                  </span>
                  <span className="text-small text-red-500">*</span>
                  {hasSubmitted && scores.marketRelevance && (
                    <span className={`ml-2 px-2 py-0.5 rounded text-xs font-semibold ${
                      scores.marketRelevance >= 7 ? 'bg-green-100 text-green-700' :
                      scores.marketRelevance >= 6 ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {scores.marketRelevance >= 7 ? '✓ Relevant' : scores.marketRelevance >= 6 ? '~ Needs refinement' : '✗ Not specific'}
                    </span>
                  )}
                </div>
                <p className="text-small text-charcoal/60 ml-6 mb-3">
                  Who specifically faces this problem? Be as specific as possible.
                </p>
                <textarea
                  value={formData.targetAudience}
                  onChange={(e) =>
                    setFormData({ ...formData, targetAudience: e.target.value })
                  }
                  rows={3}
                  placeholder="Example: Small business owners (1-10 employees) in service industries, particularly..."
                  className="w-full px-4 py-3 border border-charcoal/20 rounded-lg focus:outline-none focus:border-teal bg-white text-charcoal placeholder:text-charcoal/40 font-serif text-body resize-none"
                  required
                />
              </label>
            </div>

            {/* Question 3 */}
            <div>
              <label className="block mb-3">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-body font-semibold text-charcoal">3.</span>
                  <span className="text-body font-semibold text-charcoal">
                    Key Pain Points
                  </span>
                  <span className="text-small text-red-500">*</span>
                  {hasSubmitted && scores.clarity && (
                    <span className={`ml-2 px-2 py-0.5 rounded text-xs font-semibold ${
                      scores.clarity >= 7 ? 'bg-green-100 text-green-700' :
                      scores.clarity >= 6 ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {scores.clarity >= 7 ? '✓ Well-defined' : scores.clarity >= 6 ? '~ Add more detail' : '✗ Too vague'}
                    </span>
                  )}
                </div>
                <p className="text-small text-charcoal/60 ml-6 mb-3">
                  List the main pain points or frustrations caused by this problem.
                </p>
                <textarea
                  value={formData.keyPainPoints}
                  onChange={(e) =>
                    setFormData({ ...formData, keyPainPoints: e.target.value })
                  }
                  rows={4}
                  placeholder="Example:&#10;- Lost customer information leads to poor follow-ups&#10;- Manual data entry is time-consuming&#10;- Lack of insights into customer behavior"
                  className="w-full px-4 py-3 border border-charcoal/20 rounded-lg focus:outline-none focus:border-teal bg-white text-charcoal placeholder:text-charcoal/40 font-serif text-body resize-none"
                  required
                />
              </label>
            </div>

            {/* Question 4 */}
            <div>
              <label className="block mb-3">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-body font-semibold text-charcoal">4.</span>
                  <span className="text-body font-semibold text-charcoal">
                    Success Metrics
                  </span>
                  <span className="text-small text-red-500">*</span>
                  {hasSubmitted && scores.feasibility && (
                    <span className={`ml-2 px-2 py-0.5 rounded text-xs font-semibold ${
                      scores.feasibility >= 7 ? 'bg-green-100 text-green-700' :
                      scores.feasibility >= 6 ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {scores.feasibility >= 7 ? '✓ Realistic' : scores.feasibility >= 6 ? '~ Needs adjustment' : '✗ Too ambitious'}
                    </span>
                  )}
                </div>
                <p className="text-small text-charcoal/60 ml-6 mb-3">
                  How will you measure if your solution successfully addresses this problem?
                </p>
                <textarea
                  value={formData.successMetrics}
                  onChange={(e) =>
                    setFormData({ ...formData, successMetrics: e.target.value })
                  }
                  rows={3}
                  placeholder="Example: 20+ active users, 80% user satisfaction, time saved per task..."
                  className="w-full px-4 py-3 border border-charcoal/20 rounded-lg focus:outline-none focus:border-teal bg-white text-charcoal placeholder:text-charcoal/40 font-serif text-body resize-none"
                  required
                />
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 pt-6 border-t border-charcoal/10 flex justify-between items-center">
            <div className="text-small text-charcoal/60">
              All fields marked with <span className="text-red-500">*</span> are required
            </div>
            <button
              type="submit"
              disabled={!isFormValid || isSending}
              className="px-8 py-4 bg-teal text-ivory rounded-lg hover:bg-teal-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all font-serif text-body font-semibold shadow-sm"
            >
              {isSending ? (
                <>
                  <span className="animate-spin inline-block mr-2">⏳</span>
                  {hasSubmitted ? 'Resubmitting...' : 'Submitting...'}
                </>
              ) : (
                hasSubmitted ? '🔄 Resubmit Assignment' : 'Submit Assignment'
              )}
            </button>
          </div>
        </form>

        {/* Previous Submission History (Collapsed by default) */}
        {hasSubmitted && userMessages.length > 1 && (
          <div className="mt-6">
            <details className="group">
              <summary className="cursor-pointer list-none">
                <div className="flex items-center gap-2 text-charcoal/60 hover:text-charcoal transition-colors">
                  <span className="text-small">📜 View Previous Submissions ({userMessages.length - 1})</span>
                  <span className="text-xs group-open:rotate-90 transition-transform">▶</span>
                </div>
              </summary>
              <div className="mt-4 space-y-3">
                {messages.slice(1, -2).reverse().map((message, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg text-small ${
                      message.role === 'user'
                        ? 'bg-white border-l-2 border-charcoal/20'
                        : 'bg-charcoal/5 border-l-2 border-charcoal/10'
                    }`}
                  >
                    <div className="font-semibold text-charcoal/60 mb-1 text-xs">
                      {message.role === 'user' ? 'Submission' : 'Feedback'} - Earlier
                    </div>
                    <div className="prose prose-sm max-w-none text-charcoal/70">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content.substring(0, 200)}
                        {message.content.length > 200 ? '...' : ''}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
