npm-- FIX: Allow public read access to categories
-- This is necessary because the public API key is restricted by RLS by default.

-- 1. Enable RLS (if not already enabled)
ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policy if it conflicts (optional, to avoid errors)
DROP POLICY IF EXISTS "Public categories are viewable by everyone" ON "public"."categories";
DROP POLICY IF EXISTS "Allow public read access on categories" ON "public"."categories";

-- 3. Create the policy to allow EVERYONE (anon and authenticated) to read categories
CREATE POLICY "Allow public read access on categories"
ON "public"."categories"
FOR SELECT
TO public
USING (true);

-- 4. Do the same for menu_items just to be sure
ALTER TABLE "public"."menu_items" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access on menu_items" ON "public"."menu_items";

CREATE POLICY "Allow public read access on menu_items"
ON "public"."menu_items"
FOR SELECT
TO public
USING (true);
