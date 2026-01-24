'use client';

import { useState, useEffect } from 'react';
import { MenuItem, Order, CartItem, Category } from '@/lib/types';

interface AddItemsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentOrder: Order;
    onUpdateOrder: (orderId: string, updatedItems: CartItem[], newTotal: number) => Promise<void>;
}

export default function AddItemsModal({ isOpen, onClose, currentOrder, onUpdateOrder }: AddItemsModalProps) {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [addedItems, setAddedItems] = useState<{ [key: string]: number }>({});
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchMenu();
            setAddedItems({}); // Reset on open
        }
    }, [isOpen]);

    const fetchMenu = async () => {
        try {
            setLoading(true);
            const [itemsRes, catsRes] = await Promise.all([
                fetch('/api/menu-items?details=true'), // Assuming this returns logic
                fetch('/api/categories')
            ]);

            if (itemsRes.ok && catsRes.ok) {
                const items = await itemsRes.json();
                const cats = await catsRes.json();
                setMenuItems(items);
                setCategories(cats);
            }
        } catch (error) {
            console.error("Failed to load menu", error);
        } finally {
            setLoading(false);
        }
    };

    const handleQuantityChange = (itemId: string, delta: number) => {
        setAddedItems(prev => {
            const currentQty = prev[itemId] || 0;
            const newQty = Math.max(0, currentQty + delta);
            if (newQty === 0) {
                const { [itemId]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [itemId]: newQty };
        });
    };

    const handleSave = async () => {
        // Merge current order items with new items
        // We need to be careful: if the item already exists in the order, do we increment quantity?
        // Or do we add it as a separate line item?
        // Usually, merging is better.

        let newItems = [...currentOrder.items];
        let runningTotal = currentOrder.total;

        Object.entries(addedItems).forEach(([itemId, qty]) => {
            const menuItem = menuItems.find(m => m.id === itemId);
            if (!menuItem) return;

            const existingItemIndex = newItems.findIndex(i => i.id === itemId);
            if (existingItemIndex >= 0) {
                newItems[existingItemIndex].quantity += qty;
            } else {
                newItems.push({
                    id: menuItem.id,
                    name: menuItem.name,
                    price: menuItem.price,
                    quantity: qty
                });
            }
            runningTotal += (menuItem.price * qty);
        });

        await onUpdateOrder(currentOrder.id, newItems, runningTotal);
        onClose();
    };

    // Filter Items
    const filteredItems = menuItems.filter(item => {
        const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch && item.available !== false;
    });

    if (!isOpen) return null;

    return (
        <div className="modal-overlay active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="modal-content" style={{
                backgroundColor: 'white',
                width: '90%',
                maxWidth: '600px',
                maxHeight: '85vh',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                padding: 0,
                overflow: 'hidden'
            }}>
                {/* Header */}
                <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Add Items to Order</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                </div>

                {/* Body */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>

                    {/* Search & Filter */}
                    <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <input
                            type="text"
                            placeholder="Search items..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ flex: 1, padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                        />
                        <select
                            value={activeCategory}
                            onChange={(e) => setActiveCategory(e.target.value)}
                            style={{ padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                        >
                            <option value="all">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    {loading ? <div className="text-center">Loading menu...</div> : (
                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                            {filteredItems.map(item => {
                                const qty = addedItems[item.id] || 0;
                                return (
                                    <div key={item.id} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '0.75rem',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px'
                                    }}>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{item.name}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>₹{item.price}</div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {qty > 0 && (
                                                <>
                                                    <button
                                                        onClick={() => handleQuantityChange(item.id, -1)}
                                                        className="btn-secondary"
                                                        style={{ padding: '0.25rem 0.6rem' }}
                                                    >-</button>
                                                    <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: 'bold' }}>{qty}</span>
                                                </>
                                            )}
                                            <button
                                                onClick={() => handleQuantityChange(item.id, 1)}
                                                className="btn-primary"
                                                style={{ padding: '0.25rem 0.6rem' }}
                                            >+</button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: '1rem', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button onClick={onClose} className="btn btn-secondary">Cancel</button>
                    <button
                        onClick={handleSave}
                        className="btn btn-primary"
                        disabled={Object.keys(addedItems).length === 0}
                    >
                        Add Selected Items
                    </button>
                </div>
            </div>
        </div>
    );
}
