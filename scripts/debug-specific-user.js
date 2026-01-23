const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load .env manually
const envPath = path.join(__dirname, '..', '.env');
const envVars = {};
try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('=').trim();
            envVars[key] = value;
        }
    });
} catch (e) {
    console.log('.env not found');
}

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = envVars['SUPABASE_SERVICE_ROLE_KEY'];
const envOwner = envVars['OWNER_EMAIL'] || '';

const targetEmail = 'aldennoronhaschool@gmail.com';

console.log('--- INVESTIGATION: ' + targetEmail + ' ---');

// 1. Check ENV
const envList = envOwner.split(',').map(e => e.trim().toLowerCase());
console.log('ENV OWNER_EMAIL items:', envList);
const inEnv = envList.includes(targetEmail.toLowerCase());
console.log(`Checking ENV: ${inEnv ? 'FOUND (Access Granted via .env)' : 'NOT FOUND in .env'}`);

// 2. Check DB
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDb() {
    const { data, error } = await supabase
        .from('settings')
        .select('key, value')
        .eq('key', 'owner_email')
        .single();

    if (error) {
        console.log('DB Error:', error.message);
        return;
    }

    const dbValue = data?.value || '';
    const dbList = dbValue.split(',').map(e => e.trim().toLowerCase());

    console.log('DB OWNER_EMAIL items:', dbList);

    const inDb = dbList.includes(targetEmail.toLowerCase());
    console.log(`Checking DB:  ${inDb ? 'FOUND (Access Granted via Database)' : 'NOT FOUND in Database'}`);

    if (!inEnv && !inDb) {
        console.log('\nRESULT: This email SHOULD BE BLOCKED. If it is getting in, the code logic might be cached or incorrect.');
        console.log('Action: I will force a hard reset.');
    } else {
        console.log('\nRESULT: Access is GRANTED because the email exists in the source shown above.');
    }
}

checkDb();
