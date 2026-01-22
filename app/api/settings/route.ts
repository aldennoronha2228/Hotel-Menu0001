import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { currentUser } from '@clerk/nextjs/server';
import { isOwner } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET restaurant settings
export async function GET() {
    try {
        const client = supabaseAdmin || supabase;

        const { data, error } = await client
            .from('restaurant_settings')
            .select('*')
            .eq('id', 'rest001')
            .single();

        if (error) {
            // If table doesn't exist yet, return default values
            if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
                return NextResponse.json({
                    id: 'rest001',
                    table_count: 15,
                    table_layout: null
                });
            }
            throw error;
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch settings' },
            { status: 500 }
        );
    }
}

// POST/PUT update restaurant settings
export async function POST(request: NextRequest) {
    try {
        // Authenticate Owner
        const user = await currentUser();
        const userEmail = user?.emailAddresses?.[0]?.emailAddress;

        if (!isOwner(userEmail)) {
            return NextResponse.json(
                { error: 'Unauthorized: Only owners can update settings' },
                { status: 401 }
            );
        }

        if (!supabaseAdmin) {
            return NextResponse.json(
                { error: 'Database configuration missing' },
                { status: 500 }
            );
        }

        const body = await request.json();
        const { table_count, table_layout } = body;

        // Upsert the settings
        const { data, error } = await supabaseAdmin
            .from('restaurant_settings')
            .upsert({
                id: 'rest001',
                table_count,
                table_layout,
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json(
            { error: 'Failed to update settings' },
            { status: 500 }
        );
    }
}
