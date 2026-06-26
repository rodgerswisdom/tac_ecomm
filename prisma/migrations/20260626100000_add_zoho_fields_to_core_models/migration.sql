-- Add Zoho Books sync fields to User, Product, Order, and Payment tables.
-- These were defined in schema.prisma but never added via a migration.
-- Using IF NOT EXISTS everywhere so the migration is safe to re-run.

-- ── User ──────────────────────────────────────────────────────────────────────
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "zohoContactId"  TEXT,
  ADD COLUMN IF NOT EXISTS "zohoSyncStatus" TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS "lastSyncedAt"   TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "syncError"      TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "User_zohoContactId_key" ON "User"("zohoContactId");

-- ── Product ───────────────────────────────────────────────────────────────────
ALTER TABLE "Product"
  ADD COLUMN IF NOT EXISTS "zohoItemId"     TEXT,
  ADD COLUMN IF NOT EXISTS "zohoSyncStatus" TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS "lastSyncedAt"   TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "syncError"      TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "Product_zohoItemId_key"      ON "Product"("zohoItemId");
CREATE INDEX        IF NOT EXISTS "Product_zohoSyncStatus_idx"  ON "Product"("zohoSyncStatus");

-- ── Order ─────────────────────────────────────────────────────────────────────
ALTER TABLE "Order"
  ADD COLUMN IF NOT EXISTS "zohoSalesOrderId" TEXT,
  ADD COLUMN IF NOT EXISTS "zohoInvoiceId"    TEXT,
  ADD COLUMN IF NOT EXISTS "zohoSyncStatus"   TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS "lastSyncedAt"     TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "syncError"        TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "Order_zohoSalesOrderId_key" ON "Order"("zohoSalesOrderId");
CREATE UNIQUE INDEX IF NOT EXISTS "Order_zohoInvoiceId_key"    ON "Order"("zohoInvoiceId");
CREATE INDEX        IF NOT EXISTS "Order_zohoSyncStatus_idx"   ON "Order"("zohoSyncStatus");

-- ── Payment ───────────────────────────────────────────────────────────────────
ALTER TABLE "Payment"
  ADD COLUMN IF NOT EXISTS "zohoPaymentId"  TEXT,
  ADD COLUMN IF NOT EXISTS "zohoSyncStatus" TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS "lastSyncedAt"   TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "syncError"      TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "Payment_zohoPaymentId_key"   ON "Payment"("zohoPaymentId");
CREATE INDEX        IF NOT EXISTS "Payment_zohoSyncStatus_idx"  ON "Payment"("zohoSyncStatus");
