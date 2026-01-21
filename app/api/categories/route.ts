import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET all categories
export async function GET() {
    try {
        // Use admin client if available to bypass RLS, otherwise fall back to public client
        const client = supabaseAdmin || supabase;

        const { data, error } = await client
            .from('categories')
            .select('*')
            .order('display_order');

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json(
            { error: 'Failed to fetch categories' },
            { status: 500 }
        );
    }
}
