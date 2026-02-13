-- ============================================================================
-- SECURE RLS POLICIES FOR HOTEL-MENU0001
-- ============================================================================
-- This script implements time-scoped Row Level Security policies to prevent
-- unauthorized access to sensitive order data while maintaining customer
-- functionality.
--
-- IMPORTANT: Test thoroughly in a staging environment before production use.
-- ============================================================================

-- ============================================================================
-- 1. CATEGORIES (Public Read-Only)
-- ============================================================================
-- Categories are menu organizational units and should be publicly readable
-- but only modifiable by service role (admin).

ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access on categories" ON "categories";

CREATE POLICY "Allow public read access on categories"
ON "categories" FOR SELECT
TO public
USING (true);

-- ============================================================================
-- 2. MENU ITEMS (Public Read-Only)
-- ============================================================================
-- Menu items should be publicly readable so customers can browse the menu,
-- but only modifiable by service role (admin).

ALTER TABLE "menu_items" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access on menu_items" ON "menu_items";

CREATE POLICY "Allow public read access on menu_items"
ON "menu_items" FOR SELECT
TO public
USING (true);

-- ============================================================================
-- 3. ORDERS (Time-Scoped Public Access)
-- ============================================================================
-- Orders should be:
--   - Creatable by anyone (for placing orders)
--   - Readable by public, but ONLY for recent orders (last 24 hours)
--   - This prevents data leakage of historical order data
--
-- Note: The API layer provides additional filtering by table number for
-- customer-facing views, but database-level policies provide defense in depth.

ALTER TABLE "orders" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can create orders" ON "orders";
DROP POLICY IF EXISTS "Public can read orders" ON "orders";
DROP POLICY IF EXISTS "Public can read recent orders" ON "orders";

-- Allow creating orders
CREATE POLICY "Public can create orders"
ON "orders" FOR INSERT
TO public
WITH CHECK (true);

-- Allow reading ONLY recent orders (last 24 hours)
-- This prevents unauthorized access to historical customer data
CREATE POLICY "Public can read recent orders"
ON "orders" FOR SELECT
TO public
USING (created_at > (NOW() - INTERVAL '24 hours'));

-- ============================================================================
-- 4. ORDER ITEMS (Time-Scoped via Order Relationship)
-- ============================================================================
-- Order items should be:
--   - Creatable by anyone (for adding items to orders)
--   - Readable by public, but ONLY if the associated order is recent (< 24h)
--   - This provides consistent access control with the orders table

ALTER TABLE "order_items" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can create order items" ON "order_items";
DROP POLICY IF EXISTS "Public can read order items" ON "order_items";

-- Allow adding items to orders
CREATE POLICY "Public can create order items"
ON "order_items" FOR INSERT
TO public
WITH CHECK (true);

-- Allow reading items ONLY from recent orders
-- Uses a subquery to enforce the same 24-hour window as orders
CREATE POLICY "Public can read order items"
ON "order_items" FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.created_at > (NOW() - INTERVAL '24 hours')
  )
);

-- ============================================================================
-- 5. SETTINGS (Service Role Only)
-- ============================================================================
-- Settings table contains sensitive admin configuration (passwords, emails)
-- and should ONLY be accessible via service role key (used in API routes).
-- No public access should be granted.

ALTER TABLE IF EXISTS "settings" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access to settings" ON "settings";

-- Only service role can access settings
CREATE POLICY "Service role full access to settings"
ON "settings"
FOR ALL
TO authenticated
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- ============================================================================
-- 6. RESTAURANT SETTINGS (Mixed Access)
-- ============================================================================
-- Restaurant settings (table count, layout) should be:
--   - Readable by public (for rendering floor plan, QR codes)
--   - Writable only by service role (via owner-authenticated API routes)

ALTER TABLE IF EXISTS "restaurant_settings" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read restaurant settings" ON "restaurant_settings";
DROP POLICY IF EXISTS "Service role can manage restaurant settings" ON "restaurant_settings";

-- Allow public read access for customer-facing features
CREATE POLICY "Public can read restaurant settings"
ON "restaurant_settings" FOR SELECT
TO public
USING (true);

-- Only service role can modify settings
CREATE POLICY "Service role can manage restaurant settings"
ON "restaurant_settings"
FOR ALL
TO authenticated
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- After running this migration, you can verify the policies with these queries:
--
-- 1. Check which tables have RLS enabled:
--    SELECT tablename, rowsecurity 
--    FROM pg_tables 
--    WHERE schemaname = 'public' AND rowsecurity = true;
--
-- 2. List all policies:
--    SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
--    FROM pg_policies
--    WHERE schemaname = 'public';
--
-- 3. Test public access to recent vs old orders (using anon key):
--    SELECT * FROM orders WHERE created_at > NOW() - INTERVAL '24 hours';
--    SELECT * FROM orders WHERE created_at < NOW() - INTERVAL '24 hours';
--    (Second query should return empty result for anon users)
-- ============================================================================

-- Migration complete
SELECT 'Secure RLS policies applied successfully!' as status;
