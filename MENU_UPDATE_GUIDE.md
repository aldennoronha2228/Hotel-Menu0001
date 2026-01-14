# Menu Update Guide

## 📋 New Menu Items Added

Based on your uploaded menu images, I've created a complete menu with:

### Categories:
1. **Chinese Starters** - 22 items
   - Green Chilly variants (Gobi/Chicken/Sausage)
   - Manchurian variants
   - Honey Chilly variants  
   - Basil Chilly variants
   - Lemon Chilly variants
   - Black Pepper variants
   - Dragon Chicken
   - Garlic Chicken with Cheese

2. **Twist of Mexican** - 9 items
   - Burrito Bowls & Wraps
   - Fajitas (Paneer/Chicken/Sausage)

3. **Quesadilla** - 7 items
   - Cheese, Bean, Egg, Mushroom, Paneer, Chicken variants

4. **Pastas** - 7 items
   - Alfredo, Basil Italiano, Red Pepper, Tomato Cream, etc.

5. **Noodles N Rice** - 22 items
   - Noodles, Fried Rice, Sauce Tossed, Malaysian Special

6. **Basilcombo Meals** - 19 items
   - Chinese combos (Basil/Honey Chilly with rice)
   - Continental combos (Cheesy Tabasco, Mexican Cream)

7. **Indian Dishes** - 25 items
   - Dal Kichidi, Biriyani
   - Masala curries (Paneer, Egg, Chicken)
   - Rice varieties, Rotis

8. **Coolers** - 10 items
   - Water, Sodas, Mocktails, Juices

9. **Ice-cream Shakes** - 7 items
   - Irish Coffee, Chocolate, Oreo, Mango, etc.

10. **Desserts** - 5 items
    - Chocolate Pudding variants
    - Fried Ice Cream

**Total: 133 menu items** 🎉

---

## 🚀 How to Apply This Update

### Option 1: Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard:** https://app.supabase.com
2. **Select your project**
3. **Go to SQL Editor** (left sidebar)
4. **Click "New Query"**
5. **Copy and paste** the contents of `supabase/update-menu-items.sql`
6. **Click "Run"** or press Ctrl+Enter
7. **Wait for success** ✅

### Option 2: Command Line (If you have direct access)

```bash
# Using psql
psql "YOUR_DATABASE_URL" -f "supabase/update-menu-items.sql"
```

---

## ⚠️ Important Notes

### This Will:
- ✅ Delete ALL existing menu categories
- ✅ Delete ALL existing menu items  
- ✅ Delete ALL existing order items (if any)
- ✅ Add 5 new categories
- ✅ Add 67 new menu items

### This Will NOT:
- ❌ Delete orders
- ❌ Delete users
- ❌ Affect dashboard or settings

### Backup (Optional but Recommended):
Before running, you can export your current menu:
1. Go to Supabase → Table Editor
2. Select `menu_items` table
3. Click "..." → Export to CSV

---

## 🧪 After Running the Migration

1. **Refresh your menu page:** `http://localhost:3000/menu/rest001?table=5`
2. **Check all 5 categories** appear in the navigation
3. **Verify items** are showing with correct prices
4. **Test ordering** to ensure everything works

---

## 📝 Prices Structure

All prices are in ₹ (Rupees):
- Chinese Starters: ₹120-180
- Mexican: ₹120-160
- Quesadilla: ₹120-150
- Pastas: ₹130-150
- Noodles & Rice: ₹40-150

---

## 🎨 Menu Highlights

**Vegetarian Options:** 
- All Gobi/Paneer/Mushroom/Veg variants
- Pasta variants
- Quesadilla options

**Non-Vegetarian Options:**
- Chicken variants
- Egg options
- Chicken Sausage variants

**Price Range:** ₹40 - ₹180

---

**Ready to update your menu?** Run the SQL migration in Supabase! 🚀
