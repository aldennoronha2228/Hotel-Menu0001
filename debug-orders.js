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

async function inspectOrders() {
    console.log('Fetching orders...');

    // Fetch raw data from Supabase
    const { data: orders, error } = await supabase
        .from('orders')
        .select('*, order_items(*)');

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(`Found ${orders.length} orders.\n`);

    orders.forEach((order, i) => {
        console.log(`Order #${i + 1} (ID: ${order.id})`);
        console.log(`Table: ${order.table_number}`);
        console.log(`Order Items Raw:`, JSON.stringify(order.order_items, null, 2));
        console.log('-------------------');
    });
}

inspectOrders();
