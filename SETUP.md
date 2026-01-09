# Setup Instructions - Production Features

## Prerequisites

You'll need accounts for:
1. **Clerk** - https://clerk.com (Free tier available)
2. **Supabase** - https://supabase.com (Free tier available)
3. **ImageKit** - https://imagekit.io (Free tier available)

---

## Step 1: Clerk Setup (Authentication)

1. Go to https://clerk.com and create an account
2. Create a new application
3. In the Clerk dashboard:
   - Go to **API Keys**
   - Copy your **Publishable Key** and **Secret Key**
4. Save these keys for the `.env.local` file

---

## Step 2: Supabase Setup (Database)

1. Go to https://supabase.com and create an account
2. Create a new project
3. Wait for the database to be provisioned
4. In the Supabase dashboard:
   - Go to **Settings** → **API**
   - Copy your **Project URL** and **anon/public key**
5. Go to **SQL Editor**
6. Copy the contents of `supabase-schema.sql` and run it
7. This will create all necessary tables and default categories
8. Save the URL and key for the `.env.local` file

---

## Step 3: ImageKit Setup (Image Storage)

1. Go to https://imagekit.io and create an account
2. In the ImageKit dashboard:
   - Go to **Developer Options**
   - Copy your **Public Key**, **Private Key**, and **URL Endpoint**
3. Save these keys for the `.env.local` file

---

## Step 4: Environment Variables

Create a `.env.local` file in the project root with:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXXXXX
CLERK_SECRET_KEY=sk_test_XXXXXXXXXXXXXXX
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.XXXXXXXXXXXXXXX

# ImageKit.io
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=public_XXXXXXXXXXXXXXX
IMAGEKIT_PRIVATE_KEY=private_XXXXXXXXXXXXXXX
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id

# Restaurant
NEXT_PUBLIC_RESTAURANT_ID=rest001
```

---

## Step 5: Run the Application

```bash
# Install dependencies (if not already done)
npm install

# Run development server
npm run dev
```

---

## Step 6: First Time Setup

### Create Your First Staff Account

1. Go to http://localhost:3000/dashboard
2. You'll be redirected to the Clerk sign-in page
3. Click "Sign up" to create your first staff account
4. After signing up, you'll have full access to the dashboard

### Add Menu Items

1. Go to **Dashboard** → **Menu Management**
2. Click **"Add Item"**
3. Fill in the details:
   - Item name
   - Price
   - Category (pre-populated from database)
   - Type (Veg/Non-veg)
   - Upload image (optional, via ImageKit)
4. Click **"Add Item"** to save

### Download QR Codes

1. Go to **Dashboard** → **Tables**
2. Click **"Download QR"** for each table
3. Print and place QR codes on your restaurant tables

---

## Features Now Available

✅ **Clerk Authentication**
- Dashboard is protected and requires login
- Staff sign-in/sign-up pages
- Secure logout functionality

✅ **Supabase Database**
- Menu items stored persistently
- Categories pre-loaded
- Real-time data synchronization
- RLS policies for security

✅ **ImageKit Image Storage**
- Upload menu item images
- Optimized image delivery
- CDN-powered fast loading

---

## Testing

1. **Customer Flow**: Scan any QR code → Browse menu → Add items → Place order
2. **Staff Flow**: Login → Manage orders → Update menu → Generate QR codes

---

## Troubleshooting

### "Invalid Clerk keys" error
- Double-check your `.env.local` has the correct Clerk keys
- Restart the dev server after adding environment variables

### "Supabase connection failed"
- Verify your Supabase URL and anon key are correct
- Check that you ran the `supabase-schema.sql` file

### "Image upload failed"
- Confirm all three ImageKit keys are set correctly
- Check ImageKit dashboard for upload limits

---

## Production Deployment

When deploying to Vercel/Netlify:

1. Add all environment variables in your hosting dashboard
2. Ensure `.env.local` is in `.gitignore` (it should be by default)
3. Update `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` to use your production domain if needed

---

## Need Help?

- Clerk Docs: https://clerk.com/docs
- Supabase Docs: https://supabase.com/docs
- ImageKit Docs: https://docs.imagekit.io
