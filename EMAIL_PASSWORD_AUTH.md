# Email/Password Authentication Setup

## Overview
This application uses email/password authentication via NextAuth.js with a credentials provider. Google OAuth has been removed from the UI to focus on email/password authentication.

## Features

### ✅ Registration Flow
- **Endpoint**: `/api/auth/register`
- **Validation**:
  - Name, email, and password required
  - Email format validation
  - Password minimum 8 characters
  - Duplicate email check
- **Security**:
  - Passwords hashed with bcrypt (12 rounds)
  - Email normalized (lowercase, trimmed)
  - Default role: CUSTOMER
- **Auto-login**: After successful registration, user is automatically signed in

### ✅ Sign In Flow
- **Provider**: Credentials Provider (email/password)
- **Validation**:
  - Email format validation
  - Password required
- **Security**:
  - Email normalized before lookup
  - Password compared securely with bcrypt
  - Generic error messages (don't reveal if user exists)
- **Session**: JWT-based, 30-day expiration

### ✅ Error Handling
- User-friendly error messages
- Client-side validation before API calls
- Server-side validation for security
- Generic error messages to prevent user enumeration

## File Structure

```
src/
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── [...nextauth]/route.ts    # NextAuth API route
│   │       └── register/route.ts         # Registration endpoint
│   └── auth/
│       ├── signin/page.tsx               # Sign in page
│       └── signup/page.tsx                # Sign up page
├── lib/
│   ├── auth.ts                           # NextAuth configuration
│   └── auth-helpers.ts                   # Server-side auth utilities
└── types/
    └── next-auth.d.ts                    # TypeScript type definitions
```

## Configuration

### Required Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"  # Generate with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
```

### Optional (for future OAuth)
```bash
# Google OAuth (not used in UI, but can be enabled)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

## Usage

### Sign Up
1. Navigate to `/auth/signup`
2. Fill in:
   - Full Name
   - Email Address
   - Password (min 8 characters)
   - Confirm Password
3. Submit form
4. User is created and automatically signed in
5. Redirected to home page

### Sign In
1. Navigate to `/auth/signin`
2. Enter:
   - Email Address
   - Password
3. Submit form
4. On success: Redirected to home (or callback URL)
5. On error: Shows error message

### Protected Routes
- Admin routes (`/admin/*`) are protected by middleware
- Requires ADMIN role to access
- Unauthorized users redirected to `/auth/signin`

## Security Features

1. **Password Hashing**: bcrypt with 12 rounds
2. **Email Normalization**: Lowercase and trimmed
3. **Input Validation**: Client and server-side
4. **Error Messages**: Generic to prevent user enumeration
5. **Session Management**: JWT with 30-day expiration
6. **Role-Based Access**: User roles (CUSTOMER, ADMIN, MODERATOR)

## Testing

### Test Registration
```bash
# 1. Start dev server
npm run dev

# 2. Navigate to http://localhost:3000/auth/signup

# 3. Fill form and submit

# 4. Should redirect to home page
```

### Test Sign In
```bash
# 1. Navigate to http://localhost:3000/auth/signin

# 2. Enter credentials

# 3. Should redirect to home page
```

### Test Protected Routes
```bash
# 1. Try accessing http://localhost:3000/admin

# 2. Should redirect to sign in page

# 3. Sign in as ADMIN user

# 4. Should access admin routes
```

## Troubleshooting

### "Invalid email or password"
- Check email format
- Verify password is correct
- Ensure user exists in database
- Check database connection

### "User with this email already exists"
- Email is already registered
- Try signing in instead

### "Please provide both email and password"
- Both fields are required
- Check for whitespace issues

### Database Errors
- Ensure `DATABASE_URL` is set in `.env`
- Run migrations: `npm run db:push`
- Check database connection

## Next Steps

1. ✅ Email/password authentication working
2. ✅ Registration flow complete
3. ✅ Sign in flow complete
4. ✅ Error handling improved
5. ✅ Security best practices implemented
6. ⏭️ Optional: Add email verification
7. ⏭️ Optional: Add password reset flow
8. ⏭️ Optional: Add "Remember Me" functionality
