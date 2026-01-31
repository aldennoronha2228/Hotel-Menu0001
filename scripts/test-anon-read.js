
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
    envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY']
);

async function testRead() {
    console.log('--- START TEST ---');

    console.log('1. Reading Categories...');
    const { data: cats, error: catError } = await supabase.from('categories').select('*');
    if (catError) console.error('❌ Cat Error:', catError.message);
    else console.log(`✅ Categories: ${cats.length}`);

    console.log('2. Reading Menu Items...');
    const { data: items, error: itemError } = await supabase.from('menu_items').select('*').limit(5);
    if (itemError) console.error('❌ Item Error:', itemError.message);
    else console.log(`✅ Menu Items: ${items.length}`);

    console.log('--- END TEST ---');
}

testRead();
