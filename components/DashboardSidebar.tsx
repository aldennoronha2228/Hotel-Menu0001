'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignOutButton } from '@clerk/nextjs';

export default function DashboardSidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const navItems = [
        { href: '/dashboard', label: 'Live Orders' },
        { href: '/dashboard/history', label: 'Order History' },
        { href: '/dashboard/menu', label: 'Menu Management' },
        { href: '/dashboard/tables', label: 'Tables' },
    ];

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                className="mobile-menu-toggle"
                onClick={() => setIsOpen(true)}
                aria-label="Open Menu"
            >
                <span style={{ fontSize: '1.5rem' }}>☰</span>
            </button>

            {/* Overlay */}
            <div
                className={`sidebar-overlay ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(false)}
            />

            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-logo">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h1>Dashboard</h1>
                        {/* Close button */}
                        <button
                            className="sidebar-close"
                            onClick={() => setIsOpen(false)}
                            aria-label="Close Menu"
                        >
                            ✕
                        </button>
                    </div>
                </div>
                <nav>
                    <ul className="sidebar-nav">
                        {navItems.map(item => (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={pathname === item.href ? 'active' : ''}
                                    onClick={() => setIsOpen(false)}
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
                                    color: 'var(--color-text-secondary)',
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
        </>
    );
}
