# Supabase Connection Fix

## Issue
Email authentication was failing with error: `FATAL: Tenant or user not found`

## Root Cause  
The direct connection to `db.bksfqxlkuvgcjyfcuuer.supabase.co:5432` doesn't resolve from some networks.

## Solution
Use Supabase's connection pooler instead.

## Correct DATABASE_URL Format

### For Vercel/Serverless (Transaction Mode - Port 6543)
**Use this for serverless environments like Vercel:**

```bash
DATABASE_URL="postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

**For this project specifically:**
```bash
DATABASE_URL="postgresql://postgres.bksfqxlkuvgcjyfcuuer:YOUR_PASSWORD@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

### For Local Development (Session Mode - Port 5432)
**Use this for local `npm run dev`:**

```bash
DATABASE_URL="postgresql://postgres.bksfqxlkuvgcjyfcuuer:YOUR_PASSWORD@aws-0-us-west-1.pooler.supabase.com:5432/postgres"
```

## Why Different Ports?

- **Port 6543 (Transaction Mode)**: For serverless functions that need short-lived connections
- **Port 5432 (Session Mode)**: For long-running processes like local development
- The `?pgbouncer=true` parameter is required for transaction mode

## How to Get the Correct Connection String

1. Go to: https://supabase.com/dashboard/project/bksfqxlkuvgcjyfcuuer/settings/database
2. Find "Connection Pooling" section
3. For Vercel: Select **"Transaction mode"** tab (port 6543)
4. For Local: Select **"Session mode"** tab (port 5432)
5. Copy the connection string
6. Replace `[YOUR-PASSWORD]` with your database password
7. For Transaction mode, add `?pgbouncer=true` at the end

## Vercel Deployment

Make sure to use Transaction Mode (port 6543) with `?pgbouncer=true` in Vercel's environment variables.

