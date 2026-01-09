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

    // Sort orders: new first, then preparing, then done
    const sortedOrders = [...orders].sort((a, b) => {
        const statusPriority = { new: 0, preparing: 1, done: 2 };
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

            <div className="orders-grid">
                {sortedOrders.map(order => (
                    <div key={order.id} className={`order-card ${order.status === 'new' ? 'new' : ''}`}>
                        <div className="order-header">
                            <div className="table-badge">Table {order.tableNumber}</div>
                            <div className="order-time">{formatTime(order.timestamp)}</div>
                        </div>

                        <div className={`status-badge ${order.status}`}>
                            {order.status === 'new' && 'New Order'}
                            {order.status === 'preparing' && 'Preparing'}
                            {order.status === 'done' && 'Done'}
                        </div>

                        <div className="order-items">
                            {order.items.map((item, index) => (
                                <div key={index} className="order-item">
                                    <span>{item.name}</span>
                                    <span className="item-quantity">×{item.quantity}</span>
                                </div>
                            ))}
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '1rem',
                            fontWeight: 600
                        }}>
                            <span>Total</span>
                            <span>₹{order.total}</span>
                        </div>

                        <div className="order-actions">
                            {order.status === 'new' && (
                                <button
                                    className="btn btn-primary btn-sm"
                                    style={{ flex: 1 }}
                                    onClick={() => updateOrderStatus(order.id, 'preparing')}
                                >
                                    Mark as Preparing
                                </button>
                            )}
                            {order.status === 'preparing' && (
                                <button
                                    className="btn btn-primary btn-sm"
                                    style={{ flex: 1 }}
                                    onClick={() => updateOrderStatus(order.id, 'done')}
                                >
                                    Mark as Done
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
                ))}
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
