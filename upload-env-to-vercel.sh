#!/bin/bash

# Script to upload environment variables to Vercel
# Make sure you're logged in first: vercel login

echo "🚀 Uploading environment variables to Vercel..."
echo ""

# Get the production URL from user
read -p "Enter your Vercel production URL (e.g., https://sapiens-web.vercel.app): " PROD_URL

# Add environment variables to Vercel (production, preview, and development)
echo "📝 Adding NEXTAUTH_URL..."
echo "$PROD_URL" | vercel env add NEXTAUTH_URL production

echo "📝 Adding NEXTAUTH_SECRET..."
echo "yf88OTnAmNQZG7gG0jAbkvCrW7JKuN+Kb7yXVDOHtmk=" | vercel env add NEXTAUTH_SECRET production preview development

echo "📝 Adding DATABASE_URL..."
echo "postgresql://postgres.bksfqxlkuvgcjyfcuuer:tkvldpstmmvp1**@aws-0-us-west-1.pooler.supabase.com:5432/postgres" | vercel env add DATABASE_URL production preview development

echo "📝 Adding EMAIL_SERVER_HOST..."
echo "smtp.gmail.com" | vercel env add EMAIL_SERVER_HOST production preview development

echo "📝 Adding EMAIL_SERVER_PORT..."
echo "587" | vercel env add EMAIL_SERVER_PORT production preview development

echo "📝 Adding EMAIL_SERVER_USER..."
echo "mason@sapiens-labs.com" | vercel env add EMAIL_SERVER_USER production preview development

echo "📝 Adding EMAIL_SERVER_PASSWORD..."
echo "apdltmstkvldpstmfoq1**" | vercel env add EMAIL_SERVER_PASSWORD production preview development

echo "📝 Adding EMAIL_FROM..."
echo "Sapiens <noreply@sapiens.app>" | vercel env add EMAIL_FROM production preview development

echo "📝 Adding NEXT_PUBLIC_API_URL..."
echo "http://3.101.121.64:8000" | vercel env add NEXT_PUBLIC_API_URL production preview development

echo ""
echo "✅ All environment variables uploaded!"
echo "🔄 Now redeploying your project..."
echo ""

# Trigger a redeploy
vercel --prod

echo ""
echo "🎉 Done! Your app should be deploying with the new environment variables."
