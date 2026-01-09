'use client';

import { useState, useEffect } from 'react';
import { Order } from '@/lib/types';

export default function DashboardPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

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
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                // Update local state immediately
                setOrders(orders.map(order =>
                    order.id === orderId
                        ? { ...order, status: newStatus }
                        : order
                ));
            }
        } catch (error) {
            console.error('Error updating order:', error);
            alert('Failed to update order status');
        }
    };

    const deleteOrder = async (orderId: string) => {
        if (!confirm('Are you sure you want to delete this order?')) return;

        try {
            const response = await fetch(`/api/orders/${orderId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setOrders(orders.filter(order => order.id !== orderId));
            } else {
                throw new Error('Failed to delete');
            }
        } catch (error) {
            console.error('Error deleting order:', error);
            alert('Failed to delete order');
        }
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

    // Sort orders: PREPARING first (priority), then NEW, then DONE
    const sortedOrders = [...orders].sort((a, b) => {
        const statusPriority = { preparing: 0, new: 1, done: 2 };
        if (statusPriority[a.status] !== statusPriority[b.status]) {
            return statusPriority[a.status] - statusPriority[b.status];
        }
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
                <p>Loading orders...</p>
            </div>
        );
    }

    return (
        <>
            <header className="dashboard-header">
                <h1>Live Orders</h1>
                <p className="text-secondary">
                    {orders.filter(o => o.status !== 'done').length} active orders
                </p>
            </header>

            <div className="orders-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1.5rem',
                alignItems: 'start' // Prevents stretching
            }}>
                {sortedOrders.map(order => {
                    const isPreparing = order.status === 'preparing';
                    const isDone = order.status === 'done';

                    // Dynamic styles based on status
                    const cardStyle: React.CSSProperties = isPreparing ? {
                        gridColumn: 'span 2', // Take up 2 columns
                        transform: 'scale(1.02)',
                        border: '2px solid var(--color-primary)',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                        fontSize: '1.1rem'
                    } : isDone ? {
                        opacity: 0.7,
                        transform: 'scale(0.95)',
                        fontSize: '0.9rem'
                    } : {};

                    return (
                        <div
                            key={order.id}
                            className={`order-card ${order.status}`}
                            style={cardStyle}
                        >
                            <div className="order-header" style={{ marginBottom: isPreparing ? '1.5rem' : '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <div className="table-badge" style={{
                                            fontSize: isPreparing ? '1.2rem' : '1rem',
                                            padding: isPreparing ? '0.5rem 1rem' : '0.25rem 0.75rem',
                                            backgroundColor: isPreparing ? 'var(--color-primary)' : 'var(--color-bg-secondary)',
                                            color: isPreparing ? 'white' : 'var(--color-text)'
                                        }}>
                                            Table {order.tableNumber}
                                        </div>
                                        <div className="order-time">{formatTime(order.timestamp)}</div>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteOrder(order.id);
                                        }}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#ef4444',
                                            cursor: 'pointer',
                                            fontSize: '1.2rem',
                                            padding: '0.2rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            opacity: 0.7
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
                                {order.status === 'done' && 'Done'}
                            </div>

                            <div className="order-items" style={{ marginBottom: isPreparing ? '1.5rem' : '1rem' }}>
                                {order.items.map((item, index) => (
                                    <div key={index} className="order-item" style={{
                                        padding: isPreparing ? '0.75rem 0' : '0.5rem 0',
                                        fontSize: isPreparing ? '1.1rem' : '1rem'
                                    }}>
                                        <span>{item.name}</span>
                                        <span className="item-quantity" style={{
                                            backgroundColor: isPreparing ? 'var(--color-primary-light)' : '#eee',
                                            fontSize: isPreparing ? '1rem' : '0.85rem'
                                        }}>×{item.quantity}</span>
                                    </div>
                                ))}
                            </div>

                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: isPreparing ? '1.5rem' : '1rem',
                                fontWeight: 600,
                                fontSize: isPreparing ? '1.25rem' : '1rem'
                            }}>
                                <span>Total</span>
                                <span>₹{order.total}</span>
                            </div>

                            <div className="order-actions">
                                {order.status === 'new' && (
                                    <button
                                        className="btn btn-primary"
                                        style={{ flex: 1 }}
                                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                                    >
                                        Start Preparing
                                    </button>
                                )}
                                {order.status === 'preparing' && (
                                    <button
                                        className="btn btn-success"
                                        style={{
                                            flex: 1,
                                            backgroundColor: '#10b981',
                                            color: 'white',
                                            padding: '1rem',
                                            fontSize: '1.1rem'
                                        }}
                                        onClick={() => updateOrderStatus(order.id, 'done')}
                                    >
                                        ✅ Mark as Done
                                    </button>
                                )}
                                {order.status === 'done' && (
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        style={{ flex: 1 }}
                                        disabled
                                    >
                                        Completed
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {sortedOrders.length === 0 && (
                <div className="text-center text-secondary" style={{ marginTop: '3rem' }}>
                    <p>No orders yet</p>
                    <p style={{ fontSize: 'var(--font-size-sm)', marginTop: '0.5rem' }}>
                        Orders will appear here when customers place them
                    </p>
                </div>
            )}
        </>
    );
}
