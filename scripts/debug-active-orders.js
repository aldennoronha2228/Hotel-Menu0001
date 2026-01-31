
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) envVars[key.trim()] = value.trim();
});

const supabase = createClient(
    envVars['NEXT_PUBLIC_SUPABASE_URL'],
    envVars['SUPABASE_SERVICE_ROLE_KEY']
);

async function inspectAllOrders() {
    console.log('Fetching ALL orders...');

    // Fetch batch of 100
    const { data: orders, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .limit(100);

    if (error) {
        console.error('❌ Query Error:', error);
        return;
    }

    console.log(`Row count: ${orders.length}`);

    if (orders.length > 0) {
        const o = orders[0];
        console.log('Sample Order Keys:', Object.keys(o));
        console.log('Sample Order Items type:', Array.isArray(o.order_items) ? 'Array' : typeof o.order_items);
    }

    // Check for potential crashers
    let badOrders = 0;
    orders.forEach(o => {
        try {
            // Mimic route logic
            const mapped = {
                id: o.id,
                dailyOrderNumber: o.daily_order_number,
                total: parseFloat(o.total),
                items: o.order_items.map(item => ({
                    id: item.menu_item_id,
                    name: item.item_name
                }))
            };
        } catch (e) {
            console.error(`❌ Crashing Order ID ${o.id}:`, e.message);
            badOrders++;
        }
    });

    if (badOrders === 0) {
        console.log('✅ All checked orders are map-safe.');
    } else {
        console.error(`❌ Found ${badOrders} bad orders.`);
    }
}

inspectAllOrders();
