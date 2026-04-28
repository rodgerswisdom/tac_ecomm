-- Migration: Switch base currency from USD to KSH
-- BACK UP YOUR DATABASE BEFORE RUNNING THIS MIGRATION.

BEGIN;

UPDATE "Product" SET price = ROUND(price * 130)::int, "comparePrice" = ROUND("comparePrice" * 130)::int WHERE "comparePrice" IS NOT NULL;
UPDATE "Product" SET price = ROUND(price * 130)::int WHERE "comparePrice" IS NULL;
UPDATE "ProductVariant" SET price = ROUND(price * 130)::int WHERE price IS NOT NULL;
UPDATE "Order" SET subtotal = ROUND(subtotal * 130)::int, tax = ROUND(tax * 130)::int, shipping = ROUND(shipping * 130)::int, total = ROUND(total * 130)::int;
UPDATE "Order" SET currency = 'KSH' WHERE currency = 'USD';
UPDATE "OrderItem" SET price = ROUND(price * 130)::int;
UPDATE "Payment" SET amount = ROUND(amount * 130)::int WHERE currency = 'USD';
UPDATE "Payment" SET currency = 'KSH' WHERE currency = 'USD';
UPDATE "Coupon" SET value = ROUND(value * 130)::int, "minAmount" = ROUND("minAmount" * 130)::int WHERE "minAmount" IS NOT NULL;
UPDATE "Coupon" SET value = ROUND(value * 130)::int WHERE "minAmount" IS NULL;
UPDATE "Settings" SET "baseShippingFee" = ROUND("baseShippingFee" * 130)::int;
UPDATE "BespokeRequest" SET "expressPremium" = ROUND("expressPremium" * 130)::int;

COMMIT;
