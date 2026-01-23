-- Allow public/anon users to read orders
-- This is required for customers to view their bill and order status on the menu page
-- The API handles filtering by table number to ensure privacy

ALTER TABLE "orders" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read orders" ON "orders";

CREATE POLICY "Public can read orders"
ON "orders"
FOR SELECT
TO public
USING (true);
