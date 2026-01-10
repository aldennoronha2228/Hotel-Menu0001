import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { isOwner } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const user = await currentUser();
        const userEmail = user?.emailAddresses?.[0]?.emailAddress;

        return NextResponse.json({
            environment: {
                SUPABASE_URL_SET: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
                SUPABASE_SERVICE_KEY_SET: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
                OWNER_EMAIL_SET: !!process.env.OWNER_EMAIL,
                CLERK_SECRET_KEY_SET: !!process.env.CLERK_SECRET_KEY,
            },
            authentication: {
                isAuthenticated: !!user,
                userEmail: userEmail || null,
                userId: user?.id || null,
            },
            authorization: {
                configuredOwnerEmails: process.env.OWNER_EMAIL || 'NOT_SET',
                isOwner: isOwner(userEmail)
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
