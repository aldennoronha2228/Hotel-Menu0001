import { NextRequest, NextResponse } from 'next/server';

// Get ImageKit authentication parameters for client-side upload
export async function GET() {
    try {
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
