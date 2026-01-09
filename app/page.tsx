import Link from 'next/link';

export default function HomePage() {
  return (
    <div style={{
      maxWidth: '600px',
      margin: '0 auto',
      padding: '3rem 1rem',
      textAlign: 'center'
    }}>
      <h1 style={{ marginBottom: '1rem' }}>Restaurant QR Ordering System</h1>
      <p style={{
        color: 'var(--color-text-secondary)',
        marginBottom: '2rem',
        fontSize: 'var(--font-size-sm)'
      }}>
        Demo & Testing Page
      </p>

      <div style={{
        padding: '1.5rem',
        backgroundColor: '#fef3c7',
        borderRadius: 'var(--border-radius-lg)',
        marginBottom: '2rem',
        textAlign: 'left',
        border: '1px solid #fbbf24'
      }}>
        <h3 style={{ marginBottom: '0.5rem', fontSize: 'var(--font-size-base)' }}>ℹ️ For Customers</h3>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
          Scan the QR code on your table to open the menu directly. You don't need to visit this page.
        </p>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        marginBottom: '3rem'
      }}>
        <div style={{
          padding: '1rem',
          backgroundColor: 'var(--color-bg)',
          borderRadius: 'var(--border-radius-lg)',
          textAlign: 'left'
        }}>
          <h3 style={{ marginBottom: '0.5rem' }}>👥 Customer Menu (Test)</h3>
          <p style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
            marginBottom: '1rem'
          }}>
            Try the customer ordering experience
          </p>
          <Link href="/menu/rest001?table=1" className="btn btn-primary" style={{ width: '100%' }}>
            Open Menu (Table 1)
          </Link>
        </div>

        <div style={{
          padding: '1rem',
          backgroundColor: 'var(--color-bg)',
          borderRadius: 'var(--border-radius-lg)',
          textAlign: 'left'
        }}>
          <h3 style={{ marginBottom: '0.5rem' }}>🔐 Restaurant Dashboard</h3>
          <p style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
            marginBottom: '1rem'
          }}>
            Manage orders, menu, and QR codes
          </p>
          <Link href="/dashboard" className="btn btn-secondary" style={{ width: '100%' }}>
            Open Dashboard
          </Link>
        </div>
      </div>

      <div style={{
        padding: '1.5rem',
        backgroundColor: 'var(--color-bg)',
        borderRadius: 'var(--border-radius-lg)',
        textAlign: 'left'
      }}>
        <h3 style={{ marginBottom: '1rem' }}>✨ Features</h3>
        <ul style={{
          listStyle: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          fontSize: 'var(--font-size-sm)'
        }}>
          <li>✓ QR codes link directly to menu (no login needed)</li>
          <li>✓ Mobile-first responsive design</li>
          <li>✓ Real-time order management</li>
          <li>✓ Menu management with availability toggle</li>
          <li>✓ Downloadable table QR codes</li>
          <li>✓ Pay at counter (no online payment)</li>
        </ul>
      </div>
    </div>
  );
}
