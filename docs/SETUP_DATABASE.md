# Database Setup Guide

## Issue

The error `The table public.User does not exist in the current database` indicates that:

1. The database tables haven't been created yet
2. The `DATABASE_URL` environment variable may be missing or incorrect

## Quick Fix

### Step 1: Add DATABASE_URL to .env file

Make sure your `.env` file contains:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/tac_ecomm?schema=public"
```

**For Neon PostgreSQL (recommended):**

```bash
DATABASE_URL="postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require"
```

**For local PostgreSQL:**

```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/tac_ecomm?schema=public"
```

### Step 2: Add NEXTAUTH_SECRET

Also ensure you have:

```bash
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

Generate a secure secret:

```bash
openssl rand -base64 32
```

### Step 3: Run Database Migration

Once `DATABASE_URL` is set, run:

```bash
# Option 1: Push schema directly (for development)
npm run db:push

# Option 2: Create and run migrations (for production)
npm run db:migrate
```

### Step 4: Generate Prisma Client

```bash
npm run db:generate
```

### Step 5: (Optional) Seed the database

```bash
npm run db:seed
```

## Verify Setup

After running the migration, you should see:

- ✅ All tables created in your database
- ✅ Prisma client generated
- ✅ Authentication should work

## Troubleshooting

### If DATABASE_URL is still not found

1. Make sure `.env` file is in the root directory
2. Restart your development server
3. Check that there are no syntax errors in `.env` file

### If migration fails

1. Check your database connection string
2. Ensure PostgreSQL is running (if using local DB)
3. Verify database user has proper permissions
4. Check network connectivity (if using cloud DB)

### Common Database URLs

**Neon (Free PostgreSQL):**

- Sign up at <https://neon.tech>
- Create a new project
- Copy the connection string
- Format: `postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require`

**Supabase:**

- Format: `postgresql://postgres:password@db.xxx.supabase.co:5432/postgres`

**Local PostgreSQL:**

- Format: `postgresql://postgres:password@localhost:5432/tac_ecomm?schema=public`
