-- AlterEnum
ALTER TYPE "ProductType" ADD VALUE IF NOT EXISTS 'TOY';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "isToy" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS "Product_isToy_idx" ON "Product"("isToy");

-- Dedicated Toys category for the /toys catalog
INSERT INTO "Category" ("id", "name", "slug", "description", "showOnHomepage", "homepageOrder", "createdAt", "updatedAt")
SELECT 'cmltoyscatalog00000000001', 'Toys', 'toys', 'Handcrafted toys and play pieces from African artisans.', false, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Category" WHERE "slug" = 'toys');
