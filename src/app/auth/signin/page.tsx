'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import Link from 'next/link'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      const result = await signIn('email', { email, redirect: false })
      console.log('Sign in result:', result)

      if (result?.error) {
        setError(result.error)
        console.error('Sign in error:', result.error)
      } else if (result?.ok) {
        setEmailSent(true)
      } else {
        setError('Failed to send email. Please try again.')
      }
    } catch (error) {
      console.error('Email sign in error:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = (provider: 'google' | 'apple') => {
    signIn(provider, { callbackUrl: '/profile' })
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-lg border border-charcoal/10 p-8">
          <div className="text-center mb-6">
            <div className="text-h2 text-teal mb-2">📧</div>
            <h1 className="text-h2 text-charcoal mb-2 font-serif">Check your email</h1>
            <p className="text-body text-charcoal/70">
              We've sent a sign-in link to <strong>{email}</strong>
            </p>
          </div>
          <p className="text-small text-charcoal/60 text-center">
            Click the link in the email to complete your sign-in
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-lg border border-charcoal/10 p-8">
        <div className="text-center mb-8">
          <h1 className="text-h2 text-charcoal mb-2 font-serif">Welcome to Sapiens</h1>
          <p className="text-body text-charcoal/70">
            Sign in to continue your career development journey
          </p>
        </div>

        {/* OAuth Providers */}
        <div className="space-y-3 mb-6">
          <button
            onClick={() => handleOAuthSignIn('google')}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border border-charcoal/20 rounded-lg hover:border-teal hover:bg-ivory transition-colors text-body font-serif"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <button
            onClick={() => handleOAuthSignIn('apple')}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-charcoal text-ivory rounded-lg hover:bg-charcoal/90 transition-colors text-body font-serif"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            Continue with Apple
          </button>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-charcoal/10"></div>
          </div>
          <div className="relative flex justify-center text-small">
            <span className="px-4 bg-white text-charcoal/60">Or continue with email</span>
          </div>
        </div>

        {/* Email Sign In */}
        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-small text-charcoal/70 mb-2">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-3 border border-charcoal/20 rounded-lg focus:outline-none focus:border-teal bg-ivory text-charcoal placeholder:text-charcoal/40 font-serif text-body"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-small text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !email}
            className="w-full px-6 py-4 bg-teal text-ivory rounded-lg hover:bg-teal-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-serif text-body"
          >
            {isLoading ? 'Sending...' : 'Send sign-in link'}
          </button>
        </form>

        <p className="text-small text-charcoal/60 text-center mt-6">
          By signing in, you agree to our{' '}
          <Link href="/terms" className="text-teal hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-teal hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}
