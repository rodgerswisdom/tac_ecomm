-- AlterTable
ALTER TABLE "Settings" ADD COLUMN "offerTitle" TEXT;
ALTER TABLE "Settings" ADD COLUMN "offerHeadline" TEXT;
ALTER TABLE "Settings" ADD COLUMN "offerDescription" TEXT;
ALTER TABLE "Settings" ADD COLUMN "offerImage" TEXT;
ALTER TABLE "Settings" ADD COLUMN "offerCtaLabel" TEXT;
ALTER TABLE "Settings" ADD COLUMN "offerCtaHref" TEXT;
ALTER TABLE "Settings" ADD COLUMN "offerIsActive" BOOLEAN NOT NULL DEFAULT false;
