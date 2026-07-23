-- Snapshot product details on order line items for history after product deletion
ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "productName" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "productSku" TEXT;

UPDATE "OrderItem" oi
SET
  "productName" = p.name,
  "productSku" = p.sku
FROM "Product" p
WHERE oi."productId" = p.id
  AND (oi."productName" IS NULL OR oi."productSku" IS NULL);

-- Allow product deletion while preserving order line items
ALTER TABLE "OrderItem" DROP CONSTRAINT IF EXISTS "OrderItem_productId_fkey";
ALTER TABLE "OrderItem" ALTER COLUMN "productId" DROP NOT NULL;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
