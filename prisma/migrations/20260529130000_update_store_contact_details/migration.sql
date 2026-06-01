-- Update store contact defaults on existing settings row
UPDATE "Settings"
SET
  "supportEmail" = 'info@tacaccessories.co.ke',
  "salesEmail" = 'info@tacaccessories.co.ke',
  "whatsappNumber" = '254704800866'
WHERE
  "id" = 'singleton'
  AND (
    "supportEmail" IN ('support@tacaccessories.com', 'sales@tacaccessories.com')
    OR "salesEmail" IN ('support@tacaccessories.com', 'sales@tacaccessories.com')
    OR "whatsappNumber" = '254700000000'
  );

-- Align column defaults for new rows
ALTER TABLE "Settings" ALTER COLUMN "supportEmail" SET DEFAULT 'info@tacaccessories.co.ke';
ALTER TABLE "Settings" ALTER COLUMN "salesEmail" SET DEFAULT 'info@tacaccessories.co.ke';
ALTER TABLE "Settings" ALTER COLUMN "whatsappNumber" SET DEFAULT '254704800866';
