'use client'

interface PhaseNavigationProps {
  currentPhase: string
  viewingPhase: string
  allMessages: any[]
  onPhaseChange: (phase: string) => void
}

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

export default function PhaseNavigation({
  currentPhase,
  viewingPhase,
  allMessages,
  onPhaseChange,
}: PhaseNavigationProps) {
  return (
    <div className="bg-white border-b border-charcoal/10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex gap-2 overflow-x-auto py-2">
          {PHASE_ORDER.map((phaseName, index) => {
            const phaseMessages = allMessages.filter(
              (m) => m.phase === phaseName || (!m.phase && phaseName === 'onboarding')
            )
            const currentPhaseIndex = PHASE_ORDER.indexOf(currentPhase)
            const isCurrentPhase = currentPhase === phaseName
            const isCompleted = index < currentPhaseIndex
            const hasContent = phaseMessages.length > 0 || isCurrentPhase
            const isSelected = viewingPhase === phaseName
            const phaseInfo = PHASE_INFO[phaseName as keyof typeof PHASE_INFO] || {
              title: phaseName,
              icon: '📋',
            }

            // Skip phases that haven't started yet
            if (!hasContent) return null

            return (
              <button
                key={phaseName}
                onClick={() => onPhaseChange(phaseName)}
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
  )
}
