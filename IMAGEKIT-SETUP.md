# ImageKit.io Setup Guide

This guide will walk you through setting up ImageKit.io for storing and serving menu item images in your restaurant ordering system.

---

## What is ImageKit.io?

ImageKit.io is a cloud-based image CDN that provides:
- ✅ Fast image uploads
- ✅ Automatic image optimization
- ✅ Real-time image transformations
- ✅ CDN-powered delivery
- ✅ Free tier: 20GB bandwidth/month, 20GB storage

---

## Step 1: Create an ImageKit Account

1. Go to **https://imagekit.io**
2. Click **"Sign Up"** or **"Get Started Free"**
3. Sign up using:
   - Google account (recommended)
   - GitHub account
   - Or email + password
4. Verify your email if required

---

## Step 2: Access Your Dashboard

1. After signing in, you'll land on the ImageKit Dashboard
2. You should see:
   - Media Library (where uploaded images appear)
   - Dashboard metrics
   - Navigation menu on the left

---

## Step 3: Get Your API Keys

### 3.1 Find Developer Options

1. In the left sidebar, click on **"Developer options"** 
   - Or go directly to: https://imagekit.io/dashboard/developer/api-keys
2. You'll see a section called **"API Keys"**

### 3.2 Copy Your Keys

You need **THREE** keys:

#### ① Public Key
- Located under **"Public Key"**
- Looks like: `public_xxxxxxxxxxxxxxxxxxx`
- Click the **copy icon** to copy it
- This key is safe to expose in client-side code

#### ② Private Key
- Located under **"Private API Key"**
- Click **"Show"** to reveal it
- Looks like: `private_xxxxxxxxxxxxxxxxxxx`
- Click the **copy icon** to copy it
- ⚠️ **Keep this secret!** Never expose in client-side code

#### ③ URL Endpoint
- Located under **"URL-endpoint"**
- Looks like: `https://ik.imagekit.io/your_imagekit_id`
- Click the **copy icon** to copy it
- This is your image CDN URL

---

## Step 4: Add Keys to Your Project

### 4.1 Create/Update `.env.local`

In your project root (`Menu website` folder), open or create `.env.local`:

```env
# ImageKit.io Configuration
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=public_xxxxxxxxxxxxxxxxxxx
IMAGEKIT_PRIVATE_KEY=private_xxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id
```

### 4.2 Replace with Your Actual Keys

Copy the three keys you got from Step 3 and replace:
- `public_xxxxxxxxxxxxxxxxxxx` → Your actual public key
- `private_xxxxxxxxxxxxxxxxxxx` → Your actual private key  
- `https://ik.imagekit.io/your_imagekit_id` → Your actual URL endpoint

### 4.3 Save the File

- Make sure `.env.local` is saved
- **Important**: `.env.local` is already in `.gitignore`, so your private keys won't be committed to Git

---

## Step 5: Restart Your Development Server

ImageKit keys are only loaded when the server starts:

```bash
# Stop the current server (Ctrl+C in the terminal)
# Then restart:
npm run dev
```

---

## Step 6: Test the Integration

### 6.1 Access the Dashboard

1. Go to http://localhost:3000/sign-in
2. Sign in with your Clerk account (or sign up if you haven't)
3. Navigate to **Dashboard → Menu Management**

### 6.2 Add a Menu Item with Image

1. Click **"Add Item"** button
2. Fill in the item details:
   - Name: "Test Dish"
   - Price: 100
   - Category: Select any
   - Type: Veg or Non-veg
3. **Upload an Image**:
   - Click the file input
   - Select a food image from your computer
   - The image will upload to ImageKit
4. Click **"Add Item"** to save

### 6.3 Verify the Upload

1. Go to **ImageKit Dashboard** → **Media Library**
2. You should see your uploaded image there
3. On your menu page, the image should display with ImageKit's CDN URL

---

## Understanding ImageKit in Your App

### Where Images Are Used

1. **Dashboard → Menu Management**
   - Add/Edit menu items with images
   - Upload directly from the form

2. **Customer Menu Page**
   - Menu items display their images
   - Images are automatically optimized by ImageKit
   - Fast loading via CDN

### Image Upload Flow

```
User selects image 
    ↓
Frontend requests auth from /api/imagekit-auth
    ↓
ImageKit authenticates the upload
    ↓
Image uploads directly to ImageKit
    ↓
ImageKit returns the image URL
    ↓
URL is saved in Supabase database
    ↓
Image displays on menu using CDN URL
```

---

## ImageKit Free Tier Limits

Your free account includes:

| Feature | Free Tier Limit |
|---------|----------------|
| Bandwidth | 20 GB/month |
| Storage | 20 GB total |
| Transformations | Unlimited |
| Media Library | Unlimited files |
| API Requests | Unlimited |

**What this means:**
- Perfect for a single restaurant
- Can store ~1000-2000 high-quality food images
- Serves plenty of menu views per month

---

## Optional: Configure Upload Settings

### Set Upload Folder

To keep menu images organized:

1. In ImageKit Dashboard → **Settings** → **Upload**
2. Set **Default upload path**: `/menu-items/`
3. All menu images will be organized in this folder

### Enable Automatic Optimization

ImageKit automatically optimizes images, but you can configure:

1. Go to **Settings** → **Image Settings**
2. **Format**: Auto (recommended - uses WebP when supported)
3. **Quality**: 80 (good balance of quality and size)
4. **Progressive JPEG**: Enabled

---

## Troubleshooting

### ❌ "Failed to upload image"

**Possible Causes:**
1. Private key is incorrect
2. Server wasn't restarted after adding keys
3. File size is too large (max 25MB on free tier)

**Solution:**
- Double-check all three keys in `.env.local`
- Restart the dev server: `npm run dev`
- Verify keys are correct in ImageKit dashboard

### ❌ Images not displaying

**Possible Causes:**
1. URL endpoint is incorrect
2. Image was deleted from ImageKit

**Solution:**
- Verify `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` matches your dashboard
- Check Media Library to confirm image exists

### ❌ "Authentication failed"

**Possible Causes:**
1. Private key has a space or typo
2. Keys are from different ImageKit accounts

**Solution:**
- Copy keys again from dashboard
- Make sure there are no extra spaces in `.env.local`
- Ensure all three keys are from the same ImageKit account

---

## Production Deployment

When deploying to Vercel, Netlify, or other platforms:

1. Add all three ImageKit environment variables in your hosting dashboard
2. Use the **same keys** from your ImageKit account
3. ImageKit CDN works globally - no additional configuration needed

### Vercel Example:

1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add:
   - `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY`
   - `IMAGEKIT_PRIVATE_KEY`
   - `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT`
4. Redeploy your application

---

## Security Best Practices

✅ **DO:**
- Keep `IMAGEKIT_PRIVATE_KEY` in `.env.local` (server-side only)
- Use `NEXT_PUBLIC_` prefix only for public and URL endpoint
- Regenerate private key if accidentally exposed

❌ **DON'T:**
- Commit `.env.local` to Git (it's in `.gitignore`)
- Share your private key publicly
- Hardcode keys in your source code

---

## Need More Help?

- **ImageKit Documentation**: https://docs.imagekit.io
- **Getting Started Guide**: https://docs.imagekit.io/getting-started/quickstart-guides
- **Upload API**: https://docs.imagekit.io/api-reference/upload-file-api/client-side-file-upload
- **Support**: support@imagekit.io

---

## Summary Checklist

- [ ] Created ImageKit account
- [ ] Copied Public Key
- [ ] Copied Private Key  
- [ ] Copied URL Endpoint
- [ ] Added all three keys to `.env.local`
- [ ] Restarted development server
- [ ] Tested image upload in dashboard
- [ ] Verified image appears in ImageKit Media Library

---

**You're all set!** 🎉 Your restaurant menu can now use high-performance, CDN-delivered images for all menu items.
