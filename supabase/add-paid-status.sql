-- Allow 'paid' status in orders table
ALTER TABLE orders 
DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN ('new', 'preparing', 'done', 'paid', 'cancelled'));
