-- FIX: Allow public/dashboard to update order status
-- This fixes the "Mark as Preparing/Done" buttons

DROP POLICY IF EXISTS "Public can update orders" ON orders;

CREATE POLICY "Public can update orders" 
ON orders 
FOR UPDATE 
USING (true)
WITH CHECK (true);
