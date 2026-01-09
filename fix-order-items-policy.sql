-- FIX: Allow public customers to insert into order_items
-- This is critical for the order flow to save items!

-- 1. Drop existing restrictive policies on order_items if any
DROP POLICY IF EXISTS "Public can create order items" ON order_items;
DROP POLICY IF EXISTS "Anyone can create order items" ON order_items;
DROP POLICY IF EXISTS "Public can insert order items" ON order_items;

-- 2. Create a permissive policy for inserting items
-- This allows anyone (even unauthenticated customers) to add items to an order
CREATE POLICY "Public can insert order items" 
ON order_items 
FOR INSERT 
WITH CHECK (true);

-- 3. Also ensure they can read the items they just created (optional but good for verification)
CREATE POLICY "Public can read order items" 
ON order_items 
FOR SELECT 
USING (true);

-- 4. Verify orders table policies too
DROP POLICY IF EXISTS "Public can create orders" ON orders;
CREATE POLICY "Public can create orders" 
ON orders 
FOR INSERT 
WITH CHECK (true);
