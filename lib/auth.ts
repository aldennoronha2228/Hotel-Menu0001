import { createClient } from '@supabase/supabase-js';

export async function isOwner(email: string | null | undefined): Promise<boolean> {
    if (!email) {
        console.log('[Auth] No email provided to isOwner check');
        return false;
    }
    const lowerEmail = email.toLowerCase();

    console.log(`[Auth] Checking ownership for: ${lowerEmail}`);

    // 1. Check current Environment Variables (Bootstrap/Fallback)
    const envEmails = (process.env.OWNER_EMAIL || '')
        .split(',')
        .map(e => e.trim().toLowerCase())
        .filter(e => e.length > 0);

    console.log(`[Auth] Env Owners: ${JSON.stringify(envEmails)}`);

    if (envEmails.includes(lowerEmail)) {
        console.log('[Auth] Match found in ENV');
        return true;
    }

    // 2. Check Database Settings
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.log('[Auth] Missing Supabase config via Env');
            return false;
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data } = await supabase
            .from('settings')
            .select('value')
            .eq('key', 'owner_email')
            .single();

        if (data && data.value) {
            const dbEmails = data.value
                .split(',')
                .map((e: string) => e.trim().toLowerCase());

            console.log(`[Auth] DB Owners: ${JSON.stringify(dbEmails)}`);

            if (dbEmails.includes(lowerEmail)) {
                console.log('[Auth] Match found in DB');
                return true;
            }
        } else {
            console.log('[Auth] No owner_email found in DB settings');
        }
    } catch (e) {
        console.error('[Auth] Error checking owner in DB:', e);
    }

    console.log('[Auth] Access DENIED (No match found)');
    return false;
}
