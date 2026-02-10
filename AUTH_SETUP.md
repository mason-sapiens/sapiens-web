# Authentication Setup Guide

This guide will help you configure Email, Google, and Apple authentication for Sapiens.

## 1. Generate NextAuth Secret

```bash
openssl rand -base64 32
```

Add to `.env.local`:
```
NEXTAUTH_SECRET="your-generated-secret"
NEXTAUTH_URL="http://localhost:3000"  # Change to your production URL in production
```

## 2. Google OAuth Setup

### Steps:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Google+ API"
4. Go to **Credentials** → **Create Credentials** → **OAuth client ID**
5. Application type: **Web application**
6. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (local)
   - `https://yourdomain.com/api/auth/callback/google` (production)

### Add to `.env.local`:
```
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

## 3. Apple Sign In Setup

### Steps:
1. Go to [Apple Developer](https://developer.apple.com/account)
2. **Certificates, Identifiers & Profiles** → **Identifiers**
3. Create a new **Services ID**
4. Enable **Sign in with Apple**
5. Configure domains and redirect URLs:
   - Domains: `yourdomain.com`
   - Return URLs: `https://yourdomain.com/api/auth/callback/apple`
6. Create a **Private Key** for Sign in with Apple
7. Download the key and note the Key ID

### Generate Apple Secret:
Apple requires a JWT token as the client secret. Use a tool like:
- https://github.com/ananay/apple-auth
- Or generate it programmatically

### Add to `.env.local`:
```
APPLE_ID="com.yourcompany.yourapp"
APPLE_SECRET="your-generated-jwt-token"
```

## 4. Email (Magic Link) Setup

You need an SMTP server to send magic link emails. Options:

### Option A: Gmail (Easy for testing)
1. Create a Gmail account or use existing
2. Enable **2-Factor Authentication**
3. Generate an **App Password**: [instructions](https://support.google.com/accounts/answer/185833)

### Add to `.env.local`:
```
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-16-digit-app-password"
EMAIL_FROM="Sapiens <noreply@sapiens.app>"
```

### Option B: SendGrid (Production recommended)
```
EMAIL_SERVER_HOST="smtp.sendgrid.net"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="apikey"
EMAIL_SERVER_PASSWORD="your-sendgrid-api-key"
EMAIL_FROM="Sapiens <noreply@yourdomain.com>"
```

### Option C: AWS SES (Production recommended)
```
EMAIL_SERVER_HOST="email-smtp.us-east-1.amazonaws.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-aws-smtp-username"
EMAIL_SERVER_PASSWORD="your-aws-smtp-password"
EMAIL_FROM="Sapiens <noreply@yourdomain.com>"
```

## 5. Database Migration

Run Prisma migrations to create auth tables:

```bash
npx prisma migrate dev --name add_auth
```

Or in production:
```bash
npx prisma migrate deploy
```

## 6. Environment Variables Summary

Complete `.env.local` file:

```bash
# Database
DATABASE_URL="your-database-url"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Apple OAuth (optional for MVP)
APPLE_ID="com.yourcompany.yourapp"
APPLE_SECRET="your-apple-secret"

# Email Provider
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="Sapiens <noreply@sapiens.app>"

# AI Backend
NEXT_PUBLIC_API_URL="http://3.101.121.64:8000"
```

## 7. Vercel Deployment

Add all environment variables in Vercel:
1. Go to your project in Vercel
2. Settings → Environment Variables
3. Add each variable from above
4. Redeploy

**Important**: Update `NEXTAUTH_URL` to your production URL!

## 8. Testing

1. Start the app: `npm run dev`
2. Visit: `http://localhost:3000`
3. Click "Start" → redirects to sign-in
4. Test each auth method:
   - Email: Enter email, check inbox for magic link
   - Google: Click "Continue with Google"
   - Apple: Click "Continue with Apple"

## Troubleshooting

### Email not sending:
- Check SMTP credentials
- Verify app password (not regular password)
- Check spam folder

### OAuth errors:
- Verify redirect URIs match exactly
- Check that APIs are enabled in cloud console
- Ensure credentials are correct

### Database errors:
- Run `npx prisma generate`
- Run `npx prisma migrate dev`
- Check DATABASE_URL is correct

## Quick Start (Minimum Setup)

To get started quickly, you only need:
1. NextAuth secret
2. Email provider (Gmail is easiest)

Google and Apple OAuth can be added later!

```bash
# Minimum .env.local
DATABASE_URL="your-db-url"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-gmail"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@sapiens.app"
NEXT_PUBLIC_API_URL="http://3.101.121.64:8000"
```
