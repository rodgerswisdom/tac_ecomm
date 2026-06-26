-- The Zoho integration tables were previously only created via `prisma db push`
-- in some environments and never had a migration. Create them if missing so this
-- migration is safe on databases where the tables do not yet exist, then add the
-- new queue/error-tracking columns idempotently.

-- ZohoSyncLog
CREATE TABLE IF NOT EXISTS "ZohoSyncLog" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "zohoId" TEXT,
    "action" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 5,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "requestData" JSONB,
    "responseData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ZohoSyncLog_pkey" PRIMARY KEY ("id")
);

-- ZohoToken
CREATE TABLE IF NOT EXISTS "ZohoToken" (
    "id" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ZohoToken_pkey" PRIMARY KEY ("id")
);

-- ZohoSyncStats
CREATE TABLE IF NOT EXISTS "ZohoSyncStats" (
    "id" TEXT NOT NULL,
    "totalSynced" INTEGER NOT NULL DEFAULT 0,
    "totalFailed" INTEGER NOT NULL DEFAULT 0,
    "lastSyncAt" TIMESTAMP(3),
    "productsSynced" INTEGER NOT NULL DEFAULT 0,
    "ordersSynced" INTEGER NOT NULL DEFAULT 0,
    "paymentsSynced" INTEGER NOT NULL DEFAULT 0,
    "customersSynced" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ZohoSyncStats_pkey" PRIMARY KEY ("id")
);

-- Add queue scheduling and error tracking fields to ZohoSyncLog
ALTER TABLE "ZohoSyncLog" ADD COLUMN IF NOT EXISTS "maxRetries" INTEGER NOT NULL DEFAULT 5;
ALTER TABLE "ZohoSyncLog" ADD COLUMN IF NOT EXISTS "errorCode" TEXT;
ALTER TABLE "ZohoSyncLog" ADD COLUMN IF NOT EXISTS "scheduledFor" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Add success/failure timestamps to ZohoSyncStats
ALTER TABLE "ZohoSyncStats" ADD COLUMN IF NOT EXISTS "lastSuccessAt" TIMESTAMP(3);
ALTER TABLE "ZohoSyncStats" ADD COLUMN IF NOT EXISTS "lastFailureAt" TIMESTAMP(3);

-- Indexes
CREATE INDEX IF NOT EXISTS "ZohoSyncLog_entityType_entityId_idx" ON "ZohoSyncLog"("entityType", "entityId");
CREATE INDEX IF NOT EXISTS "ZohoSyncLog_status_priority_idx" ON "ZohoSyncLog"("status", "priority");
CREATE INDEX IF NOT EXISTS "ZohoSyncLog_status_scheduledFor_idx" ON "ZohoSyncLog"("status", "scheduledFor");
