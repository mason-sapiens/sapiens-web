'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignInPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
        setIsLoading(false)
        return
      }

      // Redirect to chat on success
      router.push('/chat')
    } catch (error) {
      console.error('Sign in error:', error)
      setError('An unexpected error occurred')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-lg border border-charcoal/10 p-8">
        <div className="text-center mb-8">
          <h1 className="text-h2 text-charcoal mb-2 font-serif">Welcome Back</h1>
          <p className="text-body text-charcoal/70">
            Sign in to continue your career development journey
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-small text-charcoal/70 mb-2">
              Email address
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
              Password
            </label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Your password"
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
            disabled={isLoading}
            className="w-full px-6 py-4 bg-teal text-ivory rounded-lg hover:bg-teal-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-serif text-body font-semibold"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-small text-charcoal/60 text-center mt-6">
          Don't have an account?{' '}
          <Link href="/auth/signup" className="text-teal hover:underline font-medium">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
}
