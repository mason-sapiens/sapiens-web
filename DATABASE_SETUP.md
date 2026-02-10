# Database Setup Guide

## Recommended: Supabase (Free Tier)

### 1. Create Supabase Project
1. Go to https://supabase.com/dashboard
2. Click "New project"
3. Fill in:
   - Name: `sapiens`
   - Database Password: `[strong password]`
   - Region: `[closest to you]`
4. Wait for setup to complete (~2 minutes)

### 2. Get Database URL
1. Go to Project Settings → Database
2. Scroll to "Connection string"
3. Select **"URI"** tab
4. Copy the connection string (looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[xxx].supabase.co:5432/postgres
   ```

### 3. Update .env.local
```bash
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[xxx].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
```

Replace `[YOUR-PASSWORD]` with the password you chose.

### 4. Run Migrations
```bash
cd /Users/geunwon/Desktop/Sapiens/sapiens-web
npx prisma migrate dev --name init
```

This creates all the tables needed for:
- User authentication (User, Account, Session)
- Project rooms
- Messages
- Milestones
- Artifacts

## Alternative: Vercel Postgres

If using Vercel for deployment:
1. Go to Vercel Dashboard → Your Project
2. Storage tab → Create Database → Postgres
3. Copy the DATABASE_URL
4. Add to .env.local
5. Run migrations

## Alternative: Neon.tech

Free serverless Postgres:
1. https://neon.tech
2. Create project
3. Copy connection string
4. Add to .env.local
5. Run migrations

## Verify Setup

After adding DATABASE_URL, run:
```bash
npx prisma migrate status
npx prisma studio  # Opens database GUI
```

## What Gets Stored

The database stores:
- **Users**: email, name, image (from OAuth)
- **Accounts**: OAuth provider data (Google, Apple)
- **Sessions**: Active user sessions
- **ProjectRooms**: User projects with phase, role, domain
- **Messages**: All chat messages
- **Milestones**: Project milestones
- **Artifacts**: Generated documents/deliverables
