-- RUN THIS IN SUPABASE SQL EDITOR

-- 1. Enable RLS on categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 2. Create a policy to allow ANYONE to read categories
-- We use 'IF NOT EXISTS' logic by dropping first to avoid errors
DROP POLICY IF EXISTS "public_view_categories" ON categories;
CREATE POLICY "public_view_categories" ON categories FOR SELECT USING (true);

-- 3. Do the same for menu_items
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_view_menu_items" ON menu_items;
CREATE POLICY "public_view_menu_items" ON menu_items FOR SELECT USING (true);
