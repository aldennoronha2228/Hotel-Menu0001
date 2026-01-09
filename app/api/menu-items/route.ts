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
import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
    try {
        // Authenticate Owner
        const user = await currentUser();
        const ownerEmail = process.env.OWNER_EMAIL;
        const userEmail = user?.emailAddresses?.[0]?.emailAddress;

        if (!ownerEmail) {
            console.error('OWNER_EMAIL not set in environment variables');
            return NextResponse.json({ error: 'Server Authorization Config Missing' }, { status: 500 });
        }

        if (userEmail !== ownerEmail) {
            console.warn(`Unauthorized access attempt by ${userEmail} (expected ${ownerEmail})`);
            return NextResponse.json({ error: 'Unauthorized: You are not the owner' }, { status: 401 });
        }

        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.error('SUPABASE_SERVICE_ROLE_KEY not set');
            return NextResponse.json({ error: 'Server Database Config Missing' }, { status: 500 });
        }

        const body = await request.json();
        const { name, price, category_id, type, image_url } = body;

        // Use Admin Client to bypass RLS for Write
        const { data, error } = await supabaseAdmin
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
