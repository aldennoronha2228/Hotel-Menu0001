'use client';

import { useState, useEffect } from 'react';
import { Order } from '@/lib/types';

export default function OrderHistoryPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState('');
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        filterOrdersByDate();
    }, [selectedDate, orders]);

    const fetchOrders = async () => {
        try {
            const response = await fetch('/api/orders');
            if (response.ok) {
                const data = await response.json();
                setOrders(data);

                // Set today's date as default
                const today = new Date().toISOString().split('T')[0];
                setSelectedDate(today);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterOrdersByDate = () => {
        if (!selectedDate) {
            setFilteredOrders(orders);
            return;
        }

        const filtered = orders.filter(order => {
            const orderDate = new Date(order.timestamp).toISOString().split('T')[0];
            return orderDate === selectedDate && order.status === 'done';
        });

        setFilteredOrders(filtered);
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatDate = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getTotalRevenue = () => {
        return filteredOrders.reduce((sum, order) => sum + order.total, 0);
    };

    const getOrdersByStatus = (status: Order['status']) => {
        return filteredOrders.filter(order => order.status === status).length;
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
                <p>Loading order history...</p>
            </div>
        );
    }

    return (
        <>
            <header className="dashboard-header">
                <h1>Order History</h1>
                <p className="text-secondary">View past orders by date</p>
            </header>

            {/* Date Filter */}
            <div style={{
                backgroundColor: 'var(--color-bg)',
                padding: 'var(--spacing-lg)',
                borderRadius: 'var(--border-radius-lg)',
                marginBottom: 'var(--spacing-xl)',
                maxWidth: 'var(--max-width-md)'
            }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Select Date</label>
                    <input
                        type="date"
                        className="form-input"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                    />
                </div>
            </div>

            {/* Summary Cards */}
            {filteredOrders.length > 0 && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 'var(--spacing-lg)',
                    marginBottom: 'var(--spacing-xl)'
                }}>
                    <div style={{
                        backgroundColor: 'var(--color-bg)',
                        padding: 'var(--spacing-lg)',
                        borderRadius: 'var(--border-radius-lg)',
                        textAlign: 'center'
                    }}>
                        <h3 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: '0.5rem' }}>
                            {filteredOrders.length}
                        </h3>
                        <p className="text-secondary">Total Orders</p>
                    </div>

                    <div style={{
                        backgroundColor: 'var(--color-bg)',
                        padding: 'var(--spacing-lg)',
                        borderRadius: 'var(--border-radius-lg)',
                        textAlign: 'center'
                    }}>
                        <h3 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: '0.5rem' }}>
                            ₹{getTotalRevenue()}
                        </h3>
                        <p className="text-secondary">Total Revenue</p>
                    </div>

                    <div style={{
                        backgroundColor: 'var(--color-bg)',
                        padding: 'var(--spacing-lg)',
                        borderRadius: 'var(--border-radius-lg)',
                        textAlign: 'center'
                    }}>
                        <h3 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: '0.5rem' }}>
                            {getOrdersByStatus('done')}
                        </h3>
                        <p className="text-secondary">Completed</p>
                    </div>
                </div>
            )}

            {/* Orders Table */}
            {filteredOrders.length === 0 ? (
                <div className="text-center text-secondary" style={{ marginTop: '3rem' }}>
                    <p>No orders found for {selectedDate ? formatDate(selectedDate + 'T00:00:00') : 'this date'}</p>
                </div>
            ) : (
                <div style={{
                    backgroundColor: 'var(--color-bg)',
                    borderRadius: 'var(--border-radius-lg)',
                    overflow: 'hidden'
                }}>
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse'
                    }}>
                        <thead>
                            <tr style={{
                                backgroundColor: 'var(--color-bg-secondary)',
                                borderBottom: '1px solid var(--color-border)'
                            }}>
                                <th style={{ padding: 'var(--spacing-md)', textAlign: 'left' }}>Time</th>
                                <th style={{ padding: 'var(--spacing-md)', textAlign: 'left' }}>Table</th>
                                <th style={{ padding: 'var(--spacing-md)', textAlign: 'left' }}>Items</th>
                                <th style={{ padding: 'var(--spacing-md)', textAlign: 'left' }}>Status</th>
                                <th style={{ padding: 'var(--spacing-md)', textAlign: 'right' }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map(order => (
                                <tr key={order.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                    <td style={{ padding: 'var(--spacing-md)' }}>
                                        {formatTime(order.timestamp)}
                                    </td>
                                    <td style={{ padding: 'var(--spacing-md)', fontWeight: 600 }}>
                                        Table {order.tableNumber}
                                    </td>
                                    <td style={{ padding: 'var(--spacing-md)' }}>
                                        <div style={{ fontSize: 'var(--font-size-sm)' }}>
                                            {order.items.map((item, idx) => (
                                                <div key={idx}>
                                                    {item.name} ×{item.quantity}
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td style={{ padding: 'var(--spacing-md)' }}>
                                        <span className={`status-badge ${order.status}`}>
                                            {order.status === 'new' && 'New'}
                                            {order.status === 'preparing' && 'Preparing'}
                                            {order.status === 'done' && 'Done'}
                                        </span>
                                    </td>
                                    <td style={{ padding: 'var(--spacing-md)', textAlign: 'right', fontWeight: 600 }}>
                                        ₹{order.total}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}
