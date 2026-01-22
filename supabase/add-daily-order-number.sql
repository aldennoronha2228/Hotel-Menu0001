-- Add daily order number to orders table
-- This will track the order number for the current day

-- Add column if it doesn't exist
alter table orders add column if not exists daily_order_number int;

-- Add column for the date (to reset counter daily)
alter table orders add column if not exists order_date date default current_date;

-- Create an index for faster queries
create index if not exists idx_orders_date on orders(order_date);

-- ==========================================
-- INSTRUCTIONS:
-- 1. Open your Supabase Dashboard
-- 2. Go to SQL Editor
-- 3. Paste and run this script
-- 4. Orders will now show as "Order #1", "Order #2" for each day
-- ==========================================
