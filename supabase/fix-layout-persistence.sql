-- ==========================================
-- RESTAURANT SETTINGS TABLE
-- Stores table count and layout configuration
-- ==========================================

-- Create the table
create table if not exists restaurant_settings (
  id text primary key,
  table_count int default 15,
  table_layout jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security
alter table restaurant_settings enable row level security;

-- Allow public read access (for dashboard views)
create policy "Enable read access for all users" 
  on restaurant_settings for select 
  using (true);

-- Allow insert/update for authenticated users
create policy "Enable insert for authenticated users" 
  on restaurant_settings for insert 
  with check (auth.role() = 'authenticated');

create policy "Enable update for authenticated users" 
  on restaurant_settings for update 
  using (auth.role() = 'authenticated');

-- Insert default configuration for the restaurant
insert into restaurant_settings (id, table_count, table_layout)
values ('rest001', 15, null)
on conflict (id) do nothing;

-- ==========================================
-- INSTRUCTIONS:
-- 1. Open your Supabase Dashboard
-- 2. Go to SQL Editor
-- 3. Paste and run this script
-- 4. Your table layout will now sync across all devices!
-- ==========================================
