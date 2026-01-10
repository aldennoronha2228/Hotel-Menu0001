-- FIX: Enable full deletion of orders and their items
-- 1. Allow deleting orders
DROP POLICY IF EXISTS "Public can delete orders" ON orders;
CREATE POLICY "Public can delete orders" ON orders FOR DELETE USING (true);

-- 2. Allow deleting order items
-- This is often overlooked! If you delete an order, the database tries to delete items.
-- If RLS blocks deleting items, the order deletion will FAIL.
DROP POLICY IF EXISTS "Public can delete order items" ON order_items;
CREATE POLICY "Public can delete order items" ON order_items FOR DELETE USING (true);

-- 3. Just in case cascade is missing (failsafe)
ALTER TABLE order_items 
DROP CONSTRAINT IF EXISTS order_items_order_id_fkey,
ADD CONSTRAINT order_items_order_id_fkey 
  FOREIGN KEY (order_id) 
  REFERENCES orders(id) 
  ON DELETE CASCADE;
