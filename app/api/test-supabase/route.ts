import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        // Check environment variables
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            return NextResponse.json({
                status: 'not_configured',
                message: 'Supabase environment variables are not set',
                env_check: {
                    url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
                    key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
                }
            });
        }

        // Try to query categories
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .limit(1);

        if (error) {
            return NextResponse.json({
                status: 'error',
                message: 'Supabase query failed',
                error: error.message,
                env_check: {
                    url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
                    key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
                }
            });
        }

        return NextResponse.json({
            status: 'connected',
            message: 'Supabase is working!',
            categories_count: data?.length || 0,
            env_check: {
                url: true,
                key: true
            }
        });
    } catch (error: any) {
        return NextResponse.json({
            status: 'error',
            message: error.message,
            env_check: {
                url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
                key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            }
        });
    }
}
