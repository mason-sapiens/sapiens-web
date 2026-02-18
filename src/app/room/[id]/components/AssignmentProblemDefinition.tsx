'use client'

import { useState } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface AssignmentProblemDefinitionProps {
  messages: any[]
  onSendMessage: (message: string) => void
  isSending: boolean
}

export default function AssignmentProblemDefinition({
  messages,
  onSendMessage,
  isSending,
}: AssignmentProblemDefinitionProps) {
  const [formData, setFormData] = useState({
    problemStatement: '',
    targetAudience: '',
    keyPainPoints: '',
    successMetrics: '',
  })

  // Get instructions from AI
  const instructions = messages.filter((m) => m.role === 'assistant')[0]

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
              <div className="text-small font-semibold text-teal">Not Submitted</div>
            </div>
          </div>

          {/* Instructions from AI */}
          {instructions && (
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
                  Submitting...
                </>
              ) : (
                'Submit Assignment'
              )}
            </button>
          </div>
        </form>

        {/* Previous submissions */}
        {messages.filter((m) => m.role === 'user').length > 0 && (
          <div className="mt-6 p-6 bg-white rounded-xl shadow-sm border-l-4 border-green-500">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">✅</span>
              <h3 className="font-serif font-semibold text-charcoal">
                Previous Submission
              </h3>
            </div>
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {messages.filter((m) => m.role === 'user')[0]?.content || ''}
              </ReactMarkdown>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
