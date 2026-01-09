# Vercel Deployment Fix

## The Issue
Vercel doesn't have the Supabase environment variables, so orders fail.

## Quick Fix - Add to Vercel

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project**: `hotel-menu0001`
3. **Go to Settings** → **Environment Variables**
4. **Add these variables**:

### If You DON'T Have Supabase Yet (Demo Mode):
Leave the variables empty or add dummy values:

```
NEXT_PUBLIC_SUPABASE_URL=https://demo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=demo-key
```

This will make it run in demo mode (orders work but aren't saved).

### If You HAVE Supabase Set Up:
Copy from your `.env` file:

```
NEXT_PUBLIC_SUPABASE_URL=your_actual_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_key
```

5. **Save** the variables
6. **Redeploy**:
   - Go to **Deployments** tab
   - Click the **three dots** on latest deployment
   - Click **"Redeploy"**

## Alternative: Remove Supabase Requirement Temporarily

If you want to skip Supabase entirely for now, I can modify the code to work without it.

---

## Once Fixed

✅ Orders will work on Vercel
✅ In demo mode: orders show success but aren't saved
✅ With Supabase: orders are saved to database

Let me know when you've added the variables to Vercel!
