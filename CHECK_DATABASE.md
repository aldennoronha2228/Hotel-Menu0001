# Database Migration Required!

## ⚠️ ERROR 500 - Why It's Happening

Your database has a constraint that **only allows** these order statuses:
- `new`
- `preparing`
- `done`

When you try to set status to `paid`, the database **rejects** it with a constraint violation error.

## ✅ FIX - Run This Migration NOW

### Step 1: Open Supabase Dashboard
1. Go to https://app.supabase.com
2. Select your project
3. Click **SQL Editor** in the left sidebar

### Step 2: Run This SQL
Copy and paste this **exactly**:

```sql
-- Remove old constraint
ALTER TABLE orders 
DROP CONSTRAINT IF EXISTS orders_status_check;

-- Add new constraint with 'paid' and 'cancelled'
ALTER TABLE orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN ('new', 'preparing', 'done', 'paid', 'cancelled'));
```

### Step 3: Click "Run" or press Ctrl+Enter

### Step 4: You should see
✅ Success message
✅ "Rows returned: 0" or similar

---

## 🧪 After Running Migration

1. Refresh your dashboard page
2. Try "Mark as Paid" again
3. **It will work!**

---

## Alternative: Direct psql Access

If you have the database URL:

```bash
# Windows PowerShell
$env:SQL = @"
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
CHECK (status IN ('new', 'preparing', 'done', 'paid', 'cancelled'));
"@

psql "YOUR_DATABASE_URL" -c $env:SQL
```

---

## Check If Migration Already Applied

Run this in Supabase SQL Editor:

```sql
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'orders_status_check';
```

**Expected result after migration:**
```
status IN ('new', 'preparing', 'done', 'paid', 'cancelled')
```

**Current (broken) result:**
```
status IN ('new', 'preparing', 'done')
```

---

**YOU MUST RUN THIS MIGRATION!** The code changes won't work without it. 🚨
