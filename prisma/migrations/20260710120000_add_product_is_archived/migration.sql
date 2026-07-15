-- AlterTable
ALTER TABLE "Product" ADD COLUMN "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Product_isArchived_idx" ON "Product"("isArchived");

-- Archive existing out-of-stock published products
UPDATE "Product"
SET "isArchived" = true, "isActive" = false
WHERE stock <= 0 AND "isDraft" = false;
