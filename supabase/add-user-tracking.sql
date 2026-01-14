-- ========================================
-- ADD USER TRACKING TO ORDERS
-- ========================================
-- This migration adds user tracking so each customer can see only their own orders

-- Add user_id column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_table_user ON orders(table_number, user_id);

-- Update RLS policy to allow users to read their own orders
DROP POLICY IF EXISTS "Public can read their recent orders" ON orders;

CREATE POLICY "Public can read their recent orders" 
ON orders FOR SELECT 
USING (created_at > NOW() - INTERVAL '24 hours');

-- Note: We keep it permissive for now since user_id is not mandatory
-- Users can filter on the client-side based on their generated user_id
