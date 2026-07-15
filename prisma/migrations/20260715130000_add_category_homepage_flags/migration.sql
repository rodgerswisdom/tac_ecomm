-- AlterTable
ALTER TABLE "Category" ADD COLUMN "showOnHomepage" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Category" ADD COLUMN "homepageOrder" INTEGER NOT NULL DEFAULT 0;

-- Default the six main taxonomy categories to appear on the homepage
UPDATE "Category"
SET
  "showOnHomepage" = true,
  "homepageOrder" = CASE slug
    WHEN 'african-arts' THEN 0
    WHEN 'bracelets-bangles' THEN 1
    WHEN 'earrings' THEN 2
    WHEN 'necklaces-chains' THEN 3
    WHEN 'arm-bands' THEN 4
    WHEN 'accessories' THEN 5
    ELSE 0
  END
WHERE
  "parentId" IS NULL
  AND slug IN (
    'african-arts',
    'bracelets-bangles',
    'earrings',
    'necklaces-chains',
    'arm-bands',
    'accessories'
  );
