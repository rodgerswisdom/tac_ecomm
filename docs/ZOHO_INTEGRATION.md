# Zoho Books Integration Guide

Complete guide for the Zoho Books accounting software integration with the e-commerce platform.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Setup Instructions](#setup-instructions)
4. [Configuration](#configuration)
5. [How It Works](#how-it-works)
6. [Admin Dashboard](#admin-dashboard)
7. [API Reference](#api-reference)
8. [Troubleshooting](#troubleshooting)
9. [Monitoring](#monitoring)

---

## Overview

This integration synchronizes your e-commerce data with Zoho Books accounting software, providing:

- **Automatic sync** of products, customers, orders, invoices, and payments
- **Async-first architecture** to avoid Vercel serverless timeout issues
- **Priority-based queue** with automatic dependency resolution
- **Comprehensive monitoring** with health checks and alerts
- **Admin dashboard** for managing syncs and viewing logs

### Key Features

- ✅ OAuth 2.0 authentication with automatic token refresh
- ✅ Rate limiting (100 requests/minute) with exponential backoff
- ✅ Automatic retry logic (up to 3 attempts)
- ✅ Background processing via Vercel Cron jobs
- ✅ Real-time sync status tracking
- ✅ Detailed error logging and monitoring

---

## Architecture

### Async-First Design

All syncs are **queued** rather than executed immediately to prevent Vercel timeout issues:

```
User Action → Queue Sync → Background Job → Zoho API → Update Status
```

### Priority System

Entities sync in order based on dependencies:

1. **Products** (Priority 1) - Must sync first
2. **Customers** (Priority 2) - Needed for orders
3. **Orders** (Priority 3) - Needs products + customers
4. **Invoices** (Priority 4) - Needs orders
5. **Payments** (Priority 5) - Needs invoices

### Data Flow

```
E-commerce DB → Sync Queue → Zoho Books
     ↓              ↓              ↓
  Products      Priority       Items
  Customers     Sorting      Contacts
  Orders        Retry       Sales Orders
  Payments      Logic        Invoices
                            Payments
```

---

## Setup Instructions

### 1. Create Zoho Books Account

1. Go to [Zoho Books](https://www.zoho.com/books/)
2. Sign up for an account (Free plan available)
3. Note your **Data Center** (US, EU, IN, AU, etc.)

### 2. Create Zoho OAuth App

1. Go to [Zoho API Console](https://api-console.zoho.com/)
2. Click "Add Client" → "Server-based Applications"
3. Fill in details:
   - **Client Name**: Your App Name
   - **Homepage URL**: `https://yourdomain.com`
   - **Authorized Redirect URIs**: `https://yourdomain.com/api/zoho/callback`
4. Note down:
   - **Client ID**
   - **Client Secret**

### 3. Get Organization ID

1. Log into Zoho Books
2. Go to Settings → Organization Profile
3. Copy your **Organization ID**

### 4. Configure Environment Variables

Add to your `.env` file:

```bash
# Zoho Books Integration
ZOHO_CLIENT_ID=your_client_id_here
ZOHO_CLIENT_SECRET=your_client_secret_here
ZOHO_ORGANIZATION_ID=your_org_id_here
ZOHO_REDIRECT_URI=https://yourdomain.com/api/zoho/callback

# Data Center (US, EU, IN, AU, CN, JP)
ZOHO_DATA_CENTER=US

# Cron job security
CRON_SECRET=your_random_secret_here
```

### 5. Run Database Migration

```bash
npx prisma migrate deploy
```

This creates the necessary Zoho sync tables.

### 6. Deploy to Vercel

```bash
vercel --prod
```

Vercel will automatically set up the cron jobs.

### 7. Authenticate with Zoho

1. Go to `/admin/zoho` in your admin dashboard
2. Click "Authenticate with Zoho"
3. Log in and authorize the app
4. You'll be redirected back with a success message

---

## Configuration

### Data Center Endpoints

The integration uses **US Data Center** by default:

- **API Endpoint**: `https://www.zohoapis.com/books/v3`
- **Auth Endpoint**: `https://accounts.zoho.com`

For other data centers, update endpoints in `src/lib/zoho/client.ts`.

### Cron Job Schedules

Configured in `vercel.json`:

| Job | Schedule | Description |
|-----|----------|-------------|
| Sync Queue | Every 15 minutes | Processes pending syncs (batch of 10) |
| Stock Sync | Hourly | Updates stock levels from Zoho (50 products) |
| Health Monitor | Every 30 minutes | Checks system health and alerts |

### Rate Limiting

- **Limit**: 100 requests per minute
- **Strategy**: Request queue with automatic throttling
- **Retry**: Exponential backoff (5s, 10s, 20s)

---

## How It Works

### Automatic Sync Triggers

#### When Product is Published

```typescript
// Automatically queued for sync
await createProduct({ name: "New Product", ... })
// → Queued with priority 1
```

#### When Order is Confirmed

```typescript
// Customer and order queued
await confirmOrder(orderId)
// → Customer queued (priority 2)
// → Order queued (priority 3)
```

#### When Payment Completes

```typescript
// Invoice and payment queued
await completePayment(paymentId)
// → Invoice queued (priority 4)
// → Payment queued (priority 5)
```

### Manual Sync

Trigger manual sync from admin dashboard:

1. Go to `/admin/zoho`
2. Click "Trigger Manual Sync"
3. Check sync logs for progress

### Sync Status

Each entity has a sync status:

- **PENDING**: Waiting in queue
- **SYNCED**: Successfully synced to Zoho
- **FAILED**: Sync failed (will retry)
- **RETRYING**: Currently retrying

---

## Admin Dashboard

Access at `/admin/zoho`

### Main Dashboard

- **Connection Status**: OAuth token status and expiry
- **Statistics**: Synced, pending, failed, retrying counts
- **Charts**: Entity breakdown and recent activity
- **Quick Actions**: Manual sync, view logs, settings

### Sync Logs (`/admin/zoho/logs`)

- **Filters**: By status and entity type
- **Details**: Entity names, error messages, timestamps
- **Actions**: Retry failed syncs, delete logs
- **Pagination**: 20 logs per page

### Settings (`/admin/zoho/settings`)

- **Connection**: Re-authenticate, view token expiry
- **Configuration**: Cron schedules, retry logic
- **Data Center**: API endpoints
- **Priority Order**: Entity sync sequence

---

## API Reference

### Authentication

#### `GET /api/zoho/auth`

Initiates OAuth flow. Redirects to Zoho login.

#### `GET /api/zoho/callback?code=xxx`

OAuth callback. Exchanges code for access token.

**Response:**
```json
{
  "success": true,
  "message": "Successfully authenticated with Zoho Books"
}
```

### Sync Operations

#### `POST /api/zoho/sync`

Triggers manual sync of all pending items.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Sync triggered successfully"
}
```

#### `GET /api/zoho/status`

Get sync status and statistics.

**Response:**
```json
{
  "totalPending": 5,
  "totalSynced": 150,
  "totalFailed": 2,
  "byEntity": {
    "PRODUCT": { "synced": 50, "pending": 0, "failed": 0 },
    "CUSTOMER": { "synced": 30, "pending": 2, "failed": 1 }
  }
}
```

#### `POST /api/zoho/retry`

Retry failed sync(s).

**Body:**
```json
{
  "logId": "clx123...",  // Single retry
  "retryAll": true,      // Or retry all failed
  "entityType": "PRODUCT" // Optional filter
}
```

**Response:**
```json
{
  "success": true,
  "count": 5
}
```

### Monitoring

#### `GET /api/zoho/health`

Health check endpoint.

**Response (200 OK):**
```json
{
  "healthy": true,
  "checks": {
    "database": true,
    "zohoConnection": true,
    "queueProcessing": true,
    "recentErrors": true
  },
  "details": {
    "pendingCount": 5,
    "failedCount": 2,
    "retryingCount": 1,
    "recentErrorRate": 5.2
  },
  "alerts": []
}
```

**Response (503 Service Unavailable):**
```json
{
  "healthy": false,
  "checks": { ... },
  "alerts": [
    {
      "severity": "error",
      "title": "Zoho Connection Lost",
      "message": "OAuth token expired",
      "timestamp": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### `GET /api/zoho/metrics?timeRange=24h`

Get sync metrics.

**Query Parameters:**
- `timeRange`: `1h`, `24h`, or `7d`

**Response:**
```json
{
  "timeRange": "24h",
  "totalSyncs": 100,
  "successfulSyncs": 95,
  "failedSyncs": 5,
  "successRate": 95.0,
  "avgAttempts": 1.2,
  "byEntityType": {
    "PRODUCT": { "total": 50, "synced": 48, "failed": 2 },
    "CUSTOMER": { "total": 30, "synced": 30, "failed": 0 }
  }
}
```

---

## Troubleshooting

### Common Issues

#### 1. "Zoho Connection Lost"

**Cause**: OAuth token expired

**Solution**:
1. Go to `/admin/zoho`
2. Click "Authenticate with Zoho"
3. Complete OAuth flow

#### 2. "High Error Rate Detected"

**Cause**: Multiple sync failures

**Solution**:
1. Check `/admin/zoho/logs` for error details
2. Common causes:
   - Invalid Zoho credentials
   - Rate limit exceeded
   - Network issues
3. Retry failed syncs after fixing issue

#### 3. "Stale Pending Syncs"

**Cause**: Queue processing stuck

**Solution**:
1. Check Vercel cron job logs
2. Verify `CRON_SECRET` is set correctly
3. Manually trigger sync from dashboard

#### 4. "Product Not Synced" Error

**Cause**: Order trying to sync before product

**Solution**:
- System automatically handles this
- Product will sync first (priority 1)
- Order will sync after product completes

### Error Messages

| Error | Meaning | Action |
|-------|---------|--------|
| `INVALID_TOKEN` | OAuth token invalid | Re-authenticate |
| `RATE_LIMIT_EXCEEDED` | Too many requests | Wait and retry (automatic) |
| `ORGANIZATION_NOT_FOUND` | Wrong org ID | Check `ZOHO_ORGANIZATION_ID` |
| `ITEM_NOT_FOUND` | Product doesn't exist in Zoho | Sync product first |
| `CONTACT_NOT_FOUND` | Customer doesn't exist | Sync customer first |

### Debug Mode

Enable detailed logging:

```bash
# In Vercel dashboard
Add environment variable: DEBUG=zoho:*
```

View logs in Vercel dashboard under "Logs" tab.

---

## Monitoring

### Health Checks

Automatic health checks run every 30 minutes and validate:

- ✅ Database connectivity
- ✅ Zoho OAuth token status
- ✅ Queue processing (no stale syncs)
- ✅ Error rate (<20%)
- ✅ Failed sync count (<50)
- ✅ Pending queue size (<100)

### Alerts

Alert severity levels:

- **Critical**: Database connection failed
- **Error**: Zoho disconnected, excessive failures
- **Warning**: High error rate, stale syncs, large queue

### Metrics Dashboard

View real-time metrics at `/admin/zoho`:

- Success rate over time
- Entity-specific sync status
- Recent activity (7 days)
- Queue statistics

### Logs

All Zoho events are logged:

- **Console**: Captured by Vercel logs
- **Audit Log**: Critical events stored in database
- **Sync Logs**: Detailed per-entity sync history

---

## Best Practices

### 1. Monitor Regularly

- Check dashboard weekly
- Review failed syncs
- Monitor error rate trends

### 2. Handle Failures Promptly

- Investigate failed syncs within 24 hours
- Retry after fixing root cause
- Delete obsolete failed syncs

### 3. Keep Token Fresh

- OAuth token expires after 1 hour
- System auto-refreshes
- Re-authenticate if issues persist

### 4. Test Before Production

- Test with Zoho sandbox account
- Verify all entity types sync correctly
- Check invoice and payment recording

### 5. Backup Data

- Zoho Books has built-in backups
- Export data regularly
- Keep local database backups

---

## Support

### Resources

- [Zoho Books API Docs](https://www.zoho.com/books/api/v3/)
- [Zoho API Console](https://api-console.zoho.com/)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)

### Getting Help

1. Check this documentation
2. Review error logs in `/admin/zoho/logs`
3. Check Vercel deployment logs
4. Contact Zoho support for API issues

---

## Changelog

### Version 1.0.0 (2024)

- Initial release
- OAuth 2.0 authentication
- Async queue system
- Priority-based sync
- Admin dashboard
- Health monitoring
- Comprehensive error handling

---

**Last Updated**: 2024
**Integration Version**: 1.0.0
**Zoho Books API Version**: v3