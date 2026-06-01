-- One-time data migration: USD → KSH base currency
-- Run this directly via psql or prisma db execute
-- BACK UP YOUR DATABASE FIRST

BEGIN;

DO $$
BEGIN
    -- Product prices
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Product') THEN
        UPDATE "Product" SET price = ROUND(price * 130)::int;
        UPDATE "Product" SET "comparePrice" = ROUND("comparePrice" * 130)::int WHERE "comparePrice" IS NOT NULL;
        RAISE NOTICE 'Product prices updated';
    END IF;

    -- Product variant prices
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ProductVariant') THEN
        UPDATE "ProductVariant" SET price = ROUND(price * 130)::int WHERE price IS NOT NULL;
        RAISE NOTICE 'ProductVariant prices updated';
    END IF;

    -- Order amounts + currency label
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Order') THEN
        UPDATE "Order" SET subtotal = ROUND(subtotal * 130)::int, tax = ROUND(tax * 130)::int, shipping = ROUND(shipping * 130)::int, total = ROUND(total * 130)::int;
        UPDATE "Order" SET currency = 'KSH' WHERE currency = 'USD';
        RAISE NOTICE 'Order amounts updated';
    END IF;

    -- Order item prices
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'OrderItem') THEN
        UPDATE "OrderItem" SET price = ROUND(price * 130)::int;
        RAISE NOTICE 'OrderItem prices updated';
    END IF;

    -- Payment amounts (only old USD records)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Payment') THEN
        UPDATE "Payment" SET amount = ROUND(amount * 130)::int WHERE currency = 'USD';
        UPDATE "Payment" SET currency = 'KSH' WHERE currency = 'USD';
        RAISE NOTICE 'Payment records updated';
    END IF;

    -- Coupons
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Coupon') THEN
        UPDATE "Coupon" SET value = ROUND(value * 130)::int;
        UPDATE "Coupon" SET "minAmount" = ROUND("minAmount" * 130)::int WHERE "minAmount" IS NOT NULL;
        RAISE NOTICE 'Coupon values updated';
    END IF;

    -- Settings (base shipping fee)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Settings') THEN
        UPDATE "Settings" SET "baseShippingFee" = ROUND("baseShippingFee" * 130)::int;
        RAISE NOTICE 'Settings updated';
    ELSE
        RAISE WARNING 'Settings table not found — skipping. You may need to run prisma db push first.';
    END IF;

    -- Bespoke requests
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'BespokeRequest') THEN
        UPDATE "BespokeRequest" SET "expressPremium" = ROUND("expressPremium" * 130)::int;
        RAISE NOTICE 'BespokeRequest updated';
    END IF;

END $$;

COMMIT;
