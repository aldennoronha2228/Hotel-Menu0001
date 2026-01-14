# User-Specific Bill Tracking Migration Guide

## Overview
This migration adds user tracking to the orders table so that each customer can see only their own orders in the bill, not the entire table's orders.

## What Changed

### 1. Database Schema
A new `user_id` column has been added to the `orders` table to track which customer placed each order.

### 2. Frontend Changes
- Each customer now gets a unique user ID stored in localStorage
- The bill modal only shows orders from the current user
- The "View Bill" button only appears when the user has placed orders

### 3. Backend Changes
- The orders API now accepts and stores `user_id` when creating orders
- The API can filter orders by `user_id` when retrieving them

## Manual Database Migration

If you're using Supabase, run this SQL in your Supabase SQL Editor:

```sql
-- Add user_id column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_table_user ON orders(table_number, user_id);
```

## How to Apply the Migration

### Option 1: Using Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to the "SQL Editor" section
3. Copy and paste the SQL code from `supabase/add-user-tracking.sql`
4. Click "Run" to execute the migration

### Option 2: Using Supabase CLI
```bash
# If you have Supabase CLI installed
supabase db push

# Or manually execute the SQL file
psql $DATABASE_URL -f supabase/add-user-tracking.sql
```

### Option 3: Using psql directly
```bash
# Connect to your database
psql "your-database-connection-string"

# Run the migration file
\i supabase/add-user-tracking.sql
```

## How It Works

1. **User ID Generation**: When a customer first visits the menu page for a specific table, a unique user ID is generated and stored in their browser's localStorage with the key `userId_table_{tableNumber}`.

2. **Order Placement**: When placing an order, the user ID is included in the request payload and stored in the database.

3. **Bill Display**: When viewing the bill, only orders with matching `user_id` are displayed to the customer.

## Testing

After applying the migration:

1. Open the menu page for a table (e.g., `/menu/rest001?table=5`)
2. Place an order
3. Click "View Bill" - you should only see YOUR orders
4. Open the same menu in a new incognito/private window
5. Place a different order
6. Both users should see only their own orders in the bill

## Backwards Compatibility

- Existing orders without a `user_id` will have `NULL` in this field
- These legacy orders will still appear in the admin dashboard
- They won't appear in individual customer bills (which is expected behavior)
- New orders will automatically include the user_id

## Notes

- The user ID is stored in localStorage and persists across page refreshes
- Clearing browser data will generate a new user ID
- Each table has separate user IDs (e.g., Table 1's customers have different IDs than Table 2)
- The admin dashboard still shows ALL orders from all users at the table
