-- DropIndex
DROP INDEX "CartItem_userId_productId_variantId_key";

-- AlterTable
ALTER TABLE "CartItem" ADD COLUMN "productImageId" TEXT;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN "productImageId" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN "selectedImageUrl" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN "selectedImageLabel" TEXT;

-- CreateIndex
CREATE INDEX "CartItem_productImageId_idx" ON "CartItem"("productImageId");
CREATE INDEX "OrderItem_productImageId_idx" ON "OrderItem"("productImageId");

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_userId_productId_variantId_productImageId_key" ON "CartItem"("userId", "productId", "variantId", "productImageId");

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_productImageId_fkey" FOREIGN KEY ("productImageId") REFERENCES "ProductImage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productImageId_fkey" FOREIGN KEY ("productImageId") REFERENCES "ProductImage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
