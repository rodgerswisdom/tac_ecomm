#!/bin/bash

# Database Setup Script
# This script helps set up the database for the TAC Ecommerce app

set -e

echo "🔧 TAC Ecommerce Database Setup"
echo "================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Creating .env from env.example..."
    cp env.example .env
    echo "✅ Created .env file. Please update DATABASE_URL and NEXTAUTH_SECRET"
    exit 1
fi

# Check if DATABASE_URL is set
if ! grep -q "^DATABASE_URL=" .env; then
    echo "⚠️  DATABASE_URL not found in .env"
    echo ""
    echo "Please add DATABASE_URL to your .env file:"
    echo ""
    echo "For Neon PostgreSQL:"
    echo 'DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require"'
    echo ""
    echo "For local PostgreSQL:"
    echo 'DATABASE_URL="postgresql://postgres:password@localhost:5432/tac_ecomm?schema=public"'
    echo ""
    exit 1
fi

# Check if NEXTAUTH_SECRET is set
if ! grep -q "^NEXTAUTH_SECRET=" .env; then
    echo "⚠️  NEXTAUTH_SECRET not found in .env"
    echo "Generating a secure secret..."
    SECRET=$(openssl rand -base64 32)
    echo "" >> .env
    echo "# NextAuth.js" >> .env
    echo "NEXTAUTH_SECRET=\"$SECRET\"" >> .env
    echo "NEXTAUTH_URL=\"http://localhost:3000\"" >> .env
    echo "✅ Added NEXTAUTH_SECRET to .env"
fi

echo "📦 Generating Prisma Client..."
npm run db:generate

echo ""
echo "🗄️  Pushing database schema..."
npm run db:push

echo ""
echo "✅ Database setup complete!"
echo ""
echo "You can now:"
echo "  - Start the dev server: npm run dev"
echo "  - View database: npm run db:studio"
echo "  - Seed database: npm run db:seed"
