
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env vars manually
const envPath = path.join(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) envVars[key.trim()] = value.trim();
});

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseServiceKey = envVars['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase URL or Service Role Key in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const categories = [
    { name: 'Starters & Sides', display_order: 1 },
    { name: 'Fried Rice', display_order: 2 },
    { name: 'Noodles', display_order: 3 },
    { name: 'Meals', display_order: 4 },
    { name: 'Biriyani', display_order: 5 }
];

const menuItems = [
    // Starters & Sides
    { name: 'Gobi Chilli', price: 110, type: 'veg', category: 'Starters & Sides' },
    { name: 'Gobi Manchurian (Half)', price: 60, type: 'veg', category: 'Starters & Sides' },
    { name: 'Gobi Manchurian (Full)', price: 110, type: 'veg', category: 'Starters & Sides' },
    { name: 'Mushroom Manchurian (Half)', price: 70, type: 'veg', category: 'Starters & Sides' },
    { name: 'Mushroom Manchurian (Full)', price: 120, type: 'veg', category: 'Starters & Sides' },
    { name: 'Mushroom Chilli (Half)', price: 70, type: 'veg', category: 'Starters & Sides' },
    { name: 'Mushroom Chilli (Full)', price: 120, type: 'veg', category: 'Starters & Sides' },
    { name: 'Paneer Chilli (Half)', price: 90, type: 'veg', category: 'Starters & Sides' },
    { name: 'Paneer Chilli (Full)', price: 160, type: 'veg', category: 'Starters & Sides' },
    { name: 'Paneer Manchurian (Half)', price: 90, type: 'veg', category: 'Starters & Sides' },
    { name: 'Paneer Manchurian (Full)', price: 160, type: 'veg', category: 'Starters & Sides' },
    { name: 'Paneer Pepper Fry', price: 160, type: 'veg', category: 'Starters & Sides' },
    { name: 'Fried Chicken - Kebab', price: 30, type: 'non-veg', category: 'Starters & Sides' },
    { name: 'Pepper Chicken', price: 160, type: 'non-veg', category: 'Starters & Sides' },
    { name: 'Chicken Dragon (Half)', price: 100, type: 'non-veg', category: 'Starters & Sides' },
    { name: 'Chicken Dragon (Full)', price: 180, type: 'non-veg', category: 'Starters & Sides' },
    { name: 'Chicken Lollypop Dry (Single Piece)', price: 30, type: 'non-veg', category: 'Starters & Sides' },
    { name: 'Chicken Lollypop Dry (Half)', price: 90, type: 'non-veg', category: 'Starters & Sides' },
    { name: 'Chicken Lollypop Dry (Plate)', price: 160, type: 'non-veg', category: 'Starters & Sides' },
    { name: 'Chili Chicken (Half)', price: 80, type: 'non-veg', category: 'Starters & Sides' },
    { name: 'Chili Chicken (Full)', price: 150, type: 'non-veg', category: 'Starters & Sides' },
    { name: 'Chicken Manchurian (Half)', price: 100, type: 'non-veg', category: 'Starters & Sides' },
    { name: 'Chicken Manchurian (Full)', price: 160, type: 'non-veg', category: 'Starters & Sides' },
    { name: 'Dragon Lollypop (Single Piece)', price: 35, type: 'non-veg', category: 'Starters & Sides' },
    { name: 'Dragon Lollypop (Half)', price: 120, type: 'non-veg', category: 'Starters & Sides' },
    { name: 'Dragon Lollypop (Plate)', price: 220, type: 'non-veg', category: 'Starters & Sides' },

    // Fried Rice
    { name: 'Veg Fried Rice (Half)', price: 50, type: 'veg', category: 'Fried Rice' },
    { name: 'Veg Fried Rice (Full)', price: 80, type: 'veg', category: 'Fried Rice' },
    { name: 'Veg Schezwan Fried Rice (Half)', price: 60, type: 'veg', category: 'Fried Rice' },
    { name: 'Veg Schezwan Fried Rice (Full)', price: 90, type: 'veg', category: 'Fried Rice' },
    { name: 'Mushroom Fried Rice (Half)', price: 80, type: 'veg', category: 'Fried Rice' },
    { name: 'Mushroom Fried Rice (Full)', price: 140, type: 'veg', category: 'Fried Rice' },
    { name: 'Veg Triple Rice', price: 80, type: 'veg', category: 'Fried Rice' },
    { name: 'Paneer Fried Rice (Half)', price: 80, type: 'veg', category: 'Fried Rice' },
    { name: 'Paneer Fried Rice (Full)', price: 140, type: 'veg', category: 'Fried Rice' },
    { name: 'Schezwan Mix Veg Fried Rice', price: 150, type: 'veg', category: 'Fried Rice' },
    { name: 'Egg Fried Rice (Half)', price: 55, type: 'non-veg', category: 'Fried Rice' },
    { name: 'Egg Fried Rice (Full)', price: 90, type: 'non-veg', category: 'Fried Rice' },
    { name: 'Schezwan Egg Fried Rice (Half)', price: 65, type: 'non-veg', category: 'Fried Rice' },
    { name: 'Schezwan Egg Fried Rice (Full)', price: 100, type: 'non-veg', category: 'Fried Rice' },
    { name: 'Chicken Fried Rice (Half)', price: 60, type: 'non-veg', category: 'Fried Rice' },
    { name: 'Chicken Fried Rice (Full)', price: 110, type: 'non-veg', category: 'Fried Rice' },
    { name: 'Schezwan Chicken Fried Rice (Half)', price: 70, type: 'non-veg', category: 'Fried Rice' },
    { name: 'Schezwan Chicken Fried Rice (Full)', price: 120, type: 'non-veg', category: 'Fried Rice' },
    { name: 'Chicken Triple Rice', price: 120, type: 'non-veg', category: 'Fried Rice' },
    { name: 'Chicken Chopper Rice', price: 130, type: 'non-veg', category: 'Fried Rice' },

    // Noodles
    { name: 'Veg Noodles (Half)', price: 50, type: 'veg', category: 'Noodles' },
    { name: 'Veg Noodles (Full)', price: 80, type: 'veg', category: 'Noodles' },
    { name: 'Veg Schezwan Noodles (Half)', price: 60, type: 'veg', category: 'Noodles' },
    { name: 'Veg Schezwan Noodles (Full)', price: 90, type: 'veg', category: 'Noodles' },
    { name: 'Paneer Noodles (Half)', price: 80, type: 'veg', category: 'Noodles' },
    { name: 'Paneer Noodles (Full)', price: 140, type: 'veg', category: 'Noodles' },
    { name: 'Paneer Schezwan Noodles (Half)', price: 90, type: 'veg', category: 'Noodles' },
    { name: 'Paneer Schezwan Noodles (Full)', price: 150, type: 'veg', category: 'Noodles' },
    { name: 'Egg Noodles (Half)', price: 55, type: 'non-veg', category: 'Noodles' },
    { name: 'Egg Noodles (Full)', price: 90, type: 'non-veg', category: 'Noodles' },
    { name: 'Chicken Noodles (Half)', price: 60, type: 'non-veg', category: 'Noodles' },
    { name: 'Chicken Noodles (Full)', price: 110, type: 'non-veg', category: 'Noodles' },
    { name: 'Chicken Schezwan Noodles (Half)', price: 70, type: 'non-veg', category: 'Noodles' },
    { name: 'Chicken Schezwan Noodles (Full)', price: 120, type: 'non-veg', category: 'Noodles' },
    { name: 'Chicken Triple Noodles', price: 120, type: 'non-veg', category: 'Noodles' },

    // Meals
    { name: 'Veg Meals', price: 50, type: 'veg', category: 'Meals' },

    // Biriyani
    { name: 'Chicken Dum Biriyani (Half)', price: 80, type: 'non-veg', category: 'Biriyani' },
    { name: 'Chicken Dum Biriyani (Full)', price: 140, type: 'non-veg', category: 'Biriyani' },
    { name: 'Kushka Rice (Biriyani Rice)', price: 60, type: 'non-veg', category: 'Biriyani' }
];

async function updateMenu() {
    try {
        console.log('Starting menu update...');

        // 1. Delete all existing data
        console.log('Deleting existing data...');

        // Delete order_items first due to FK constraints
        const { error: error1 } = await supabase.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
        if (error1) console.warn('Warning deleting order_items:', error1.message);

        const { error: error2 } = await supabase.from('menu_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (error2) console.warn('Warning deleting menu_items:', error2.message);

        const { error: error3 } = await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (error3) console.warn('Warning deleting categories:', error3.message);

        console.log('Existing data cleared.');

        // 2. Insert Categories
        console.log('Inserting categories...');
        const { data: insertedCategories, error: catError } = await supabase
            .from('categories')
            .insert(categories)
            .select();

        if (catError) throw catError;
        console.log(`Inserted ${insertedCategories.length} categories.`);

        // Create map of Category Name -> ID
        const categoryMap = {};
        insertedCategories.forEach(c => {
            categoryMap[c.name] = c.id;
        });

        // 3. Prepare Menu Items
        const itemsToInsert = menuItems.map(item => ({
            name: item.name,
            price: item.price,
            type: item.type,
            category_id: categoryMap[item.category],
            available: true
        }));

        // 4. Insert Menu Items
        console.log('Inserting menu items...');
        const { data: insertedItems, error: itemError } = await supabase
            .from('menu_items')
            .insert(itemsToInsert)
            .select();

        if (itemError) throw itemError;
        console.log(`Inserted ${insertedItems.length} menu items.`);

        console.log('✅ Menu update complete!');

    } catch (error) {
        console.error('❌ Error updating menu:', error);
    }
}

updateMenu();
