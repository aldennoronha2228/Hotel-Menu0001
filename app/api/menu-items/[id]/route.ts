import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// PATCH update menu item
export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const body = await request.json();
        const { id } = await context.params;

        const { data, error } = await supabase
            .from('menu_items')
            .update(body)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error updating menu item:', error);
        return NextResponse.json(
            { error: 'Failed to update menu item' },
            { status: 500 }
        );
    }
}

// DELETE menu item
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        const { error } = await supabase
            .from('menu_items')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting menu item:', error);
        return NextResponse.json(
            { error: 'Failed to delete menu item' },
            { status: 500 }
        );
    }
}
