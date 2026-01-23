const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Move up one level to find .env since we are in /scripts
const envPath = path.join(__dirname, '..', '.env');
try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) envVars[key.trim()] = value.trim();
    });

    const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
    const supabaseKey = envVars['SUPABASE_SERVICE_ROLE_KEY'];

    console.log('Testing Admin Password...');
    console.log('URL:', supabaseUrl);
    console.log('Key exists:', !!supabaseKey);

    const supabase = createClient(supabaseUrl, supabaseKey);

    async function testPassword() {
        try {
            // 1. Fetch hash
            const { data, error } = await supabase
                .from('settings')
                .select('key, value')
                .eq('key', 'admin_password')
                .single();

            if (error) {
                console.error('❌ DB Error:', error.message);
                return;
            }

            if (!data) {
                console.error('❌ No admin_password found in settings table');
                return;
            }

            console.log('Stored Hash:', data.value);

            // 2. Test Compare
            const inputPass = 'admin123';
            const isValid = await bcrypt.compare(inputPass, data.value);

            console.log(`Checking '${inputPass}': ${isValid ? '✅ VALID' : '❌ INVALID'}`);

            // 3. Generate new hash if invalid
            if (!isValid) {
                console.log('\nGenerating new correct hash...');
                const newHash = await bcrypt.hash('admin123', 10);
                console.log('New Hash:', newHash);
                console.log('Run this SQL to update:');
                console.log(`UPDATE settings SET value = '${newHash}' WHERE key = 'admin_password';`);
            }

        } catch (e) {
            console.error('Unexpected error:', e);
        }
    }

    testPassword();

} catch (e) {
    console.error('Failed to read .env:', e.message);
}
