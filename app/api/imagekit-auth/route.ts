import { NextRequest, NextResponse } from 'next/server';
import { requireOwner } from '@/lib/auth-helpers';

// Get ImageKit authentication parameters for client-side upload
export async function GET() {
    try {
        // Require owner authentication
        const authResult = await requireOwner();
        if (authResult instanceof NextResponse) return authResult;

        const response = await fetch(
            `https://api.imagekit.io/v1/params/auth`,
            {
                headers: {
                    Authorization: `Basic ${Buffer.from(
                        process.env.IMAGEKIT_PRIVATE_KEY! + ':'
                    ).toString('base64')}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error('Failed to get ImageKit auth params');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error getting ImageKit auth:', error);
        return NextResponse.json(
            { error: 'Failed to get upload authentication' },
            { status: 500 }
        );
    }
}
