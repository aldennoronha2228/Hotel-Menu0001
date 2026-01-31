# Project Explanation - Simple Guide

This document explains the entire Hotel Menu project in the simplest way possible. You can use this to explain the project to your professor or anyone else.

---

## 1. Project Overview (What is this?)
This is a **Digital Menu & Restaurant Management System**. 
- **Customers** scan a QR code, view the menu on their phone, and place orders.
- **Restaurant Owners** see these orders instantly on a dashboard and manage the menu (add/remove food items).

It replaces paper menus with a modern website.

---

## 2. Technologies Used (The Tools)

These are the "ingredients" used to build the project:

### A. The Website (Frontend)
- **Next.js**: The main framework. Think of it as the engine that runs the website. It makes the site fast and SEO-friendly.
- **TypeScript**: The programming language. It's like JavaScript but stricter, which helps prevent bugs (errors) in the code.
- **CSS (Vanilla)**: Used for styling. This controls how the website looks (colors, fonts, buttons, layout). We wrote our own custom styles instead of using a library like Bootstrap or Tailwind, giving us full control over the "Basil Cafe" design.

### B. The Backend (The Brain & Storage)
- **Supabase**: This is our database. It stores all the information like:
  - Menu items (names, prices, descriptions)
  - Categories (Starters, Main Course, Drinks)
  - Orders (what customers accepted)
  Supabase is efficient and real-time, meaning orders pop up instantly.

### C. Authentication (The Security Guard)
- **Clerk**: Handles proper login and sign-up. It ensures only the **Restaurant Owner** can log in to the Dashboard to change the menu or see revenue. Customers don't need to log in.

### D. Image Storage
- **ImageKit**: Stores the photos of the food. When we upload a picture of a burger, it goes here, and ImageKit gives us a link to show it on the website.

---

## 3. Important Files & Folders (The Map)

Here is a simple explanation of the most important parts of the code:

### 📂 `app` Folder
This is where all the website pages live.
- **`page.tsx`**: The **Home Page**. This is the first thing people see (e.g., "Welcome to Restro").
- **`layout.tsx`**: The **Master Template**. It holds the common stuff like fonts and the basic HTML structure that every page shares.
- **`globals.css`**: The **Styling File**. This contains all the design rules (colors, fonts, button shapes) for the whole website.

### 📂 `app/menu`
- This is the **Customer's View**.
- When a customer scans the QR code, they land here.
- It fetches the food list from Supabase and shows it beautifully.

### 📂 `app/dashboard`
- This is the **Owner's Control Panel**.
- **`page.tsx`**: Shows the overview (Total Orders, Revenue).
- **`menu/page.tsx`**: Where the owner adds or edits food items.
- **`qr-code/page.tsx`**: Generates the QR codes for tables.
- **Note**: This entire folder is protected. Only logged-in owners can see it.

### 📂 `components`
- Reusable "lego blocks" of code.
- Example: Instead of writing the code for a "Food Card" 10 times, we write it once in a component and receive it 10 times.

### 📄 `.env` (Environment Variables)
- **The Secret Key Vault**.
- This file stores sensitive passwords and keys (like the password to the Database or Clerk).
- **Important**: This file stays on your computer and is never shared publicly.

---

## 4. How It Works (The Flow)

### Step 1: The Setup
1. The Owner logs in (via Clerk).
2. Goes to **Dashboard -> Menu**.
3. Adds food items (e.g., "Paneer Butter Masala", "150", Uploads Photo).
4. The photo goes to **ImageKit**, and data goes to **Supabase**.

### Step 2: The Customer
1. Customer sits at a table and scans the QR Code.
2. The phone opens `app/menu`.
3. The website asks **Supabase**: "Hey, give me the list of food items."
4. Supabase sends the data, and the customer sees the menu.

### Step 3: The Order
1. Customer adds items to the cart and clicks "Place Order".
2. The order is sent to **Supabase**.
3. **Supabase Realtime** instantly notifies the Owner's Dashboard.
4. The Kitchen prepares the food!

---

## 5. Summary for Presentation

"Sir, this project is a **Next.js** web application. We use **Supabase** for the database to store menu items and orders in real-time. For security, we use **Clerk** to manage admin login. The design is custom-made using **CSS** to ensure it looks modern and responsive on mobile phones. Customers can scan a QR code to view the menu, and owners have a dedicated dashboard to manage everything."
