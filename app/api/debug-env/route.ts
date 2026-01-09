import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const user = await currentUser();
        const ownerEmail = process.env.OWNER_EMAIL;

        return NextResponse.json({
            environment: {
                SUPABASE_URL_SET: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
                SUPABASE_SERVICE_KEY_SET: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
                OWNER_EMAIL_SET: !!ownerEmail,
                CLERK_SECRET_KEY_SET: !!process.env.CLERK_SECRET_KEY,
            },
            authentication: {
                isAuthenticated: !!user,
                userEmail: user?.emailAddresses?.[0]?.emailAddress || null,
                userId: user?.id || null,
            },
            authorization: {
                configuredOwnerEmail: ownerEmail || 'NOT_SET',
                isOwner: user?.emailAddresses?.[0]?.emailAddress === ownerEmail
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
