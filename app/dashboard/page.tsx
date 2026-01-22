'use client';

import { useState, useEffect } from 'react';
import { Order } from '@/lib/types';
import FloorPlan from '@/components/FloorPlan';

export default function DashboardPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTable, setSelectedTable] = useState<number | null>(null);
    const [showMap, setShowMap] = useState(true);
    const [showAll, setShowAll] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tables, setTables] = useState<number[]>(Array.from({ length: 15 }, (_, i) => i + 1));

    // Load table count from DATABASE (with localStorage fallback)
    useEffect(() => {
        const loadTableCount = async () => {
            try {
                const response = await fetch('/api/settings');
                if (response.ok) {
                    const data = await response.json();
                    const count = data.table_count || 15;
                    setTables(Array.from({ length: count }, (_, i) => i + 1));
                } else {
                    // Fallback to localStorage
                    const savedCount = localStorage.getItem('tableCount');
                    if (savedCount) {
                        const count = parseInt(savedCount);
                        if (!isNaN(count) && count > 0) {
                            setTables(Array.from({ length: count }, (_, i) => i + 1));
                        } else {
                            setTables(Array.from({ length: 15 }, (_, i) => i + 1));
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to load table count, using localStorage:', error);
                const savedCount = localStorage.getItem('tableCount');
                if (savedCount) {
                    const count = parseInt(savedCount);
                    if (!isNaN(count) && count > 0) {
                        setTables(Array.from({ length: count }, (_, i) => i + 1));
                    } else {
                        setTables(Array.from({ length: 15 }, (_, i) => i + 1));
                    }
                }
            }
        };

        loadTableCount();
    }, []);

    // Fetch orders from API
    useEffect(() => {
        fetchOrders();

        // Poll for new orders every 5 seconds
        const interval = setInterval(fetchOrders, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await fetch('/api/orders');
            if (response.ok) {
                const data = await response.json();
                // Filter out paid and cancelled orders on the client side as well
                // This is a safety net in case the API filter doesn't work
                const activeData = data.filter((order: Order) =>
                    order.status !== 'paid' && order.status !== 'cancelled'
                );
                setOrders(activeData);
                setError(null);
            } else {
                const errorData = await response.json();
                console.error('Fetch error:', errorData);
                if (response.status === 401) {
                    setError(errorData.error || "Unauthorized: Check Owner Email Config in Deployment");
                } else {
                    setError(errorData.error || "Failed to fetch orders");
                }
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            // Don't set global error for network transient issues to avoid flashing
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
        console.log('updateOrderStatus called:', orderId, newStatus);
        try {
            const response = await fetch(`/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            console.log('Response status:', response.status, response.ok);

            if (response.ok) {
                console.log('Update successful! New status:', newStatus);
                // If marking as paid or cancelled, REMOVE from state completely
                if (newStatus === 'paid' || newStatus === 'cancelled') {
                    console.log('Removing order from state:', orderId);
                    setOrders(orders.filter(order => order.id !== orderId));
                } else {
                    // For other status changes, just update
                    setOrders(orders.map(order => order.id === orderId ? { ...order, status: newStatus } : order));
                }
                setError(null);
            } else {
                const responseText = await response.text();
                console.error('Failed to update - Status:', response.status);
                console.error('Response body (text):', responseText);

                let errorData: any = {};
                try {
                    errorData = JSON.parse(responseText);
                } catch (e) {
                    console.error('Could not parse response as JSON');
                }

                console.error('Failed to update:', errorData);
                alert('Failed to update: ' + (errorData.error || errorData.details || 'Unknown error'));
            }
        } catch (error) {
            console.error('Exception in updateOrderStatus:', error);
            alert('Failed to update: ' + error);
        }
    };


    const deleteOrder = async (orderId: string) => {
        if (!confirm('Are you sure you want to delete this order?')) return;
        try {
            const response = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
            if (response.ok) {
                setOrders(orders.filter(order => order.id !== orderId));
            } else { throw new Error('Failed to delete'); }
        } catch (error) { console.error(error); alert('Failed to delete'); }
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        return `${diffHours}h ${diffMins % 60}m ago`;
    };

    // Filter and Sort orders
    // Show only ACTIVE orders (new, preparing, done) in the Live Dashboard
    // Paid and cancelled orders are excluded from active view
    const activeOrders = orders.filter(o => o.status !== 'paid' && o.status !== 'cancelled');

    const visibleOrders = selectedTable
        ? activeOrders.filter(o => parseInt(o.tableNumber) === selectedTable)
        : activeOrders;

    const sortedOrders = [...visibleOrders].sort((a, b) => {
        const statusPriority = { preparing: 0, new: 1, done: 2, paid: 3, cancelled: 4 };
        if (statusPriority[a.status] !== statusPriority[b.status]) {
            return statusPriority[a.status] - statusPriority[b.status];
        }
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    const displayedOrders = showAll ? sortedOrders : sortedOrders.slice(0, 5);

    // Get active tables for the map
    const activeTableNumbers = [...new Set(
        activeOrders.map(o => parseInt(o.tableNumber))
    )];

    if (loading) return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading orders...</div>;

    return (
        <>
            <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                    <h1>Live Orders</h1>
                    <p className="text-secondary">
                        {orders.filter(o => o.status !== 'paid').length} active orders
                        {selectedTable && (
                            <span
                                onClick={() => setSelectedTable(null)}
                                style={{
                                    cursor: 'pointer',
                                    color: 'var(--color-primary)',
                                    fontWeight: 600,
                                    marginLeft: '0.5rem',
                                    backgroundColor: '#fff3cd',
                                    padding: '0.1rem 0.5rem',
                                    borderRadius: '4px'
                                }}
                            >
                                • Filtering Table {selectedTable} (Clear) ✕
                            </span>
                        )}
                    </p>
                </div>
            </header>

            {error && (
                <div style={{
                    backgroundColor: '#fee2e2',
                    border: '1px solid #ef4444',
                    color: '#b91c1c',
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    textAlign: 'center',
                    fontWeight: 600,
                    maxWidth: '800px',
                    margin: '0 auto 1.5rem auto'
                }}>
                    ⚠️ {error} <br />
                    <span style={{ fontWeight: 400, fontSize: '0.9rem', display: 'block', marginTop: '0.5rem' }}>
                        Action Required: Go to your Hosting Settings (Environment Variables) and ensure <code>OWNER_EMAIL</code> is set correctly.
                    </span>
                </div>
            )}

            {/* Mini Map Section */}
            <div style={{ marginBottom: '1.5rem' }}>
                <div style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: 'white'
                }}>
                    {/* Compact Header Bar */}
                    <div
                        onClick={() => setShowMap(!showMap)}
                        style={{
                            padding: '0.35rem 0.75rem',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            cursor: 'pointer',
                            userSelect: 'none',
                            backgroundColor: '#f1f5f9',
                            borderBottom: showMap ? '1px solid #e2e8f0' : 'none',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        <span style={{ fontSize: '0.7rem' }}>{showMap ? '▼' : '▶'}</span>
                        <span>Restaurant Overview</span>
                        {showMap && <span style={{ fontSize: '0.65rem', fontWeight: 400, marginLeft: 'auto', color: '#94a3b8' }}>Click table to filter</span>}
                    </div>

                    {/* Map Area */}
                    {showMap && (
                        <div style={{
                            width: '100%',
                            overflowX: 'auto',
                            backgroundColor: 'white',
                            padding: '1rem',
                            display: 'flex',
                            justifyContent: 'center'
                        }}>
                            <FloorPlan
                                tables={tables}
                                activeTables={activeTableNumbers}
                                onTableClick={(id) => setSelectedTable(prev => prev === id ? null : id)}
                                readOnly={true}
                                scale={0.55}
                                height={280}
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="orders-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1rem',
                alignItems: 'start'
            }}>
                {displayedOrders.map(order => {
                    const isPreparing = order.status === 'preparing';
                    const isDone = order.status === 'done';

                    const cardStyle: React.CSSProperties = {
                        border: isPreparing ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                        backgroundColor: isPreparing ? '#fffbf0' : 'var(--color-bg)',
                        transform: isPreparing ? 'translateY(-4px)' : 'none',
                        boxShadow: isPreparing ? '0 8px 24px rgba(255,153,0,0.15)' : '0 2px 4px rgba(0,0,0,0.05)',
                        opacity: isDone ? 0.8 : 1,
                        fontSize: '0.95rem'
                    };

                    return (
                        <div key={order.id} className={`order-card ${order.status}`} style={cardStyle}>
                            <div className="order-header" style={{ marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        {order.dailyOrderNumber && (
                                            <div style={{
                                                padding: '0.25rem 0.75rem',
                                                backgroundColor: '#3b82f6',
                                                color: 'white',
                                                borderRadius: '6px',
                                                fontSize: '0.875rem',
                                                fontWeight: 600
                                            }}>
                                                #{order.dailyOrderNumber}
                                            </div>
                                        )}
                                        <div className="table-badge" style={{
                                            padding: '0.25rem 0.75rem',
                                            backgroundColor: isPreparing ? 'var(--color-primary)' : 'var(--color-bg-secondary)',
                                            color: isPreparing ? 'white' : 'var(--color-text)'
                                        }}>
                                            Table {order.tableNumber}
                                        </div>
                                        <div className="order-time">{formatTime(order.timestamp)}</div>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); deleteOrder(order.id); }}
                                        style={{
                                            background: 'none', border: 'none', color: '#ef4444',
                                            cursor: 'pointer', fontSize: '1.2rem', padding: '0.2rem',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.7
                                        }}
                                        title="Delete Order"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>

                            <div className={`status-badge ${order.status}`} style={{ marginBottom: '1rem' }}>
                                {order.status === 'new' && 'New Order'}
                                {order.status === 'preparing' && '🔥 PREPARING'}
                                {order.status === 'done' && 'Done (Served)'}
                            </div>

                            <div className="order-items" style={{ marginBottom: '1rem', flex: 1 }}>
                                {order.items.map((item, index) => (
                                    <div key={index} className="order-item" style={{ padding: '0.35rem 0' }}>
                                        <span>{item.name}</span>
                                        <span className="item-quantity">×{item.quantity}</span>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', fontWeight: 600 }}>
                                <span>Total</span>
                                <span>₹{order.total}</span>
                            </div>

                            <div className="order-actions">
                                {order.status === 'new' && (
                                    <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => updateOrderStatus(order.id, 'preparing')}>
                                        Start Preparing
                                    </button>
                                )}
                                {order.status === 'preparing' && (
                                    <button className="btn btn-success" style={{ flex: 1, backgroundColor: '#10b981', color: 'white', padding: '1rem', fontSize: '1.1rem' }} onClick={() => updateOrderStatus(order.id, 'done')}>
                                        ✅ Mark as Done
                                    </button>
                                )}
                                {order.status === 'done' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                                        <div className="btn btn-secondary btn-sm" style={{ textAlign: 'center', opacity: 0.8, cursor: 'default', backgroundColor: '#f3f4f6', color: '#374151' }}>
                                            Waiting Payment
                                        </div>
                                        <button
                                            className="btn btn-primary"
                                            style={{ flex: 1, backgroundColor: '#8b5cf6', color: 'white', border: 'none' }}
                                            onClick={() => {
                                                if (confirm('Mark this order as paid? It will be removed from the active dashboard.')) {
                                                    updateOrderStatus(order.id, 'paid');
                                                }
                                            }}
                                        >
                                            💰 Mark as Paid
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {!showAll && sortedOrders.length > 5 && (
                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <button
                        className="btn btn-secondary"
                        onClick={() => setShowAll(true)}
                        style={{ width: '100%', maxWidth: '300px' }}
                    >
                        Show All Orders ({sortedOrders.length - 5} more)
                    </button>
                </div>
            )}

            {showAll && sortedOrders.length > 5 && (
                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <button
                        className="btn btn-secondary"
                        onClick={() => setShowAll(false)}
                        style={{ width: '100%', maxWidth: '300px' }}
                    >
                        Show Less
                    </button>
                </div>
            )}

            {sortedOrders.length === 0 && !error && (
                <div className="text-center text-secondary" style={{ marginTop: '3rem' }}>
                    <p>No active orders</p>
                    <p style={{ fontSize: 'var(--font-size-sm)', marginTop: '0.5rem' }}>
                        New orders will appear here
                    </p>
                </div>
            )}
        </>
    );
}
