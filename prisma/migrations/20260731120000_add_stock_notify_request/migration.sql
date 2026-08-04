-- CreateTable
CREATE TABLE "StockNotifyRequest" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notifiedAt" TIMESTAMP(3),

    CONSTRAINT "StockNotifyRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StockNotifyRequest_productId_notifiedAt_idx" ON "StockNotifyRequest"("productId", "notifiedAt");

-- CreateIndex
CREATE INDEX "StockNotifyRequest_email_idx" ON "StockNotifyRequest"("email");

-- CreateIndex
CREATE UNIQUE INDEX "StockNotifyRequest_productId_email_key" ON "StockNotifyRequest"("productId", "email");

-- AddForeignKey
ALTER TABLE "StockNotifyRequest" ADD CONSTRAINT "StockNotifyRequest_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
