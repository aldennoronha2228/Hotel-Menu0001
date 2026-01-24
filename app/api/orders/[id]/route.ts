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
        const { status, items, total } = body;

        console.log('PATCH /api/orders/[id] - Updating order:', id, { status, itemsLen: items?.length, total });

        // Use admin client to bypass RLS
        const client = supabaseAdmin || supabase;

        // 1. Update Orders Table (Status & Total)
        const updates: any = {};
        if (status) updates.status = status;
        if (total !== undefined) updates.total = total;

        if (Object.keys(updates).length > 0) {
            const { error } = await client
                .from('orders')
                .update(updates)
                .eq('id', id);

            if (error) throw error;
        }

        // 2. Update Items if provided
        if (items && Array.isArray(items)) {
            // Delete existing items for this order
            const { error: deleteError } = await client
                .from('order_items')
                .delete()
                .eq('order_id', id);

            if (deleteError) throw deleteError;

            // Insert new items
            if (items.length > 0) {
                const orderItems = items.map((item: any) => {
                    // Check if ID is a valid UUID
                    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.id);
                    return {
                        order_id: id,
                        menu_item_id: isUuid ? item.id : null,
                        item_name: item.name,
                        item_price: item.price,
                        quantity: item.quantity
                    };
                });

                const { error: insertError } = await client
                    .from('order_items')
                    .insert(orderItems);

                if (insertError) throw insertError;
            }
        }

        return NextResponse.json({ success: true, updated: true });
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
