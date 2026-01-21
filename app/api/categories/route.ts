import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

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

import { NextRequest } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { isOwner } from '@/lib/auth';

// POST create new category
export async function POST(request: NextRequest) {
    try {
        // Authenticate Owner
        const user = await currentUser();
        const userEmail = user?.emailAddresses?.[0]?.emailAddress;

        if (!process.env.OWNER_EMAIL) {
            console.error('OWNER_EMAIL not set in environment variables');
            return NextResponse.json({ error: 'Server Authorization Config Missing' }, { status: 500 });
        }

        if (!isOwner(userEmail)) {
            console.warn(`Unauthorized access attempt by ${userEmail}`);
            return NextResponse.json({ error: 'Unauthorized: You are not the owner' }, { status: 401 });
        }

        if (!supabaseAdmin) {
            console.error('SUPABASE_SERVICE_ROLE_KEY not set (admin client null)');
            return NextResponse.json({ error: 'Server Database Config Missing' }, { status: 500 });
        }

        const body = await request.json();
        const { name, display_order } = body;

        const { data, error } = await supabaseAdmin
            .from('categories')
            .insert([{ name, display_order: display_order || 0 }])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error('Error creating category:', error);
        return NextResponse.json(
            { error: 'Failed to create category' },
            { status: 500 }
        );
    }
}
