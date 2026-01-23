-- Create settings table
CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to ensure idempotency
DROP POLICY IF EXISTS "Allow read access to authenticated users" ON public.settings;
DROP POLICY IF EXISTS "Allow update access to authenticated users" ON public.settings;
DROP POLICY IF EXISTS "Allow insert access to authenticated users" ON public.settings;

-- Allow read access to authenticated users (staff need to read table count, owner email etc)
CREATE POLICY "Allow read access to authenticated users" ON public.settings
    FOR SELECT TO authenticated USING (true);

-- Allow update access to authenticated users (server-side logic will enforce admin checks)
CREATE POLICY "Allow update access to authenticated users" ON public.settings
    FOR UPDATE TO authenticated USING (true);

-- Allow insert for initial setup
CREATE POLICY "Allow insert access to authenticated users" ON public.settings
    FOR INSERT TO authenticated WITH CHECK (true);

-- Initial Seed (Idempotent)
INSERT INTO public.settings (key, value)
VALUES 
    ('owner_email', 'aldenengineeringentranceexam@gmail.com'),
    -- Default password 'admin123'
    ('admin_password', '$2b$10$UbAKZTKQHcRT3Okdrjiluu2xmqhbbSkxSDDUvxlE9yjI/kmrtiUoFa') 
ON CONFLICT (key) 
DO UPDATE SET value = EXCLUDED.value WHERE settings.key = 'admin_password';
