/**
 * Database Migration Helper
 * Run this to add user_id column to orders table
 * 
 * Usage:
 * node scripts/migrate-user-tracking.js
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Error: Missing Supabase credentials');
    console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
    console.log('🚀 Starting user tracking migration...\n');

    try {
        // Read the SQL file
        const sqlPath = join(__dirname, '..', 'supabase', 'add-user-tracking.sql');
        const sql = readFileSync(sqlPath, 'utf-8');

        // Split by semicolons and execute each statement
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        console.log(`Found ${statements.length} SQL statements to execute\n`);

        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            console.log(`Executing statement ${i + 1}/${statements.length}...`);

            const { error } = await supabase.rpc('exec_sql', { sql: statement });

            if (error) {
                console.error(`❌ Error executing statement ${i + 1}:`, error.message);
                // Continue with other statements
            } else {
                console.log(`✅ Statement ${i + 1} executed successfully`);
            }
        }

        console.log('\n✨ Migration completed!');
        console.log('\nNext steps:');
        console.log('1. Verify the user_id column exists in the orders table');
        console.log('2. Test by placing an order and viewing the bill');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error('\n📝 Manual migration required. Please run the SQL from:');
        console.error('   supabase/add-user-tracking.sql');
        console.error('   in your Supabase SQL Editor');
        process.exit(1);
    }
}

runMigration();
