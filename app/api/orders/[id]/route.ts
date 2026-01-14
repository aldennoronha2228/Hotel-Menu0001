import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';

// PATCH update order status
export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const body = await request.json();
        const { id } = await context.params;
        const { status } = body;

        console.log('PATCH /api/orders/[id] - Updating order:', id, 'to status:', status);

        // Use admin client to bypass RLS
        const client = supabaseAdmin || supabase;

        const { data, error } = await client
            .from('orders')
            .update({ status })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Database error:', error);
            throw error;
        }

        console.log('Order updated successfully:', data);
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error updating order:', error);
        return NextResponse.json(
            {
                error: 'Failed to update order',
                details: error?.message || error?.toString() || 'Unknown error',
                code: error?.code
            },
            { status: 500 }
        );
    }
}

// DELETE order
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        // Use admin client to bypass RLS
        const client = supabaseAdmin || supabase;

        const { error } = await client
            .from('orders')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting order:', error);
        return NextResponse.json(
            { error: 'Failed to delete order' },
            { status: 500 }
        );
    }
}
