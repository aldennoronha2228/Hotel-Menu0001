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

    const isAuthorized = await isOwner(userEmail);

    console.log(`[Dashboard Access Control] User: ${userEmail}, Authorized: ${isAuthorized}`);

    if (!isAuthorized) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                gap: '1rem',
                textAlign: 'center',
                backgroundColor: '#fef2f2',
                color: '#b91c1c'
            }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🚫 Access Denied</h1>
                <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
                        You are logged in as: <br />
                        <span style={{ fontWeight: 'bold', fontFamily: 'monospace', fontSize: '1.2rem', color: '#1f2937' }}>
                            {userEmail || 'Unknown User'}
                        </span>
                    </p>
                    <div style={{ height: '1px', backgroundColor: '#e5e7eb', margin: '1.5rem 0' }}></div>
                    <p style={{ color: '#ef4444', fontWeight: 600 }}>
                        This email is NOT listed as an Owner.
                    </p>
                    <p style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '0.5rem' }}>
                        Dashboard access is restricted to: <br />
                        {process.env.OWNER_EMAIL}
                    </p>
                </div>
                <a href="/" style={{ marginTop: '1rem', color: '#4b5563', textDecoration: 'underline' }}>
                    ← Return to Home
                </a>
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
