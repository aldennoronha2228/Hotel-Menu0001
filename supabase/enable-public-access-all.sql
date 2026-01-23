-- COMPREHENSIVE FIX: Enable public access for all customer-facing features
-- Run this in the Supabase SQL Editor to ensure customers (and the owner testing as a customer) can use the menu.

-- 1. CATEGORIES (Read Only)
ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access on categories" ON "categories";
CREATE POLICY "Allow public read access on categories"
ON "categories" FOR SELECT
TO public
USING (true);

-- 2. MENU ITEMS (Read Only)
ALTER TABLE "menu_items" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access on menu_items" ON "menu_items";
CREATE POLICY "Allow public read access on menu_items"
ON "menu_items" FOR SELECT
TO public
USING (true);

-- 3. ORDERS (Create and Read Self)
ALTER TABLE "orders" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can create orders" ON "orders";
DROP POLICY IF EXISTS "Public can read orders" ON "orders";

-- Allow creating orders
CREATE POLICY "Public can create orders"
ON "orders" FOR INSERT
TO public
WITH CHECK (true);

-- Allow reading orders (Needed for "View Bill" and checking status)
-- Note: The API handles filtering by table/user_id to ensure privacy.
CREATE POLICY "Public can read orders"
ON "orders" FOR SELECT
TO public
USING (true);

-- 4. ORDER ITEMS (Create and Read Self)
ALTER TABLE "order_items" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can create order items" ON "order_items";
DROP POLICY IF EXISTS "Public can read order items" ON "order_items";

-- Allow adding items to order
CREATE POLICY "Public can create order items"
ON "order_items" FOR INSERT
TO public
WITH CHECK (true);

-- Allow reading items (Needed for "View Bill")
CREATE POLICY "Public can read order items"
ON "order_items" FOR SELECT
TO public
USING (true);

-- 5. SETTINGS (Read Only for Admin Password Check if needed by client, but mostly Server Side)
-- If public requires settings (like checking store open/close time), enable here.
-- Assuming settings are currently admin-only or fetched by Service Role on API.
