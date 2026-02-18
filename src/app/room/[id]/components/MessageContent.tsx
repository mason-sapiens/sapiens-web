import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// Custom markdown components with styling
export const createMarkdownComponents = (isUser: boolean) => ({
  // Headings
  h1: ({ children }: any) => (
    <h1
      className={`text-2xl font-serif font-bold mb-4 mt-6 ${
        isUser ? 'text-ivory' : 'text-charcoal'
      }`}
    >
      {children}
    </h1>
  ),
  h2: ({ children }: any) => (
    <h2
      className={`text-xl font-serif font-bold mb-3 mt-5 ${
        isUser ? 'text-ivory' : 'text-charcoal'
      }`}
    >
      {children}
    </h2>
  ),
  h3: ({ children }: any) => (
    <h3
      className={`text-lg font-serif font-semibold mb-2 mt-4 ${
        isUser ? 'text-ivory' : 'text-charcoal'
      }`}
    >
      {children}
    </h3>
  ),

  // Emphasis
  strong: ({ children }: any) => (
    <strong
      className={`font-bold ${isUser ? 'text-ivory font-extrabold' : 'text-teal'}`}
    >
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
    <ol
      className={`list-decimal list-inside space-y-2 my-3 ml-2 ${isUser ? 'text-ivory' : ''}`}
    >
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
      <code
        className={`px-2 py-1 rounded text-sm font-mono ${
          isUser ? 'bg-ivory/20 text-ivory' : 'bg-charcoal/10 text-teal'
        }`}
      >
        {children}
      </code>
    ) : (
      <code
        className={`block p-4 rounded-lg text-sm font-mono overflow-x-auto my-3 ${
          isUser ? 'bg-ivory/20 text-ivory' : 'bg-charcoal/5'
        }`}
      >
        {children}
      </code>
    ),

  // Blockquote for important content
  blockquote: ({ children }: any) => (
    <blockquote
      className={`border-l-4 pl-4 py-3 my-4 rounded-r-lg ${
        isUser ? 'border-ivory/50 bg-ivory/10 text-ivory' : 'border-teal bg-teal/5 text-charcoal'
      }`}
    >
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
        isUser ? 'text-ivory hover:text-ivory/80' : 'text-teal hover:text-teal-dark'
      }`}
    >
      {children}
    </a>
  ),

  // Horizontal rule
  hr: () => <hr className={`border-t my-6 ${isUser ? 'border-ivory/30' : 'border-charcoal/20'}`} />,
})

// Component to render message content with markdown
export function MessageContent({ content, role }: { content: string; role: 'user' | 'assistant' }) {
  const isUser = role === 'user'
  const isAssistant = role === 'assistant'

  // Check if message contains a project proposal or important action items
  const hasProjectProposal = content.includes('PROJECT PROPOSAL') || content.includes('# PROJECT')
  const hasKeyActions =
    content.includes('Next Steps:') ||
    content.includes('Action Items:') ||
    content.includes('TODO:')

  return (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={createMarkdownComponents(isUser)}>
        {content}
      </ReactMarkdown>

      {/* Add visual indicator for important messages */}
      {isAssistant && (hasProjectProposal || hasKeyActions) && (
        <div className="mt-4 pt-4 border-t border-teal/20">
          <div className="flex items-center gap-2 text-small">
            <span className="text-xl">💡</span>
            <span className="font-bold text-teal">
              {hasProjectProposal
                ? 'Project Proposal Generated - Review carefully!'
                : 'Action Required - Check the steps above'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
