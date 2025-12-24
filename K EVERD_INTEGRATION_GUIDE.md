# Complete Guide to Integrating Keverd Fraud Detection SDK

## Introduction

Fraud detection is a critical component of modern web applications, especially for e-commerce platforms, financial services, and any application handling sensitive transactions. [Keverd](https://app.keverd.com) provides a powerful, easy-to-integrate fraud detection SDK that uses device fingerprinting, behavioral biometrics, and risk assessment to protect your application from fraudulent activities.

This guide will walk you through integrating Keverd into your application, best practices for implementation, and tips to maximize its effectiveness.

---

## Table of Contents

1. [What is Keverd?](#what-is-keverd)
2. [Installation](#installation)
3. [Basic Integration](#basic-integration)
4. [Best Practices](#best-practices)
5. [Advanced Usage](#advanced-usage)
6. [Maximizing Keverd's Advantages](#maximizing-keverds-advantages)
7. [Common Pitfalls to Avoid](#common-pitfalls-to-avoid)
8. [Real-World Examples](#real-world-examples)
9. [Troubleshooting](#troubleshooting)

---

## What is Keverd?

Keverd is a comprehensive fraud detection platform that provides:

- **Device Fingerprinting**: Unique identification of devices and browsers
- **Behavioral Biometrics**: Analysis of user behavior patterns
- **Risk Scoring**: 0-100 risk score with actionable recommendations
- **SIM Swap Detection**: Protection against SIM swap attacks (mobile SDKs)
- **Real-time Assessment**: Instant fraud risk evaluation

The SDK works in any JavaScript environment (browser, Node.js, React, Vue, Next.js, etc.) and provides a simple API for integration.

---

## Installation

### npm/yarn/pnpm

```bash
npm install @keverdjs/fraud-sdk
# or
yarn add @keverdjs/fraud-sdk
# or
pnpm add @keverdjs/fraud-sdk
```

### Get Your API Key

1. Sign up at [Keverd](https://app.keverd.com)
2. Navigate to your dashboard
3. Generate an API key
4. Store it securely in your environment variables

---

## Basic Integration

### Step 1: Initialize the SDK

The SDK should be initialized once when your application loads. For best results, initialize it as early as possible to start collecting device fingerprinting data.

#### React/Next.js Example

```typescript
// src/lib/fraud.ts
import { Keverd } from '@keverdjs/fraud-sdk'

let isInitialized = false

export function initializeFraudDetection(userId?: string): void {
  if (typeof window === 'undefined') return // Server-side check
  
  if (isInitialized) return
  
  const apiKey = process.env.NEXT_PUBLIC_KEVERD_API_KEY
  
  if (!apiKey) {
    console.warn('Keverd API key not found')
    return
  }
  
  Keverd.init({
    apiKey,
    endpoint: process.env.NEXT_PUBLIC_KEVERD_ENDPOINT || 'https://app.keverd.com',
    userId, // Optional: user ID for better tracking
    debug: process.env.NODE_ENV === 'development'
  })
  
  isInitialized = true
}
```

#### Global Initialization (Recommended)

For React/Next.js applications, create a provider component:

```typescript
// src/components/FraudDetectionProvider.tsx
'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { initializeFraudDetection } from '@/lib/fraud'

export function FraudDetectionProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  
  useEffect(() => {
    // Initialize with user ID if available
    const userId = session?.user?.id || session?.user?.email
    initializeFraudDetection(userId)
  }, [session])
  
  return <>{children}</>
}
```

Add to your root layout:

```typescript
// app/layout.tsx
import { FraudDetectionProvider } from '@/components/FraudDetectionProvider'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <FraudDetectionProvider>
          {children}
        </FraudDetectionProvider>
      </body>
    </html>
  )
}
```

### Step 2: Check Fraud Risk

Perform fraud checks before sensitive operations (checkout, login, account changes, etc.):

```typescript
import { Keverd } from '@keverdjs/fraud-sdk'

async function processCheckout() {
  // Get visitor data and risk assessment
  const result = await Keverd.getVisitorData()
  
  console.log('Risk Score:', result.risk_score) // 0-100
  console.log('Action:', result.action) // 'allow' | 'soft_challenge' | 'hard_challenge' | 'block'
  console.log('Reasons:', result.reason) // Array of risk factors
  console.log('Session ID:', result.session_id) // For tracking
  
  // Handle based on risk level
  switch (result.action) {
    case 'allow':
      // Proceed with transaction
      break
    case 'soft_challenge':
      // Show additional verification (e.g., email confirmation)
      break
    case 'hard_challenge':
      // Require stronger verification (e.g., 2FA)
      break
    case 'block':
      // Block the transaction
      break
  }
}
```

### Step 3: Handle Risk Responses

Create a utility function to standardize risk handling:

```typescript
interface FraudCheckResult {
  risk_score: number
  score: number
  action: 'allow' | 'soft_challenge' | 'hard_challenge' | 'block'
  reason: string[]
  session_id: string
  requestId: string
}

function shouldAllowTransaction(result: FraudCheckResult | null): {
  allowed: boolean
  requiresChallenge: boolean
  message?: string
} {
  if (!result) {
    // Fail-open: allow if check fails
    return { allowed: true, requiresChallenge: false }
  }
  
  switch (result.action) {
    case 'allow':
      return { allowed: true, requiresChallenge: false }
    
    case 'soft_challenge':
      return {
        allowed: true,
        requiresChallenge: true,
        message: 'Please verify your identity to continue.'
      }
    
    case 'hard_challenge':
      return {
        allowed: true,
        requiresChallenge: true,
        message: 'Additional verification required for security.'
      }
    
    case 'block':
      return {
        allowed: false,
        requiresChallenge: false,
        message: 'Transaction blocked due to security concerns.'
      }
    
    default:
      return { allowed: true, requiresChallenge: false }
  }
}
```

---

## Best Practices

### 1. **Initialize Early**

Initialize Keverd as early as possible in your application lifecycle. This allows the SDK to collect more device fingerprinting data, improving accuracy.

✅ **Good**: Initialize in root layout/provider  
❌ **Bad**: Initialize only when checkout starts

### 2. **Use User IDs When Available**

Pass user IDs to Keverd for better tracking across sessions:

```typescript
// When user logs in
Keverd.init({
  apiKey: 'your-key',
  userId: user.id // or user.email
})
```

### 3. **Check at Critical Points**

Perform fraud checks at these critical points:

- **Checkout/Payment Processing**: Before processing any payment
- **Account Creation**: Detect fake accounts
- **Login Attempts**: Identify suspicious login patterns
- **Password Changes**: Prevent account takeovers
- **High-Value Transactions**: Extra protection for large amounts
- **Sensitive Actions**: Email changes, 2FA setup, etc.

### 4. **Implement Fail-Open Strategy**

If fraud detection fails (network error, API down), allow the transaction but log it:

```typescript
try {
  const result = await Keverd.getVisitorData()
  // Process result
} catch (error) {
  // Log error but allow transaction
  console.error('Fraud check failed:', error)
  // Proceed with caution or show warning
}
```

### 5. **Store Session IDs**

Store Keverd session IDs with your transactions for audit trails:

```typescript
const result = await Keverd.getVisitorData()

// Store with order/transaction
await createOrder({
  // ... order data
  fraudSessionId: result.session_id,
  fraudRequestId: result.requestId,
  fraudRiskScore: result.risk_score
})
```

### 6. **Create Transaction IDs for Tracking**

Use `createTransactionID` for better transaction tracking:

```typescript
const transactionId = await Keverd.createTransactionID({
  amount: 1000,
  currency: 'USD',
  recipient: 'user@example.com'
})

// Use this ID to track the transaction
```

### 7. **Handle Different Risk Levels Appropriately**

```typescript
const result = await Keverd.getVisitorData()

if (result.action === 'allow') {
  // Normal flow
  processPayment()
} else if (result.action === 'soft_challenge') {
  // Show email verification or CAPTCHA
  showEmailVerification()
} else if (result.action === 'hard_challenge') {
  // Require 2FA or phone verification
  require2FA()
} else if (result.action === 'block') {
  // Block and show support contact
  showBlockedMessage()
  logSuspiciousActivity(result)
}
```

### 8. **Clean Up on Unmount**

For single-page applications, clean up when needed:

```typescript
useEffect(() => {
  initializeFraudDetection()
  
  return () => {
    Keverd.destroy() // Clean up on unmount
  }
}, [])
```

---

## Advanced Usage

### Custom Endpoints

Use custom endpoints for enterprise setups:

```typescript
Keverd.init({
  apiKey: 'your-key',
  endpoint: 'https://your-custom-endpoint.com'
})
```

### Debug Mode

Enable debug logging in development:

```typescript
Keverd.init({
  apiKey: 'your-key',
  debug: process.env.NODE_ENV === 'development'
})
```

### Integration with Payment Processors

Combine Keverd with payment processors for comprehensive protection:

```typescript
async function processPayment(amount: number, paymentMethod: string) {
  // 1. Check fraud risk
  const fraudResult = await Keverd.getVisitorData()
  
  if (fraudResult.action === 'block') {
    throw new Error('Transaction blocked by fraud detection')
  }
  
  // 2. Create transaction ID
  const transactionId = await Keverd.createTransactionID({
    amount,
    currency: 'USD'
  })
  
  // 3. Process payment
  const paymentResult = await processPaymentWithProcessor({
    amount,
    method: paymentMethod,
    metadata: {
      keverdSessionId: fraudResult.session_id,
      keverdTransactionId: transactionId,
      keverdRiskScore: fraudResult.risk_score
    }
  })
  
  // 4. Log for audit
  await logTransaction({
    paymentId: paymentResult.id,
    keverdSessionId: fraudResult.session_id,
    riskScore: fraudResult.risk_score,
    action: fraudResult.action
  })
  
  return paymentResult
}
```

### Rate Limiting Integration

Combine with rate limiting for additional protection:

```typescript
async function handleLogin(email: string, password: string) {
  // Check fraud risk
  const fraudResult = await Keverd.getVisitorData()
  
  // Adjust rate limiting based on risk
  const rateLimit = fraudResult.risk_score > 70 
    ? 3  // Lower limit for high risk
    : 10 // Normal limit
  
  // Check rate limit
  if (await isRateLimited(email, rateLimit)) {
    throw new Error('Too many attempts')
  }
  
  // Proceed with login
  return await authenticateUser(email, password)
}
```

---

## Maximizing Keverd's Advantages

### 1. **Early Initialization = Better Fingerprinting**

The longer Keverd runs, the more data it collects. Initialize immediately on page load:

```typescript
// ✅ Best: Initialize in root component
useEffect(() => {
  initializeFraudDetection()
}, []) // Empty deps = run once on mount
```

### 2. **Pass Contextual Information**

Use transaction metadata to provide context:

```typescript
const transactionId = await Keverd.createTransactionID({
  amount: order.total,
  currency: order.currency,
  recipient: order.customerEmail
})
```

### 3. **Combine with Other Security Measures**

Keverd works best when combined with:

- **Rate Limiting**: Prevent brute force attacks
- **CAPTCHA**: Additional verification for high-risk users
- **2FA**: Required for high-risk transactions
- **Email Verification**: Confirm user identity
- **IP Blocking**: Block known malicious IPs
- **Device Tracking**: Track devices across sessions

### 4. **Monitor and Adjust Thresholds**

Regularly review fraud detection results:

```typescript
// Log all fraud checks for analysis
async function logFraudCheck(result: FraudCheckResult, context: string) {
  await analytics.track('fraud_check', {
    risk_score: result.risk_score,
    action: result.action,
    reasons: result.reason,
    context, // 'checkout', 'login', etc.
    timestamp: new Date().toISOString()
  })
}
```

### 5. **Use Risk Scores for Dynamic Behavior**

Adjust user experience based on risk scores:

```typescript
const result = await Keverd.getVisitorData()

if (result.risk_score < 25) {
  // Low risk: Fast checkout, no extra steps
  enableExpressCheckout()
} else if (result.risk_score < 50) {
  // Medium risk: Standard checkout
  enableStandardCheckout()
} else if (result.risk_score < 75) {
  // High risk: Additional verification
  requireEmailVerification()
  requirePhoneVerification()
} else {
  // Very high risk: Manual review
  flagForManualReview()
  requireAdminApproval()
}
```

### 6. **Leverage Session IDs for Analytics**

Track user journeys using session IDs:

```typescript
// Store session ID early
const result = await Keverd.getVisitorData()
setSessionId(result.session_id)

// Use throughout user journey
trackEvent('page_view', { sessionId: result.session_id })
trackEvent('add_to_cart', { sessionId: result.session_id })
trackEvent('checkout_start', { sessionId: result.session_id })
```

### 7. **Implement Progressive Challenges**

Start with soft challenges and escalate:

```typescript
async function handleHighRiskTransaction(result: FraudCheckResult) {
  if (result.action === 'soft_challenge') {
    // First: Email verification
    await sendVerificationEmail()
    await waitForEmailVerification()
    
    // Re-check after email verification
    const recheck = await Keverd.getVisitorData()
    
    if (recheck.action === 'hard_challenge') {
      // Escalate: Phone verification
      await sendVerificationSMS()
      await waitForSMSVerification()
    }
  }
}
```

### 8. **A/B Testing Fraud Rules**

Test different fraud handling strategies:

```typescript
const result = await Keverd.getVisitorData()

// A/B test: Different handling for same risk score
const variant = getABTestVariant('fraud_handling')

if (variant === 'strict' && result.risk_score > 40) {
  require2FA()
} else if (variant === 'lenient' && result.risk_score > 70) {
  require2FA()
}
```

### 9. **Geographic Risk Adjustment**

Combine with geographic data:

```typescript
const result = await Keverd.getVisitorData()
const userCountry = getUserCountry()

// Adjust risk based on geography
let adjustedRisk = result.risk_score

if (userCountry === 'high_risk_country') {
  adjustedRisk += 20
} else if (userCountry === 'low_risk_country') {
  adjustedRisk -= 10
}

if (adjustedRisk > 70) {
  requireAdditionalVerification()
}
```

### 10. **Real-time Monitoring Dashboard**

Create a dashboard to monitor fraud patterns:

```typescript
// Track fraud metrics
interface FraudMetrics {
  totalChecks: number
  blocked: number
  challenged: number
  allowed: number
  averageRiskScore: number
}

async function updateFraudDashboard(result: FraudCheckResult) {
  await updateMetrics({
    action: result.action,
    riskScore: result.risk_score,
    timestamp: new Date()
  })
}
```

---

## Common Pitfalls to Avoid

### ❌ **Initializing Too Late**

```typescript
// ❌ Bad: Initialize only when needed
async function checkout() {
  Keverd.init('key') // Too late!
  const result = await Keverd.getVisitorData()
}

// ✅ Good: Initialize early
useEffect(() => {
  Keverd.init('key') // On app load
}, [])
```

### ❌ **Not Handling Errors**

```typescript
// ❌ Bad: No error handling
const result = await Keverd.getVisitorData()
if (result.action === 'block') {
  // Block user
}

// ✅ Good: Handle errors gracefully
try {
  const result = await Keverd.getVisitorData()
  // Process result
} catch (error) {
  // Log and allow (fail-open)
  console.error('Fraud check failed:', error)
  // Proceed with caution
}
```

### ❌ **Ignoring Session IDs**

```typescript
// ❌ Bad: Not storing session IDs
const result = await Keverd.getVisitorData()
processOrder() // Lost audit trail

// ✅ Good: Store for audit
const result = await Keverd.getVisitorData()
await createOrder({
  // ... order data
  fraudSessionId: result.session_id
})
```

### ❌ **Blocking All High-Risk Users**

```typescript
// ❌ Bad: Too aggressive
if (result.risk_score > 50) {
  blockUser() // Loses legitimate customers
}

// ✅ Good: Progressive challenges
if (result.risk_score > 50) {
  requireVerification() // Give users a chance
}
```

### ❌ **Not Using User IDs**

```typescript
// ❌ Bad: Anonymous tracking
Keverd.init({ apiKey: 'key' })

// ✅ Good: User-specific tracking
Keverd.init({
  apiKey: 'key',
  userId: user.id
})
```

---

## Real-World Examples

### E-Commerce Checkout

```typescript
async function handleCheckout(orderData: OrderData) {
  // 1. Fraud check
  const fraudResult = await Keverd.getVisitorData()
  
  // 2. Handle based on risk
  if (fraudResult.action === 'block') {
    return {
      success: false,
      error: 'Transaction blocked for security reasons',
      supportContact: 'support@example.com'
    }
  }
  
  // 3. Create transaction ID
  const transactionId = await Keverd.createTransactionID({
    amount: orderData.total,
    currency: orderData.currency
  })
  
  // 4. Process payment
  const payment = await processPayment({
    ...orderData,
    metadata: {
      keverdSessionId: fraudResult.session_id,
      keverdTransactionId: transactionId
    }
  })
  
  // 5. Create order
  const order = await createOrder({
    ...orderData,
    paymentId: payment.id,
    fraudSessionId: fraudResult.session_id,
    fraudRiskScore: fraudResult.risk_score
  })
  
  return { success: true, order }
}
```

### Login Protection

```typescript
async function handleLogin(email: string, password: string) {
  // Check fraud risk before authentication
  const fraudResult = await Keverd.getVisitorData()
  
  // Adjust behavior based on risk
  if (fraudResult.action === 'block') {
    // Log suspicious activity
    await logSuspiciousActivity({
      email,
      reason: 'Blocked by fraud detection',
      riskScore: fraudResult.risk_score
    })
    
    throw new Error('Login blocked for security reasons')
  }
  
  // Authenticate user
  const user = await authenticateUser(email, password)
  
  if (!user) {
    return { success: false, error: 'Invalid credentials' }
  }
  
  // If high risk, require additional verification
  if (fraudResult.action === 'hard_challenge') {
    await send2FACode(user.id)
    return {
      success: true,
      requires2FA: true,
      userId: user.id
    }
  }
  
  return { success: true, user }
}
```

### Account Creation

```typescript
async function createAccount(userData: UserData) {
  // Check fraud risk for new accounts
  const fraudResult = await Keverd.getVisitorData()
  
  // High risk new accounts might be fake
  if (fraudResult.risk_score > 70) {
    // Require email and phone verification
    await sendVerificationEmail(userData.email)
    await sendVerificationSMS(userData.phone)
    
    return {
      success: true,
      requiresVerification: true,
      accountId: await createPendingAccount(userData)
    }
  }
  
  // Low risk: Create account immediately
  const account = await createAccount(userData)
  
  // Initialize Keverd with new user ID
  Keverd.init({
    apiKey: process.env.KEVERD_API_KEY,
    userId: account.id
  })
  
  return { success: true, account }
}
```

---

## Troubleshooting

### SDK Not Initializing

**Problem**: SDK doesn't initialize

**Solutions**:
- Check API key is correct
- Ensure API key is in environment variables
- Check browser console for errors
- Verify endpoint URL is correct

### Risk Scores Always Low/High

**Problem**: Risk scores don't seem accurate

**Solutions**:
- Ensure SDK initializes early (on page load)
- Pass user IDs when available
- Allow time for device fingerprinting to collect data
- Check if debug mode shows any warnings

### Network Errors

**Problem**: `getVisitorData()` fails with network errors

**Solutions**:
- Implement retry logic
- Use fail-open strategy (allow on error)
- Check network connectivity
- Verify endpoint is accessible

### False Positives

**Problem**: Legitimate users being blocked

**Solutions**:
- Review risk thresholds
- Use soft challenges instead of blocking
- Implement appeal process
- Monitor and adjust rules based on data

---

## Conclusion

Keverd provides powerful fraud detection capabilities that can significantly improve your application's security. By following this guide:

1. ✅ Initialize early for better fingerprinting
2. ✅ Check fraud at critical points
3. ✅ Handle different risk levels appropriately
4. ✅ Store session IDs for audit trails
5. ✅ Combine with other security measures
6. ✅ Monitor and adjust based on data

You'll maximize Keverd's effectiveness while maintaining a good user experience. Remember: fraud detection should protect users without creating friction for legitimate customers.

---

## Additional Resources

- [Keverd Documentation](https://github.com/keverd/keverd-fraud-sdk-web)
- [Keverd Dashboard](https://app.keverd.com)
- [npm Package](https://www.npmjs.com/package/@keverdjs/fraud-sdk)

---

**Author**: Integration Guide  
**Last Updated**: 2024  
**Version**: 1.0.0

