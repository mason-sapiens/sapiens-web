'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signIn, signOut } from 'next-auth/react'

export default function Navigation() {
  const pathname = usePathname()
  const { data: session, status } = useSession()

  // Don't show navigation on landing page or auth pages
  if (pathname === '/' || pathname?.startsWith('/auth/')) {
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

          <div className="flex items-center gap-4">
            {status === 'loading' ? (
              <div className="text-small opacity-70">Loading...</div>
            ) : session ? (
              <>
                <span className="text-small opacity-90">
                  {session.user?.email || session.user?.name}
                </span>
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2 bg-ivory text-teal rounded hover:bg-ivory-dark transition-colors text-small"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => signIn()}
                className="px-4 py-2 bg-ivory text-teal rounded hover:bg-ivory-dark transition-colors text-small"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
