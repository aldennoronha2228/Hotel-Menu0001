-- FIX: Allow public read access to 'owner_email' setting
-- This is crucial so that the isOwner() check can verify ownership 
-- even if the server-side Service Role key is temporarily unavailable or if checked from a client context.

ALTER TABLE "settings" ENABLE ROW LEVEL SECURITY;

-- Drop generic policy if it exists (it might be too restrictive)
DROP POLICY IF EXISTS "Public can read owner_email" ON "settings";

-- Create specific policy for owner_email
CREATE POLICY "Public can read owner_email"
ON "settings"
FOR SELECT
TO public
USING (key = 'owner_email');

-- Also allow reading table_count if that's stored in settings (though api/settings uses restaurant_settings table)
-- But just in case any other public keys are needed:
-- We KEEP admin_password HIDDEN.

-- Double check correct permissions for restaurant_settings as well (for dashboard layout)
CREATE TABLE IF NOT EXISTS public.restaurant_settings (
    id TEXT PRIMARY KEY,
    table_count INTEGER,
    table_layout JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE "restaurant_settings" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read restaurant_settings" ON "restaurant_settings";
CREATE POLICY "Allow public read restaurant_settings"
ON "restaurant_settings"
FOR SELECT
TO public
USING (true);

-- Allow owners to update (checked via API, so we can allow INSERT/UPDATE to authenticated or public with RLS check?)
-- API uses Service Role usually, but if we want direct client access:
DROP POLICY IF EXISTS "Allow authenticated update restaurant_settings" ON "restaurant_settings";
CREATE POLICY "Allow authenticated update restaurant_settings"
ON "restaurant_settings"
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
