-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "userAgent" TEXT;

-- Align nullability with Prisma schema
ALTER TABLE "AuditLog" ALTER COLUMN "entity" DROP NOT NULL;
ALTER TABLE "AuditLog" ALTER COLUMN "entityId" DROP NOT NULL;
ALTER TABLE "AuditLog" ALTER COLUMN "adminId" DROP NOT NULL;
