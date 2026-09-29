-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'EXPIRED';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "couponCode" TEXT;
ALTER TABLE "Order" ADD COLUMN "couponDiscount" DOUBLE PRECISION;
ALTER TABLE "Order" ADD COLUMN "paymentExpiresAt" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN "paidAt" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN "stockReserved" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Order" ADD COLUMN "paymentAttempt" INTEGER NOT NULL DEFAULT 1;

CREATE INDEX "Order_paymentExpiresAt_status_paymentStatus_idx" ON "Order"("paymentExpiresAt", "status", "paymentStatus");

-- Deduplicate Payment.transactionId before unique index (keep newest)
DELETE FROM "Payment" a
USING "Payment" b
WHERE a."transactionId" IS NOT NULL
  AND a."transactionId" = b."transactionId"
  AND a."createdAt" < b."createdAt";

CREATE UNIQUE INDEX "Payment_transactionId_key" ON "Payment"("transactionId");

CREATE TABLE "FulfillmentJob" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "FulfillmentJob_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "FulfillmentJob_orderId_type_key" ON "FulfillmentJob"("orderId", "type");
CREATE INDEX "FulfillmentJob_status_type_idx" ON "FulfillmentJob"("status", "type");
