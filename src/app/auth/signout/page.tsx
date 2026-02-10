'use client'

import { signOut } from 'next-auth/react'
import { useEffect } from 'react'

export default function SignOutPage() {
  useEffect(() => {
    signOut({ callbackUrl: '/' })
  }, [])

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center p-6">
      <div className="text-center">
        <div className="text-h2 text-teal mb-4">Signing out...</div>
      </div>
    </div>
  )
}
