# Sapiens Web Application

A minimal, elegant web application for project-based career guidance powered by a multi-agent AI system.

## 🎯 Overview

Sapiens guides users through building recruiter-relevant portfolio projects in 2-3 weeks through an intelligent chat interface. The application integrates with an existing multi-agent AI backend system.

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         Next.js Frontend                 │
│    (sapiens-web - This Project)         │
│                                          │
│  ┌──────────┐  ┌──────────┐  ┌────────┐│
│  │ Landing  │  │ Project  │  │Profile ││
│  │   Page   │  │   Room   │  │        ││
│  └──────────┘  └──────────┘  └────────┘│
└──────────────────┬──────────────────────┘
                   │ API Calls
                   ▼
┌─────────────────────────────────────────┐
│      FastAPI Backend (Existing)         │
│          Multi-Agent AI System          │
│        http://3.101.121.64:8000         │
└─────────────────────────────────────────┘
```

## ✨ Features

- **Minimal Landing** - Single "Start" button experience
- **Project Room** - Unified workspace with:
  - Main Chat interface
  - Project Archive for documents
  - Timeline/Milestones tracker
- **Profile Management** - View and manage all projects
- **Google & Apple Auth** - Seamless authentication
- **Real-time AI Integration** - Connected to existing 5-agent system

## 🎨 Design System

### Colors
- **Background**: Light Ivory (`#FDFBF7`)
- **Primary**: Deep Teal (`#0D4F4F`)
- **Secondary**: Charcoal (`#1A1614`)

### Typography
- **Primary**: Crimson Pro (Serif)
- **Secondary**: Inter (Sans-serif)

### Principles
- Minimal & Calm
- Generous spacing
- Professional tone
- No gamification

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL database (or use Vercel Postgres)
- Existing AI backend running at `http://3.101.121.64:8000`

### Installation

```bash
# Clone or navigate to the project
cd sapiens-web

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Edit .env.local with your credentials

# Set up database
npx prisma generate
npx prisma db push

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🔧 Environment Variables

Create `.env.local` file:

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://3.101.121.64:8000

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/sapiens_web"

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here-generate-with-openssl-rand-base64-32

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Apple Sign In
APPLE_ID=your-apple-id
APPLE_TEAM_ID=your-apple-team-id
APPLE_PRIVATE_KEY=your-apple-private-key
APPLE_KEY_ID=your-apple-key-id
```

## 📁 Project Structure

```
sapiens-web/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── (auth)/            # Auth pages
│   │   │   └── login/
│   │   ├── (app)/             # Protected pages
│   │   │   ├── room/[id]/     # Project Room
│   │   │   └── profile/       # User profile
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # NextAuth
│   │   │   ├── rooms/         # Project Rooms
│   │   │   └── ai/            # AI backend proxy
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   │   ├── landing/           # Landing page
│   │   ├── room/              # Project Room
│   │   ├── chat/              # Chat interface
│   │   ├── archive/           # Document archive
│   │   ├── timeline/          # Milestones
│   │   └── ui/                # Shared UI
│   ├── lib/                   # Utilities
│   │   ├── ai-client.ts       # AI backend client
│   │   ├── prisma.ts          # Database client
│   │   └── auth.ts            # Auth config
│   ├── types/                 # TypeScript types
│   └── styles/                # Global styles
├── prisma/
│   └── schema.prisma          # Database schema
├── public/                    # Static assets
├── .env.local                 # Environment variables
├── next.config.js             # Next.js config
├── tailwind.config.ts         # Tailwind config
└── package.json               # Dependencies
```

## 🔌 AI Backend Integration

The application connects to your existing FastAPI backend:

### Expected Endpoints

```typescript
// Send message to AI system
POST /api/chat
Body: { user_id: string, message: string }
Response: {
  response: string,
  current_state: string
}

// Get project state
GET /api/users/{user_id}/state
Response: {
  current_state: string,
  project_id: string,
  milestones: Milestone[]
}

// Initialize user
POST /api/users?user_id={user_id}
Response: { user_id: string, status: string }
```

### Integration Layer

The frontend uses a lightweight proxy:

```typescript
// src/lib/ai-client.ts
import axios from 'axios';

const aiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export const sendMessage = async (userId: string, message: string) => {
  const { data } = await aiClient.post('/api/chat', {
    user_id: userId,
    message,
  });
  return data;
};
```

## 🔐 Authentication Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Secret to `.env.local`

### Apple Sign In

1. Go to [Apple Developer](https://developer.apple.com/)
2. Register an App ID
3. Enable Sign In with Apple
4. Create a Service ID
5. Configure return URLs
6. Create a private key
7. Add credentials to `.env.local`

## 🗄️ Database Schema

```prisma
model User {
  id            String        @id @default(cuid())
  email         String        @unique
  name          String?
  image         String?
  projectRooms  ProjectRoom[]
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
}

model ProjectRoom {
  id          String      @id @default(cuid())
  userId      String
  user        User        @relation(fields: [userId], references: [id])
  status      String      @default("active")
  phase       String      @default("onboarding")
  targetRole  String?
  targetDomain String?
  messages    Message[]
  milestones  Milestone[]
  artifacts   Artifact[]
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

model Message {
  id            String      @id @default(cuid())
  projectRoomId String
  projectRoom   ProjectRoom @relation(fields: [projectRoomId], references: [id])
  role          String      // 'user' | 'assistant'
  content       String      @db.Text
  phase         String?
  createdAt     DateTime    @default(now())
}

model Milestone {
  id            String      @id @default(cuid())
  projectRoomId String
  projectRoom   ProjectRoom @relation(fields: [projectRoomId], references: [id])
  title         String
  description   String?     @db.Text
  status        String      @default("pending")
  order         Int
  dueDate       DateTime?
  completedAt   DateTime?
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}

model Artifact {
  id            String      @id @default(cuid())
  projectRoomId String
  projectRoom   ProjectRoom @relation(fields: [projectRoomId], references: [id])
  title         String
  content       String      @db.Text
  type          String      // 'document' | 'link' | 'file'
  url           String?
  createdAt     DateTime    @default(now())
}
```

## 📦 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Connect to Vercel Postgres or external database
```

### Manual Deployment

1. Build the application:
```bash
npm run build
```

2. Start production server:
```bash
npm start
```

3. Configure reverse proxy (nginx):
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🧪 Development Workflow

```bash
# Run development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Database migrations
npx prisma migrate dev

# View database
npx prisma studio
```

## 🎯 Key User Flows

### 1. New User Journey
```
Landing → Click "Start" → Login (Google/Apple)
→ Create Project Room → Begin Chat → Onboarding Flow
```

### 2. Returning User
```
Landing → Click "Start" → Already Authenticated
→ Resume Active Room OR Create New Room
```

### 3. Project Room Experience
```
Chat (Default) ↔ Archive ↔ Timeline
All accessible via tabs/navigation
```

## 🔗 API Integration Examples

### Send Chat Message

```typescript
const response = await fetch('/api/rooms/[roomId]/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ content: 'Product Manager' }),
});

const data = await response.json();
// { message: Message, aiResponse: string, phase: string }
```

### Get Room State

```typescript
const response = await fetch('/api/rooms/[roomId]');
const room = await response.json();
// { id, status, phase, messages, milestones, artifacts }
```

## 📊 Monitoring

- **Logs**: Check console for API responses and errors
- **Database**: Use Prisma Studio (`npx prisma studio`)
- **AI Backend**: Monitor backend logs for integration issues

## 🛠️ Troubleshooting

### AI Backend Connection Issues
```bash
# Test backend connection
curl http://3.101.121.64:8000/health

# Check CORS settings in backend
# Ensure backend allows requests from your frontend domain
```

### Authentication Problems
```bash
# Verify callback URLs match exactly
# Check OAuth credentials are correct
# Ensure NEXTAUTH_SECRET is set
```

### Database Issues
```bash
# Reset database
npx prisma migrate reset

# Generate Prisma client
npx prisma generate
```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 📝 License

Proprietary - All Rights Reserved

## 🤝 Support

For issues or questions:
1. Check this README
2. Review the AI backend documentation
3. Check Next.js/Prisma documentation
4. Contact the development team

---

**Built with Next.js 14, TypeScript, Prisma, and Tailwind CSS**
