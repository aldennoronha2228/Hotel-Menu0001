import { createClient } from '@supabase/supabase-js';

export async function isOwner(email: string | null | undefined): Promise<boolean> {
    if (!email) return false;
    const lowerEmail = email.toLowerCase();

    // 1. Check current Environment Variables (Bootstrap/Fallback)
    const envEmails = (process.env.OWNER_EMAIL || '')
        .split(',')
        .map(e => e.trim().toLowerCase())
        .filter(e => e.length > 0);

    if (envEmails.includes(lowerEmail)) return true;

    // 2. Check Database Settings
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) return false;

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

            return dbEmails.includes(lowerEmail);
        }
    } catch (e) {
        console.error('Error checking owner in DB:', e);
    }

    return false;
}
