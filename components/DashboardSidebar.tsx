'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignOutButton } from '@clerk/nextjs';

export default function DashboardSidebar() {
    const pathname = usePathname();

    const navItems = [
        { href: '/dashboard', label: 'Live Orders' },
        { href: '/dashboard/menu', label: 'Menu Management' },
        { href: '/dashboard/tables', label: 'Tables' },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <h1>Dashboard</h1>
            </div>
            <nav>
                <ul className="sidebar-nav">
                    {navItems.map(item => (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                className={pathname === item.href ? 'active' : ''}
                            >
                                {item.label}
                            </Link>
                        </li>
                    ))}
                    <li>
                        <SignOutButton>
                            <button style={{
                                width: '100%',
                                textAlign: 'left',
                                background: 'none',
                                border: 'none',
                                padding: 'var(--spacing-md) var(--spacing-lg)',
                                cursor: 'pointer',
                                color: 'var(--color-text)',
                                fontSize: 'inherit',
                                fontFamily: 'inherit'
                            }}>
                                Logout
                            </button>
                        </SignOutButton>
                    </li>
                </ul>
            </nav>
        </aside>
    );
}
