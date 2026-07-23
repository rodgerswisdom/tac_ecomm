-- Move products from child categories to their parent category
UPDATE "Product" p
SET "categoryId" = c."parentId"
FROM "Category" c
WHERE p."categoryId" = c.id
  AND c."parentId" IS NOT NULL;

-- Remove product subcategory labels
ALTER TABLE "Product" DROP COLUMN IF EXISTS "subcategory";

-- Remove child categories (products already reassigned)
DELETE FROM "Category" WHERE "parentId" IS NOT NULL;

-- Drop category hierarchy
ALTER TABLE "Category" DROP CONSTRAINT IF EXISTS "Category_parentId_fkey";
ALTER TABLE "Category" DROP COLUMN IF EXISTS "parentId";
