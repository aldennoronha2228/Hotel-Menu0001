
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

async function checkColumns() {
    const { data, error } = await supabase.from('orders').select('*').limit(1);
    if (data && data.length > 0) {
        console.log('Order Keys:', Object.keys(data[0]));
        if (!('daily_order_number' in data[0])) {
            console.error('⚠️ daily_order_number is MISSING from orders table');
        } else {
            console.log('✅ daily_order_number exists');
        }
    } else {
        console.log('No orders found to check columns');
    }
}
checkColumns();
