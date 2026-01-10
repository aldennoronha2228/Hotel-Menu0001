const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env vars manually since we can't depend on Next.js here
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) envVars[key.trim()] = value.trim();
});

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

console.log('Testing connection to:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    try {
        // 1. Test basic connection
        console.log('\n1. Testing basic connection...');
        const { data: categories, error: catError } = await supabase
            .from('categories')
            .select('*')
            .limit(1);

        if (catError) {
            console.error('❌ Connection/Query failed:', catError.message);
            console.error('Details:', catError);
        } else {
            console.log('✅ Connection successful!');
            console.log('Categories found:', categories.length);
        }

        // 2. Test inserting a dummy order
        console.log('\n2. Testing order creation...');
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert([{
                restaurant_id: 'test',
                table_number: 'test',
                total: 0,
                status: 'new'
            }])
            .select()
            .single();

        if (orderError) {
            console.error('❌ Order creation failed:', orderError.message);
        } else {
            console.log('✅ Order creation successful!');
            // Clean up
            await supabase.from('orders').delete().eq('id', order.id);
            console.log('✅ Cleaned up test order');
        }

    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

testConnection();
