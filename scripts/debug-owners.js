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
    console.log('.env not found or unreadable');
}

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = envVars['SUPABASE_SERVICE_ROLE_KEY'];
const envOwner = envVars['OWNER_EMAIL'];

console.log('--- Debugging Owner Access ---');
console.log('ENV OWNER_EMAIL:', `"${envOwner}"`);

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOwners() {
    // 1. Check DB Settings
    const { data, error } = await supabase
        .from('settings')
        .select('key, value')
        .eq('key', 'owner_email')
        .single();

    if (error) {
        console.log('DB Error fetching owner_email:', error.message);
    } else {
        console.log('DB OWNER_EMAIL:', `"${data?.value}"`);
    }

    // 2. Simulate Check
    const testEmails = ['aldenengineeringentranceexam@gmail.com', 'randomcheck@gmail.com', 'test@test.com'];

    console.log('\n--- Simulation ---');

    const envList = (envOwner || '').split(',').map(e => e.trim().toLowerCase()).filter(e => e.length > 0);
    const dbList = (data?.value || '').split(',').map(e => e.trim().toLowerCase()).filter(e => e.length > 0);

    testEmails.forEach(email => {
        const inEnv = envList.includes(email.toLowerCase());
        const inDb = dbList.includes(email.toLowerCase());
        const allowed = inEnv || inDb;

        console.log(`Email: ${email}`);
        console.log(`  -> Match ENV? ${inEnv}`);
        console.log(`  -> Match DB?  ${inDb}`);
        console.log(`  -> ACCESS:    ${allowed ? 'GRANTED ✅' : 'DENIED ❌'}`);
    });
}

checkOwners();
