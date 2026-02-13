import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { isOwner } from './auth';

/**
 * Requires that the request is from an authenticated owner.
 * Returns the user email if authorized, or a NextResponse error if not.
 * 
 * Usage:
 * const result = await requireOwner();
 * if (result instanceof NextResponse) return result;
 * // result is now the user email string
 */
export async function requireOwner(): Promise<string | NextResponse> {
    const user = await currentUser();
    const userEmail = user?.emailAddresses?.[0]?.emailAddress;

    if (!userEmail) {
        return NextResponse.json(
            { error: 'Unauthorized: Authentication required' },
            { status: 401 }
        );
    }

    const ownerCheck = await isOwner(userEmail);
    if (!ownerCheck) {
        return NextResponse.json(
            { error: 'Unauthorized: Owner access required' },
            { status: 403 }
        );
    }

    return userEmail;
}

/**
 * Requires that the request is from an authenticated user.
 * Returns the user email if authenticated, or a NextResponse error if not.
 * 
 * Usage:
 * const result = await requireAuth();
 * if (result instanceof NextResponse) return result;
 * // result is now the user email string
 */
export async function requireAuth(): Promise<string | NextResponse> {
    const user = await currentUser();
    const userEmail = user?.emailAddresses?.[0]?.emailAddress;

    if (!userEmail) {
        return NextResponse.json(
            { error: 'Unauthorized: Authentication required' },
            { status: 401 }
        );
    }

    return userEmail;
}
