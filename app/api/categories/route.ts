import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET all categories
export async function GET() {
    try {
        const { data, error } = await supabase
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
