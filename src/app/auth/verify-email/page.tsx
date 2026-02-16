'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token')
      const email = searchParams.get('email')

      if (!token || !email) {
        setStatus('error')
        setMessage('Invalid verification link')
        return
      }

      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, email }),
        })

        const data = await response.json()

        if (response.ok) {
          setStatus('success')
          setMessage('Email verified successfully!')
          // Redirect to sign in after 3 seconds
          setTimeout(() => router.push('/auth/signin'), 3000)
        } else {
          setStatus('error')
          setMessage(data.error || 'Verification failed')
        }
      } catch (error) {
        setStatus('error')
        setMessage('An error occurred during verification')
      }
    }

    verifyEmail()
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-lg border border-charcoal/10 p-8 text-center">
        {status === 'verifying' && (
          <>
            <div className="text-h2 mb-4">⏳</div>
            <h1 className="text-h2 text-charcoal mb-4 font-serif">Verifying Email...</h1>
            <p className="text-body text-charcoal/70">
              Please wait while we verify your email address
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-h2 mb-4">✅</div>
            <h1 className="text-h2 text-charcoal mb-4 font-serif">Email Verified!</h1>
            <p className="text-body text-charcoal/70 mb-6">
              {message}
            </p>
            <p className="text-small text-charcoal/60">
              Redirecting to sign in...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-h2 text-red-500 mb-4">❌</div>
            <h1 className="text-h2 text-charcoal mb-4 font-serif">Verification Failed</h1>
            <p className="text-body text-charcoal/70 mb-6">
              {message}
            </p>
            <Link
              href="/auth/signin"
              className="inline-block px-6 py-3 bg-teal text-ivory rounded-lg hover:bg-teal-dark transition-colors font-serif text-body"
            >
              Go to Sign In
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-teal">Loading...</div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
