ALTER TABLE "Product"
ADD CONSTRAINT "Product_stock_nonnegative" CHECK ("stock" >= 0) NOT VALID;
ALTER TABLE "ProductVariant"
ADD CONSTRAINT "ProductVariant_stock_nonnegative" CHECK ("stock" >= 0) NOT VALID;
ALTER TABLE "Product" VALIDATE CONSTRAINT "Product_stock_nonnegative";
ALTER TABLE "ProductVariant" VALIDATE CONSTRAINT "ProductVariant_stock_nonnegative";