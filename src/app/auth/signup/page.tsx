'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignUpPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      // Create account
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create account')
        setIsLoading(false)
        return
      }

      // Show success message
      setSuccess(true)
      setIsLoading(false)
    } catch (error) {
      console.error('Signup error:', error)
      setError('An unexpected error occurred')
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-lg border border-charcoal/10 p-8 text-center">
          <div className="text-h2 text-teal mb-4">📧</div>
          <h1 className="text-h2 text-charcoal mb-4 font-serif">Check Your Email</h1>
          <p className="text-body text-charcoal/70 mb-6">
            We've sent a verification link to <strong>{formData.email}</strong>
          </p>
          <p className="text-small text-charcoal/60 mb-6">
            Please click the link in the email to verify your account. The link will expire in 24 hours.
          </p>
          <Link
            href="/auth/signin"
            className="inline-block px-6 py-3 bg-teal text-ivory rounded-lg hover:bg-teal-dark transition-colors font-serif text-body"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-lg border border-charcoal/10 p-8">
        <div className="text-center mb-8">
          <h1 className="text-h2 text-charcoal mb-2 font-serif">Create Account</h1>
          <p className="text-body text-charcoal/70">
            Sign up to start your career development journey
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-small text-charcoal/70 mb-2">
              Name (optional)
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Your name"
              className="w-full px-4 py-3 border border-charcoal/20 rounded-lg focus:outline-none focus:border-teal bg-ivory text-charcoal placeholder:text-charcoal/40 font-serif text-body"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-small text-charcoal/70 mb-2">
              Email address *
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-3 border border-charcoal/20 rounded-lg focus:outline-none focus:border-teal bg-ivory text-charcoal placeholder:text-charcoal/40 font-serif text-body"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-small text-charcoal/70 mb-2">
              Password *
            </label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="At least 8 characters"
              required
              minLength={8}
              className="w-full px-4 py-3 border border-charcoal/20 rounded-lg focus:outline-none focus:border-teal bg-ivory text-charcoal placeholder:text-charcoal/40 font-serif text-body"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-small text-charcoal/70 mb-2">
              Confirm Password *
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Confirm your password"
              required
              minLength={8}
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
            disabled={isLoading}
            className="w-full px-6 py-4 bg-teal text-ivory rounded-lg hover:bg-teal-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-serif text-body font-semibold"
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-small text-charcoal/60 text-center mt-6">
          Already have an account?{' '}
          <Link href="/auth/signin" className="text-teal hover:underline font-medium">
            Sign In
          </Link>
        </p>

        <p className="text-small text-charcoal/60 text-center mt-6">
          By signing up, you agree to our{' '}
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
