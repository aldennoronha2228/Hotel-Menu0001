import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET all orders
export async function GET() {
    try {
        // Check if Supabase is configured
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            console.warn('Supabase not configured, returning empty orders');
            return NextResponse.json([]);
        }

        const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('*, order_items(*)')
            .order('created_at', { ascending: false });

        if (ordersError) throw ordersError;

        // Transform the data to match the expected format
        const formattedOrders = orders.map(order => ({
            id: order.id,
            restaurantId: order.restaurant_id,
            tableNumber: order.table_number,
            items: order.order_items.map((item: any) => ({
                id: item.menu_item_id,
                name: item.item_name,
                price: parseFloat(item.item_price),
                quantity: item.quantity
            })),
            total: parseFloat(order.total),
            status: order.status,
            timestamp: order.created_at
        }));

        return NextResponse.json(formattedOrders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json([], { status: 200 }); // Return empty array instead of error
    }
}

// POST create new order
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { restaurantId, tableNumber, items, total } = body;

        // Check if Supabase is configured
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            console.warn('Supabase not configured. Order would be:', { restaurantId, tableNumber, items, total });

            // Return success for demo purposes
            return NextResponse.json(
                {
                    success: true,
                    orderId: 'demo-' + Date.now(),
                    message: 'Order placed successfully (Demo Mode - Set up Supabase to save orders)',
                    demo: true
                },
                { status: 201 }
            );
        }

        // Insert order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert([
                {
                    restaurant_id: restaurantId,
                    table_number: tableNumber,
                    total,
                    status: 'new'
                }
            ])
            .select()
            .single();

        if (orderError) throw orderError;

        // Insert order items
        const orderItems = items.map((item: any) => {
            // Check if ID is a valid UUID
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.id);

            return {
                order_id: order.id,
                menu_item_id: isUuid ? item.id : null,
                item_name: item.name,
                item_price: item.price,
                quantity: item.quantity
            };
        });

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

        if (itemsError) throw itemsError;

        return NextResponse.json(
            {
                success: true,
                orderId: order.id,
                message: 'Order placed successfully'
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json(
            { error: 'Failed to create order. Please check your Supabase configuration.' },
            { status: 500 }
        );
    }
}
