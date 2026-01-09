'use client';

import { useState, useEffect } from 'react';
import { Order } from '@/lib/types';
import FloorPlan from '@/components/FloorPlan';

export default function DashboardPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTable, setSelectedTable] = useState<number | null>(null);
    const [showMap, setShowMap] = useState(true);

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
                setOrders(data);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
        try {
            const response = await fetch(`/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                setOrders(orders.map(order => order.id === orderId ? { ...order, status: newStatus } : order));
            }
        } catch (error) { console.error(error); alert('Failed to update'); }
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
    // Paid orders go to History
    const activeOrders = orders.filter(o => o.status !== 'paid');

    const visibleOrders = selectedTable
        ? activeOrders.filter(o => parseInt(o.tableNumber) === selectedTable)
        : activeOrders;

    const sortedOrders = [...visibleOrders].sort((a, b) => {
        const statusPriority = { preparing: 0, new: 1, done: 2, paid: 3 };
        if (statusPriority[a.status] !== statusPriority[b.status]) {
            return statusPriority[a.status] - statusPriority[b.status];
        }
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    // Get active tables for the map (only non-paid orders occupy tables? Or maybe Done tables are still occupied?)
    // Usually Done = Eating. Paid = Left? Or Paid = Leaving.
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

            {/* Mini Map Section */}
            <div style={{
                marginBottom: '1.5rem',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: 'white'
            }}>
                <div
                    onClick={() => setShowMap(!showMap)}
                    style={{
                        padding: '0.75rem 1rem',
                        borderBottom: showMap ? '1px solid #f1f5f9' : 'none',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: '#64748b',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        userSelect: 'none'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>{showMap ? '▼' : '▶'}</span>
                        <span>Restaurant Overview (Read-Only)</span>
                    </div>
                    {showMap && <span style={{ fontSize: '0.8rem', fontWeight: 400 }}>Click table to filter</span>}
                </div>

                {showMap && (
                    <FloorPlan
                        activeTables={activeTableNumbers}
                        onTableClick={(id) => setSelectedTable(prev => prev === id ? null : id)}
                        readOnly={true}
                        scale={0.5}
                        height={300}
                    />
                )}
            </div>

            <div className="orders-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1rem',
                alignItems: 'start'
            }}>
                {sortedOrders.map(order => {
                    const isPreparing = order.status === 'preparing';
                    const isDone = order.status === 'done';

                    const cardStyle: React.CSSProperties = {
                        border: isPreparing ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                        backgroundColor: isPreparing ? '#fffbf0' : 'var(--color-bg)',
                        transform: isPreparing ? 'translateY(-4px)' : 'none',
                        boxShadow: isPreparing ? '0 8px 24px rgba(255,153,0,0.15)' : '0 2px 4px rgba(0,0,0,0.05)',
                        opacity: isDone ? 0.8 : 1, // Increased opacity for readability
                        fontSize: '0.95rem'
                    };

                    return (
                        <div key={order.id} className={`order-card ${order.status}`} style={cardStyle}>
                            <div className="order-header" style={{ marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
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
                                        <button className="btn btn-primary" style={{ flex: 1, backgroundColor: '#8b5cf6', color: 'white', border: 'none' }} onClick={() => updateOrderStatus(order.id, 'paid')}>
                                            💰 Mark as Paid
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {sortedOrders.length === 0 && (
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
