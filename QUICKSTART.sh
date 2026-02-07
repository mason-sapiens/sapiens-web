#!/bin/bash

echo "🚀 Sapiens Web Application - Quick Start"
echo "========================================"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js and npm are installed"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Check for .env.local
if [ ! -f .env.local ]; then
    echo "⚠️  No .env.local found. Creating from .env.example..."
    cp .env.example .env.local
    echo "✅ Created .env.local"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env.local with your actual credentials before proceeding"
    echo ""
    read -p "Press Enter after you've configured .env.local..."
fi

echo "✅ Environment configured"
echo ""

# Generate Prisma client
echo "🔨 Generating Prisma client..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma client"
    exit 1
fi

echo "✅ Prisma client generated"
echo ""

# Push database schema
echo "📊 Setting up database..."
echo "This will create tables in your database."
read -p "Continue? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    npx prisma db push

    if [ $? -ne 0 ]; then
        echo "❌ Failed to push database schema"
        echo "Please check your DATABASE_URL in .env.local"
        exit 1
    fi

    echo "✅ Database set up successfully"
else
    echo "⚠️  Skipped database setup. Run 'npx prisma db push' manually when ready."
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Make sure your .env.local is configured"
echo "  2. Run 'npm run dev' to start development server"
echo "  3. Visit http://localhost:3000"
echo ""
echo "For detailed instructions, see:"
echo "  - README.md"
echo "  - SETUP.md"
echo "  - DEPLOYMENT_GUIDE.md"
echo ""
