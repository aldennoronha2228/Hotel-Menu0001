import DashboardSidebar from '@/components/DashboardSidebar';
import { currentUser } from '@clerk/nextjs/server';
import { isOwner } from '@/lib/auth';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await currentUser();

    // Strict Check: If logged in user is NOT the owner
    const userEmail = user?.emailAddresses?.[0]?.emailAddress;

    if (!await isOwner(userEmail)) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                gap: '1rem',
                textAlign: 'center'
            }}>
                <h1 style={{ color: '#ef4444' }}>Access Denied</h1>
                <p>You are logged in as <strong>{userEmail}</strong></p>
                <p>This account is not authorized to access the restaurant dashboard.</p>
                <p className="text-secondary" style={{ fontSize: '0.8rem' }}>
                    (If you are the owner, please ensure OWNER_EMAIL is set correctly in .env)
                </p>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <DashboardSidebar />
            <main className="dashboard-main">
                {children}
            </main>
        </div>
    );
}
