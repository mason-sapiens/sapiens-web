import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import AppleProvider from 'next-auth/providers/apple'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// Only include providers if they have valid credentials
const providers = []

// Credentials provider (email + password)
providers.push(
  CredentialsProvider({
    name: 'credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' }
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error('Email and password are required')
      }

      const user = await prisma.user.findUnique({
        where: { email: credentials.email }
      })

      if (!user || !user.password) {
        throw new Error('Invalid email or password')
      }

      // Check if email is verified
      if (!user.emailVerified) {
        throw new Error('Please verify your email before signing in. Check your inbox for the verification link.')
      }

      const isPasswordValid = await bcrypt.compare(
        credentials.password,
        user.password
      )

      if (!isPasswordValid) {
        throw new Error('Invalid email or password')
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      }
    }
  })
)

// Google OAuth (only if credentials are provided)
if (
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_ID !== 'your-google-client-id-here' &&
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_CLIENT_SECRET !== 'your-google-client-secret-here'
) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  )
}

// Apple Sign In (only if credentials are provided)
if (
  process.env.APPLE_ID &&
  process.env.APPLE_ID !== 'your-apple-id-here' &&
  process.env.APPLE_SECRET
) {
  providers.push(
    AppleProvider({
      clientId: process.env.APPLE_ID,
      clientSecret: process.env.APPLE_SECRET,
    })
  )
}

export const authOptions: NextAuthOptions = {
  // Note: Credentials provider doesn't work with database sessions
  // adapter: PrismaAdapter(prisma) as any,
  providers,
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // Allow sign in
      return true
    },
    async redirect({ url, baseUrl }) {
      // After successful sign-in, redirect to chat page
      if (url.startsWith(baseUrl)) {
        return url
      }
      // Default redirect to chat page after sign-in
      return `${baseUrl}/chat`
    },
  },
  session: {
    strategy: 'jwt', // Required for Credentials provider
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: true,
  events: {
    async createUser(message) {
      console.log('User created:', message.user.email)
    },
    async signIn(message) {
      console.log('User signed in:', message.user.email)
    },
  },
  logger: {
    error(code, metadata) {
      console.error('NextAuth Error:', code, metadata)
    },
    warn(code) {
      console.warn('NextAuth Warning:', code)
    },
    debug(code, metadata) {
      console.log('NextAuth Debug:', code, metadata)
    },
  },
}
