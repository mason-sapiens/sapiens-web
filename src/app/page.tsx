'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const handleStart = () => {
    if (session) {
      router.push('/chat')
    } else {
      router.push('/auth/signin')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-2xl mx-auto space-y-12 animate-fade-in">
        {/* Logo/Title */}
        <div className="space-y-4">
          <h1 className="text-display font-serif text-teal">
            Sapiens
          </h1>
          <p className="text-body text-charcoal/70 max-w-lg mx-auto">
            Build a portfolio project that impresses recruiters in 2–3 weeks
          </p>
        </div>

        {/* Single CTA */}
        <div className="space-y-4">
          <button
            onClick={handleStart}
            disabled={status === 'loading'}
            className="inline-block px-12 py-4 bg-teal text-ivory text-h3 font-serif hover:bg-teal-dark transition-colors duration-300 rounded-sm disabled:opacity-50"
          >
            {status === 'loading' ? 'Loading...' : 'Start'}
          </button>

          {session && (
            <div>
              <Link
                href="/profile"
                className="text-small text-teal hover:underline"
              >
                View My Projects
              </Link>
            </div>
          )}
        </div>

        {/* Subtle footer */}
        <p className="text-small text-charcoal/40 mt-24">
          Guided by AI · No credit card required
        </p>
      </div>
    </main>
  )
}
