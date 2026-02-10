# Supabase Connection Fix

## Issue
Email authentication was failing with error: `FATAL: Tenant or user not found`

## Root Cause  
The direct connection to `db.bksfqxlkuvgcjyfcuuer.supabase.co:5432` doesn't resolve from some networks.

## Solution
Use Supabase's connection pooler instead.

## Correct DATABASE_URL Format

In your `.env.local`, use:

```bash
# Session Mode Pooler (Recommended)
DATABASE_URL="postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres"
```

**For this project specifically:**
```bash
DATABASE_URL="postgresql://postgres.bksfqxlkuvgcjyfcuuer:YOUR_PASSWORD@aws-0-us-west-1.pooler.supabase.com:5432/postgres"
```

## How to Get the Correct Connection String

1. Go to: https://supabase.com/dashboard/project/bksfqxlkuvgcjyfcuuer/settings/database
2. Find "Connection Pooling" section  
3. Select **"Session mode"** tab
4. Copy the connection string
5. Replace `[YOUR-PASSWORD]` with your database password

## Vercel Deployment

Make sure to use the same pooler connection string in Vercel's environment variables.

