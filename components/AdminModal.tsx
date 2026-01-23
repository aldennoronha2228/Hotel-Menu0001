'use client';
import { useState } from 'react';

export default function AdminModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [mode, setMode] = useState<'login' | 'edit'>('login');
    const [password, setPassword] = useState('');
    const [settings, setSettings] = useState({ owner_email: '' });
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            const data = await res.json();
            if (res.ok) {
                setSettings({ owner_email: data.owner_email });
                setMode('edit');
            } else {
                setMessage(data.error || 'Login failed');
            }
        } catch (err) {
            setMessage('Network error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    password, // current password for auth protection
                    owner_email: settings.owner_email,
                    new_password: newPassword || undefined
                })
            });
            if (res.ok) {
                setMessage('Settings updated successfully!');
                // Wait a bit then close
                setTimeout(() => {
                    onClose();
                    // Optional: reload page to reflect changes if necessary
                    window.location.reload();
                }, 1500);
            } else {
                const data = await res.json();
                setMessage(data.error || 'Update failed');
            }
        } catch (err) {
            setMessage('Network error');
        } finally {
            setLoading(false);
        }
    };

    const handleForgot = async () => {
        // Call forgot password API (Placeholder)
        alert('Please contact the system administrator or check server logs if you are the developer. Email service is not yet configured.');
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', width: '400px', maxWidth: '90%', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Admin Access</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', padding: '0 0.5rem' }}>×</button>
                </div>

                {message && <div style={{
                    backgroundColor: message.includes('successfully') ? '#dcfce7' : '#fee2e2',
                    padding: '0.75rem',
                    marginBottom: '1rem',
                    borderRadius: '4px',
                    color: message.includes('successfully') ? '#166534' : '#991b1b',
                    textAlign: 'center'
                }}>{message}</div>}

                {mode === 'login' ? (
                    <form onSubmit={handleLogin}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Enter Admin Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '1rem' }}
                                placeholder="Default: admin123"
                                autoFocus
                            />
                        </div>
                        <button type="submit" disabled={loading} style={{
                            width: '100%', padding: '0.75rem',
                            backgroundColor: 'var(--color-primary, #000)',
                            color: 'white', border: 'none', borderRadius: '6px',
                            cursor: loading ? 'wait' : 'pointer',
                            fontWeight: '600'
                        }}>
                            {loading ? 'Verifying...' : 'Unlock Settings'}
                        </button>
                        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                            <button type="button" onClick={handleForgot} style={{ background: 'none', border: 'none', color: '#3b82f6', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.9rem' }}>
                                Forgot Password?
                            </button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleSave}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Owner Email</label>
                            <input
                                type="email"
                                value={settings.owner_email}
                                onChange={e => setSettings({ ...settings, owner_email: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '1rem' }}
                            />
                            <small style={{ color: '#64748b', display: 'block', marginTop: '0.25rem' }}>This email controls dashboard access.</small>
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>New Admin Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '1rem' }}
                                placeholder="Leave empty to keep current"
                            />
                        </div>
                        <button type="submit" disabled={loading} style={{
                            width: '100%', padding: '0.75rem',
                            backgroundColor: 'var(--color-primary, #000)',
                            color: 'white', border: 'none', borderRadius: '6px',
                            cursor: loading ? 'wait' : 'pointer',
                            fontWeight: '600'
                        }}>
                            {loading ? 'Saving Changes...' : 'Save Changes'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
