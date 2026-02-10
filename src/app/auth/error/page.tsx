'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-lg border border-charcoal/10 p-8 text-center">
        <div className="text-h2 text-red-500 mb-4">⚠️</div>
        <h1 className="text-h2 text-charcoal mb-4 font-serif">Authentication Error</h1>
        <p className="text-body text-charcoal/70 mb-6">
          {error === 'Configuration' && 'There is a problem with the server configuration.'}
          {error === 'AccessDenied' && 'You do not have permission to sign in.'}
          {error === 'Verification' && 'The verification link is invalid or has expired.'}
          {!error && 'An error occurred during authentication.'}
        </p>
        <Link
          href="/auth/signin"
          className="inline-block px-6 py-3 bg-teal text-ivory rounded-lg hover:bg-teal-dark transition-colors font-serif text-body"
        >
          Try Again
        </Link>
      </div>
    </div>
  )
}
