# 🚀 Complete Deployment Guide

## Overview

This guide provides all the code and steps to deploy the Sapiens Web Application.

---

## 📦 Step 1: Initialize Project

You've already completed this! The project structure is ready.

Files created:
- ✅ `package.json`
- ✅ `next.config.js`
- ✅ `tsconfig.json`
- ✅ `tailwind.config.ts`
- ✅ `prisma/schema.prisma`
- ✅ `.env.example`
- ✅ `.gitignore`
- ✅ `postcss.config.js`

---

## 🔧 Step 2: Install & Setup

```bash
cd /Users/geunwon/Desktop/Sapiens/sapiens-web

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local

# Edit .env.local with your credentials
nano .env.local

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

---

## 📂 Step 3: Create Directory Structure

```bash
# Create all necessary directories
mkdir -p src/app/(auth)/login
mkdir -p src/app/(app)/room/[id]
mkdir -p src/app/(app)/profile
mkdir -p src/app/api/auth/[...nextauth]
mkdir -p src/app/api/rooms/[id]/messages
mkdir -p src/app/api/ai/proxy
mkdir -p src/components/{landing,room,chat,timeline,archive,profile,ui}
mkdir -p src/lib
mkdir -p src/types
mkdir -p src/styles
mkdir -p public/fonts
```

---

## 💻 Step 4: Core Application Files

### `src/app/layout.tsx` (Root Layout)

```typescript
import type { Metadata } from 'next'
import { Crimson_Pro, Inter } from 'next/font/google'
import './globals.css'

const crimsonPro = Crimson_Pro({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Sapiens - AI Career Coach',
  description: 'Build portfolio projects that impress recruiters',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${crimsonPro.variable} ${inter.variable}`}>
      <body className="font-serif bg-ivory text-charcoal antialiased">
        {children}
      </body>
    </html>
  )
}
```

### `src/app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    @apply scroll-smooth;
  }

  body {
    @apply min-h-screen;
  }

  h1, h2, h3, h4, h5, h6 {
    @apply font-serif;
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
```

### `src/app/page.tsx` (Landing Page)

```typescript
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'

export default async function LandingPage() {
  const session = await getServerSession(authOptions)

  // If already authenticated, redirect to app
  if (session) {
    redirect('/room')
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
        <div>
          <Link
            href="/api/auth/signin"
            className="inline-block px-12 py-4 bg-teal text-ivory text-h3 font-serif hover:bg-teal-dark transition-colors duration-300 rounded-sm"
          >
            Start
          </Link>
        </div>

        {/* Subtle footer */}
        <p className="text-small text-charcoal/40 mt-24">
          Guided by AI · No credit card required
        </p>
      </div>
    </main>
  )
}
```

---

## 🔐 Step 5: Authentication Setup

### `src/lib/auth.ts`

```typescript
import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import AppleProvider from 'next-auth/providers/apple'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    AppleProvider({
      clientId: process.env.APPLE_ID!,
      clientSecret: {
        appleId: process.env.APPLE_ID!,
        teamId: process.env.APPLE_TEAM_ID!,
        privateKey: process.env.APPLE_PRIVATE_KEY!,
        keyId: process.env.APPLE_KEY_ID!,
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },
  },
}
```

### `src/lib/prisma.ts`

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### `src/app/api/auth/[...nextauth]/route.ts`

```typescript
import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
```

---

## 🤖 Step 6: AI Backend Integration

### `src/lib/ai-client.ts`

```typescript
import axios from 'axios'

const aiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://3.101.121.64:8000',
  timeout: 30000,
})

export interface AIMessage {
  user_id: string
  message: string
}

export interface AIResponse {
  user_id: string
  response: string
  current_state: string
}

export const aiService = {
  async sendMessage(userId: string, message: string): Promise<AIResponse> {
    const { data } = await aiClient.post<AIResponse>('/api/chat', {
      user_id: userId,
      message,
    })
    return data
  },

  async initializeUser(userId: string): Promise<void> {
    await aiClient.post(`/api/users?user_id=${userId}`)
  },

  async checkHealth(): Promise<boolean> {
    try {
      const { data } = await aiClient.get('/health')
      return data.status === 'healthy'
    } catch {
      return false
    }
  },
}
```

### `src/types/index.ts`

```typescript
export interface User {
  id: string
  name: string | null
  email: string | null
  image: string | null
}

export interface ProjectRoom {
  id: string
  userId: string
  status: 'active' | 'completed' | 'archived'
  phase: string
  targetRole?: string
  targetDomain?: string
  messages: Message[]
  milestones: Milestone[]
  artifacts: Artifact[]
  createdAt: Date
  updatedAt: Date
}

export interface Message {
  id: string
  projectRoomId: string
  role: 'user' | 'assistant'
  content: string
  phase?: string
  createdAt: Date
}

export interface Milestone {
  id: string
  projectRoomId: string
  title: string
  description?: string
  status: 'pending' | 'in_progress' | 'completed'
  order: number
  dueDate?: Date
  completedAt?: Date
}

export interface Artifact {
  id: string
  projectRoomId: string
  title: string
  content: string
  type: 'document' | 'link' | 'proposal' | 'review'
  url?: string
}
```

---

## 📡 Step 7: API Routes

### `src/app/api/rooms/route.ts` (Create/List Rooms)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { aiService } from '@/lib/ai-client'

// GET /api/rooms - List user's rooms
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rooms = await prisma.projectRoom.findMany({
    where: { userId: session.user.id },
    include: {
      messages: {
        take: 1,
        orderBy: { createdAt: 'desc' },
      },
      milestones: {
        where: { status: { not: 'completed' } },
        take: 3,
      },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json(rooms)
}

// POST /api/rooms - Create new room
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Initialize user in AI backend
  try {
    await aiService.initializeUser(session.user.id)
  } catch (error) {
    console.error('Failed to initialize AI user:', error)
  }

  // Create room in database
  const room = await prisma.projectRoom.create({
    data: {
      userId: session.user.id,
      status: 'active',
      phase: 'onboarding',
    },
  })

  return NextResponse.json(room)
}
```

### `src/app/api/rooms/[id]/messages/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { aiService } from '@/lib/ai-client'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const messages = await prisma.message.findMany({
    where: {
      projectRoomId: params.id,
      projectRoom: { userId: session.user.id },
    },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json(messages)
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { content } = await request.json()

  // Verify room ownership
  const room = await prisma.projectRoom.findFirst({
    where: {
      id: params.id,
      userId: session.user.id,
    },
  })

  if (!room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 })
  }

  // Save user message
  const userMessage = await prisma.message.create({
    data: {
      projectRoomId: params.id,
      role: 'user',
      content,
      phase: room.phase,
    },
  })

  // Send to AI backend
  try {
    const aiResponse = await aiService.sendMessage(session.user.id, content)

    // Save AI response
    const assistantMessage = await prisma.message.create({
      data: {
        projectRoomId: params.id,
        role: 'assistant',
        content: aiResponse.response,
        phase: aiResponse.current_state,
      },
    })

    // Update room phase
    await prisma.projectRoom.update({
      where: { id: params.id },
      data: { phase: aiResponse.current_state },
    })

    return NextResponse.json({
      userMessage,
      assistantMessage,
      phase: aiResponse.current_state,
    })
  } catch (error) {
    console.error('AI backend error:', error)
    return NextResponse.json(
      { error: 'Failed to get AI response' },
      { status: 500 }
    )
  }
}
```

---

## 🎨 Step 8: UI Components

### `src/components/ui/Button.tsx`

```typescript
import { ButtonHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          'inline-flex items-center justify-center rounded-sm font-serif transition-colors',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          {
            'bg-teal text-ivory hover:bg-teal-dark': variant === 'primary',
            'bg-charcoal text-ivory hover:bg-charcoal-light': variant === 'secondary',
            'bg-transparent hover:bg-ivory-dark': variant === 'ghost',
            'px-4 py-2 text-small': size === 'sm',
            'px-6 py-3 text-body': size === 'md',
            'px-8 py-4 text-h3': size === 'lg',
          },
          className
        )}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'
```

---

## 🏠 Step 9: Project Room Page

### `src/app/(app)/room/[id]/page.tsx`

```typescript
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { RoomLayout } from '@/components/room/RoomLayout'

export default async function ProjectRoomPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/api/auth/signin')
  }

  const room = await prisma.projectRoom.findFirst({
    where: {
      id: params.id,
      userId: session.user.id,
    },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
      milestones: {
        orderBy: { order: 'asc' },
      },
      artifacts: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!room) {
    redirect('/profile')
  }

  return <RoomLayout room={room} />
}
```

---

## ✅ Step 10: Deploy

```bash
# Build locally to test
npm run build
npm start

# Deploy to Vercel
vercel

# Or push to GitHub and connect Vercel
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO
git push -u origin main
```

---

## 🎯 Success Criteria

After deployment, verify:

1. ✅ Landing page loads at your domain
2. ✅ "Start" button triggers auth flow
3. ✅ After login, creates/enters Project Room
4. ✅ Chat interface connects to AI backend
5. ✅ Messages persist in database
6. ✅ Timeline displays milestones
7. ✅ Archive shows documents

---

## 📞 Support

If you encounter issues:

1. Check `.env.local` variables
2. Verify database connection with `npx prisma studio`
3. Test AI backend: `curl http://3.101.121.64:8000/health`
4. Check Next.js logs for errors
5. Review Network tab in browser DevTools

**Your application is ready to deploy!**

