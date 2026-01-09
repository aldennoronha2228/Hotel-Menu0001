-- FIX: Allow public/dashboard to delete orders
-- This enables the "Delete" button functionality

DROP POLICY IF EXISTS "Public can delete orders" ON orders;

CREATE POLICY "Public can delete orders" 
ON orders 
FOR DELETE 
USING (true);
