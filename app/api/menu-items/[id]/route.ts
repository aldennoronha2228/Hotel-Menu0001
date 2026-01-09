import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

async function checkOwner() {
    const user = await currentUser();
    const ownerEmail = process.env.OWNER_EMAIL;
    const userEmail = user?.emailAddresses?.[0]?.emailAddress;
    return ownerEmail && userEmail === ownerEmail;
}

// PATCH update menu item
export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    if (!await checkOwner()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await request.json();
        const { id } = await context.params;

        const { data, error } = await supabaseAdmin
            .from('menu_items')
            .update(body)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error updating menu item:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

// PUT support (same as PATCH)
export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    return PATCH(request, context);
}

// DELETE menu item
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    if (!await checkOwner()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { id } = await context.params;

        const { error } = await supabaseAdmin
            .from('menu_items')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting menu item:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
