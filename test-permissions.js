const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env vars
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) envVars[key.trim()] = value.trim();
});

const supabase = createClient(
    envVars['NEXT_PUBLIC_SUPABASE_URL'],
    envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY']
);

async function testInsert() {
    console.log('Testing permission to insert order items...');

    // 1. Create a test order
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
            restaurant_id: 'test-perm',
            table_number: '999',
            total: 100,
            status: 'new'
        }])
        .select()
        .single();

    if (orderError) {
        console.error('❌ Failed to create order:', orderError.message);
        return;
    }
    console.log('✅ Created test order:', order.id);

    // 2. Try to insert an item
    const { data: item, error: itemError } = await supabase
        .from('order_items')
        .insert([{
            order_id: order.id,
            menu_item_id: null, // nullable for test
            item_name: 'Test Item',
            item_price: 100,
            quantity: 1
        }])
        .select();

    if (itemError) {
        console.error('❌ Failed to create order item:', itemError.message);
        console.log('⚠️ PLEASE RUN THE SQL FIX IN SUPABASE DASHBOARD!');
    } else {
        console.log('✅ Created order item successfully!');
        console.log('🎉 Permissions are working correctly.');
    }

    // Cleanup
    await supabase.from('orders').delete().eq('id', order.id);
}

testInsert();
