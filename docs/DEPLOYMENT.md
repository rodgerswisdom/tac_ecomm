# Vercel Deployment Guide

This guide will help you deploy your TAC E-commerce application to Vercel.

## Prerequisites

1. A Vercel account
2. A PostgreSQL database (Vercel Postgres recommended)
3. Required API keys and credentials

## Step 1: Database Setup

### Option A: Vercel Postgres (Recommended)

1. Go to your Vercel dashboard
2. Navigate to Storage → Create Database → Postgres
3. Create a new Postgres database
4. Copy the connection string

### Option B: External PostgreSQL

Use services like:

- Supabase
- PlanetScale
- Railway
- Neon

## Step 2: Environment Variables

Add these environment variables to your Vercel project:

### Required Variables

```sh
DATABASE_URL=postgresql://username:password@host:5432/database?schema=public
NEXTAUTH_SECRET=your-production-secret-key-here
NEXTAUTH_URL=https://your-domain.vercel.app
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Payment Gateways

```sh
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
PAYPAL_MODE=live
PESAPAL_CONSUMER_KEY=your-pesapal-consumer-key
PESAPAL_CONSUMER_SECRET=your-pesapal-consumer-secret
PESAPAL_ENVIRONMENT=production
PESAPAL_NOTIFICATION_ID=your-pesapal-notification-id
```

### Email Service

```sh
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM=noreply@your-domain.com
```

### Image Upload

```sh
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=tac_accessories
```

### App Configuration

```sh
APP_NAME=TAC Accessories
APP_URL=https://your-domain.vercel.app
ADMIN_EMAIL=admin@your-domain.com
DEFAULT_CURRENCY=USD
ENABLE_DYNAMIC_PRICING=true
```

### Optional

```sh
GOOGLE_ANALYTICS_ID=your-ga-id
SHIPENGINE_API_KEY=your-shipengine-api-key
EASYPOST_API_KEY=your-easypost-api-key
```

## Step 3: Deploy to Vercel

### Method 1: Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

### Method 2: GitHub Integration

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Vercel will automatically deploy on every push

## Step 4: Database Migration

After deployment, run database migrations:

```bash
# Using Vercel CLI
vercel env pull .env.local
npx prisma migrate deploy
```

Or add this to your Vercel build command:

```bash
npx prisma migrate deploy && npm run build
```

## Step 5: Post-Deployment Setup

1. **Seed the database** (if needed):

   ```bash
   npm run db:seed
   ```

2. **Verify deployment**:
   - Check all pages load correctly
   - Test authentication
   - Verify database connections
   - Test payment flows (in sandbox mode first)

## Important Notes

- The project is configured to use PostgreSQL in production
- Prisma client is generated during build
- All environment variables must be set in Vercel dashboard
- Use production API keys for payment gateways
- Ensure your domain is properly configured in OAuth providers

## Troubleshooting

### Build Failures

- Check that all environment variables are set
- Verify Prisma schema is valid
- Ensure all dependencies are in package.json

### Database Issues

- Verify DATABASE_URL is correct
- Check database permissions
- Run migrations manually if needed

### Authentication Issues

- Verify NEXTAUTH_SECRET is set
- Check OAuth provider configurations
- Ensure callback URLs are correct

## Security Checklist

- [ ] Use strong NEXTAUTH_SECRET
- [ ] Enable HTTPS only
- [ ] Use production API keys
- [ ] Set up proper CORS policies
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging
