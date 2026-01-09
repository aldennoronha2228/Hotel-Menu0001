import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET all menu items with categories
export async function GET() {
    try {
        const { data, error } = await supabase
            .from('menu_items')
            .select(`
        *,
        categories (
          id,
          name
        )
      `)
            .order('name');

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching menu items:', error);
        return NextResponse.json(
            { error: 'Failed to fetch menu items' },
            { status: 500 }
        );
    }
}

// POST create new menu item
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, price, category_id, type, image_url } = body;

        const { data, error } = await supabase
            .from('menu_items')
            .insert([
                {
                    name,
                    price,
                    category_id,
                    type,
                    image_url: image_url || null,
                    available: true,
                },
            ])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error('Error creating menu item:', error);
        return NextResponse.json(
            { error: 'Failed to create menu item' },
            { status: 500 }
        );
    }
}
