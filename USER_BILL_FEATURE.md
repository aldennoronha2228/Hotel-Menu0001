# User-Specific Bill Feature - Implementation Summary

## Problem Statement
Previously, when a customer clicked "View Bill", they would see **ALL orders** from their table, including orders placed by other customers at the same table. This was confusing and violated privacy expectations.

## Solution
Implemented user-specific bill tracking so each customer only sees their own orders.

## Changes Made

### 1. Database Schema (`supabase/add-user-tracking.sql`)
- **Added** `user_id` TEXT column to the `orders` table
- **Created** indexes for optimized queries:
  - `idx_orders_user_id` - for filtering by user
  - `idx_orders_table_user` - for table + user lookups

### 2. TypeScript Types (`lib/types.ts`)
- **Updated** `Order` interface to include optional `user_id` field

### 3. Frontend - Menu Page (`app/menu/[restaurantId]/page.tsx`)

#### User ID Generation
- Added `userId` state to track the current user
- Implemented localStorage persistence using key: `userId_table_{tableNumber}`
- Auto-generates unique ID format: `user_{timestamp}_{randomString}`
- IDs are table-specific (different users at different tables get different IDs)

#### Order Placement
- Modified `placeOrder()` to include `user_id` in the API request
- Each order is now tagged with the customer who placed it

#### Bill Display
- Created `userOrders` filter that only includes orders matching current `userId`
- Updated `getBillTotal()` to calculate from `userOrders` instead of `activeOrders`
- Modified "View Bill" button to only show when `userOrders.length > 0`
- Updated Bill Modal to display only `userOrders`
- Added empty state: "You haven't placed any orders yet"

### 4. Backend - Orders API (`app/api/orders/route.ts`)

#### GET Endpoint
- Added `userId` query parameter support
- Returns `user_id` field in formatted orders
- Can filter orders by `user_id` when provided
- Example: `/api/orders?table=5&userId=user_123456_abc`

#### POST Endpoint
- Accepts `user_id` in request body
- Stores `user_id` when creating new orders
- Backwards compatible (sets to `null` if not provided)

## How It Works

### Step-by-Step Flow

1. **Customer Arrives at Table**
   - Scans QR code: `/menu/rest001?table=5`
   - Page loads and checks localStorage for existing user ID
   - If none exists, generates: `user_1737000000000_abc123`
   - Stores in localStorage: `userId_table_5`

2. **Customer Places Order**
   - Adds items to cart
   - Clicks "Place Order"
   - Frontend sends:
     ```json
     {
       "tableNumber": "5",
       "items": [...],
       "total": 450,
       "user_id": "user_1737000000000_abc123"
     }
     ```
   - Backend saves order with `user_id` field

3. **Customer Views Bill**
   - Clicks "View Bill (₹450)" button
   - Modal opens showing only THEIR orders
   - Other customers at Table 5 won't see this order
   - Admin dashboard still sees ALL orders

4. **Different Customer at Same Table**
   - Scans same QR code in their own phone
   - Gets NEW user ID: `user_1737000123000_xyz789`
   - Places their own separate order
   - Sees only their own bill

## Testing Checklist

- [ ] Database migration applied successfully
- [ ] User can place an order
- [ ] "View Bill" button appears after placing order
- [ ] Bill shows only user's own orders
- [ ] Different browser/incognito session shows separate bill
- [ ] Admin dashboard shows all orders from table
- [ ] Existing orders (without user_id) don't break anything

## Migration Steps

### Quick Start (Recommended)
1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/add-user-tracking.sql`
3. Paste and click "Run"
4. Verify "user_id" column exists in orders table

### Alternative Methods
See `USER_BILL_MIGRATION.md` for detailed migration instructions.

## Benefits

✅ **Privacy**: Users only see their own orders  
✅ **Clarity**: No confusion about who ordered what  
✅ **Flexibility**: Multiple customers can use same table independently  
✅ **Backwards Compatible**: Existing orders continue to work  
✅ **Admin Visibility**: Restaurant staff still see all orders  

## Notes

- User IDs are browser-specific (clearing data generates new ID)
- Each table has separate user ID namespace
- No login/authentication required
- Simple and lightweight implementation
- Admin view unchanged (still sees all orders per table)
