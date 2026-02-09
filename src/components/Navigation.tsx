'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const pathname = usePathname()

  // Don't show navigation on landing page
  if (pathname === '/') {
    return null
  }

  return (
    <nav className="bg-teal text-ivory border-b border-teal-dark">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-h3 font-serif hover:opacity-80 transition-opacity">
              Sapiens
            </Link>
            <div className="flex gap-4">
              <Link
                href="/chat"
                className={`px-4 py-2 rounded transition-colors text-body ${
                  pathname === '/chat'
                    ? 'bg-ivory text-teal'
                    : 'text-ivory hover:bg-teal-dark'
                }`}
              >
                New Chat
              </Link>
              <Link
                href="/profile"
                className={`px-4 py-2 rounded transition-colors text-body ${
                  pathname === '/profile'
                    ? 'bg-ivory text-teal'
                    : 'text-ivory hover:bg-teal-dark'
                }`}
              >
                My Projects
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
