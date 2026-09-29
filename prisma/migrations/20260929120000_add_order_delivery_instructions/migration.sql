-- AlterTable
-- IF NOT EXISTS keeps this safe to re-run against the shared database.
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "deliveryInstructions" TEXT;
