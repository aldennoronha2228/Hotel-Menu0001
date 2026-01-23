import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { isOwner } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET orders (Owner gets all, Public gets Table-specific)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const tableFilter = searchParams.get('table');
        const userIdFilter = searchParams.get('userId');
        const includeAll = searchParams.get('includeAll') === 'true';

        // Check Auth
        let isAdmin = false;
        if (!tableFilter) {
            const user = await currentUser();
            const userEmail = user?.emailAddresses?.[0]?.emailAddress;

            if (await isOwner(userEmail)) {
                isAdmin = true;
                if (!supabaseAdmin) {
                    return NextResponse.json({ error: 'Server Config Error: SUPABASE_SERVICE_ROLE_KEY is missing' }, { status: 500 });
                }
            } else {
                console.error(`Auth Failed: User=${userEmail}, Owners=${process.env.OWNER_EMAIL}`);
                return NextResponse.json({ error: 'Unauthorized: Access Denied. Check OWNER_EMAIL config.' }, { status: 401 });
            }
        }

        const client = (isAdmin && supabaseAdmin) ? supabaseAdmin : supabase;

        let query = client
            .from('orders')
            .select('*, order_items(*)')
            .order('created_at', { ascending: false });

        if (!isAdmin && tableFilter) {
            query = query.eq('table_number', tableFilter);

            // Optional: Limit to recent orders (e.g. last 12 hours) to avoid showing old history to new customers
            const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
            query = query.gt('created_at', twelveHoursAgo);
        }

        // For admin dashboard: exclude paid and cancelled orders by default
        // UNLESS includeAll=true (for history page)
        if (isAdmin && !includeAll) {
            query = query.neq('status', 'paid').neq('status', 'cancelled');
        }

        // Filter by user_id if provided (for individual bill viewing)
        if (userIdFilter) {
            query = query.eq('user_id', userIdFilter);
        }

        const { data: orders, error: ordersError } = await query;

        if (ordersError) throw ordersError;

        // Transform data
        const formattedOrders = orders.map(order => ({
            id: order.id,
            dailyOrderNumber: order.daily_order_number,
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
            timestamp: order.created_at,
            user_id: order.user_id // Include user_id for filtering
        }));

        return NextResponse.json(formattedOrders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json([], { status: 500 });
    }
}

// POST create new order
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { restaurantId, tableNumber, items, total, user_id } = body;

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

        // Get today's date (YYYY-MM-DD format)
        const today = new Date().toISOString().split('T')[0];

        // Count today's orders to generate sequential number
        const { count: todayCount } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', `${today}T00:00:00`)
            .lt('created_at', `${today}T23:59:59`);

        const dailyOrderNumber = (todayCount || 0) + 1;

        // Insert order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert([
                {
                    restaurant_id: restaurantId,
                    table_number: tableNumber,
                    total,
                    status: 'new',
                    user_id: user_id || null,
                    daily_order_number: dailyOrderNumber,
                    order_date: today
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
