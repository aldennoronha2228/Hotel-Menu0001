export function isOwner(email: string | null | undefined): boolean {
    if (!email) return false;

    const ownerEmails = (process.env.OWNER_EMAIL || '')
        .split(',')
        .map(e => e.trim().toLowerCase())
        .filter(e => e.length > 0); // Remove empty strings

    return ownerEmails.includes(email.toLowerCase());
}
