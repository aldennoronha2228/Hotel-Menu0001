'use client';

import { useState } from 'react';
import { MenuItem } from '@/lib/types';
import { mockMenuItems, mockCategories } from '@/lib/mockData';

export default function MenuManagementPage() {
    const [menuItems, setMenuItems] = useState<MenuItem[]>(mockMenuItems);
    const [selectedCategory, setSelectedCategory] = useState('starters');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [newItem, setNewItem] = useState({
        name: '',
        price: '',
        category: 'starters',
        type: 'veg' as 'veg' | 'non-veg',
    });

    const categoryItems = menuItems.filter(item => item.category === selectedCategory);

    const toggleAvailability = (itemId: string) => {
        setMenuItems(menuItems.map(item =>
            item.id === itemId
                ? { ...item, available: !item.available }
                : item
        ));
    };

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();

        const item: MenuItem = {
            id: `item${Date.now()}`,
            name: newItem.name,
            price: parseFloat(newItem.price),
            category: newItem.category,
            type: newItem.type,
            available: true,
        };

        setMenuItems([...menuItems, item]);
        setShowAddModal(false);
        setNewItem({ name: '', price: '', category: 'starters', type: 'veg' });
    };

    const openEditModal = (item: MenuItem) => {
        setEditingItem(item);
        setShowEditModal(true);
    };

    const handleEditItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem) return;

        setMenuItems(menuItems.map(item =>
            item.id === editingItem.id ? editingItem : item
        ));
        setShowEditModal(false);
        setEditingItem(null);
    };

    const handleDeleteItem = (itemId: string) => {
        if (confirm('Are you sure you want to delete this item?')) {
            setMenuItems(menuItems.filter(item => item.id !== itemId));
            setShowEditModal(false);
            setEditingItem(null);
        }
    };

    return (
        <>
            <header className="dashboard-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1>Menu Management</h1>
                        <p className="text-secondary">{menuItems.length} items total</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                        Add Item
                    </button>
                </div>
            </header>

            <div className="menu-management">
                {/* Category List */}
                <div className="category-list">
                    <h3>Categories</h3>
                    <ul>
                        {mockCategories.map(category => (
                            <li
                                key={category.id}
                                className={selectedCategory === category.id ? 'active' : ''}
                                onClick={() => setSelectedCategory(category.id)}
                            >
                                {category.name}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Menu Items Grid */}
                <div>
                    <div className="menu-items-grid">
                        {categoryItems.map(item => (
                            <div key={item.id} className="menu-item-card">
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <div className={`veg-indicator ${item.type}`}></div>
                                    <h4>{item.name}</h4>
                                </div>
                                <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: '1rem' }}>
                                    ₹{item.price}
                                </p>

                                <div className="item-availability">
                                    <div
                                        className={`toggle-switch ${item.available ? 'active' : ''}`}
                                        onClick={() => toggleAvailability(item.id)}
                                    ></div>
                                    <span>{item.available ? 'Available' : 'Unavailable'}</span>
                                </div>

                                <button
                                    className="btn btn-secondary btn-sm"
                                    style={{ width: '100%' }}
                                    onClick={() => openEditModal(item)}
                                >
                                    Edit
                                </button>
                            </div>
                        ))}
                    </div>

                    {categoryItems.length === 0 && (
                        <p className="text-center text-secondary" style={{ marginTop: '3rem' }}>
                            No items in this category
                        </p>
                    )}
                </div>
            </div>

            {/* Add Item Modal */}
            {showAddModal && (
                <>
                    <div className="modal-overlay active" onClick={() => setShowAddModal(false)}></div>
                    <div className="modal active">
                        <div className="modal-header">
                            <h2>Add Menu Item</h2>
                            <button className="btn-icon btn-secondary" onClick={() => setShowAddModal(false)}>
                                ✕
                            </button>
                        </div>
                        <div className="modal-content">
                            <form onSubmit={handleAddItem}>
                                <div className="form-group">
                                    <label className="form-label">Item Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={newItem.name}
                                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Price (₹)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={newItem.price}
                                        onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                                        required
                                        min="0"
                                        step="1"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Category</label>
                                    <select
                                        className="form-select"
                                        value={newItem.category}
                                        onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                                    >
                                        {mockCategories.map(category => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Type</label>
                                    <select
                                        className="form-select"
                                        value={newItem.type}
                                        onChange={(e) => setNewItem({ ...newItem, type: e.target.value as 'veg' | 'non-veg' })}
                                    >
                                        <option value="veg">Vegetarian</option>
                                        <option value="non-veg">Non-Vegetarian</option>
                                    </select>
                                </div>

                                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                                    Add Item
                                </button>
                            </form>
                        </div>
                    </div>
                </>
            )}

            {/* Edit Item Modal */}
            {showEditModal && editingItem && (
                <>
                    <div className="modal-overlay active" onClick={() => setShowEditModal(false)}></div>
                    <div className="modal active">
                        <div className="modal-header">
                            <h2>Edit Menu Item</h2>
                            <button className="btn-icon btn-secondary" onClick={() => setShowEditModal(false)}>
                                ✕
                            </button>
                        </div>
                        <div className="modal-content">
                            <form onSubmit={handleEditItem}>
                                <div className="form-group">
                                    <label className="form-label">Item Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={editingItem.name}
                                        onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Price (₹)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={editingItem.price}
                                        onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) })}
                                        required
                                        min="0"
                                        step="1"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Category</label>
                                    <select
                                        className="form-select"
                                        value={editingItem.category}
                                        onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                                    >
                                        {mockCategories.map(category => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Type</label>
                                    <select
                                        className="form-select"
                                        value={editingItem.type}
                                        onChange={(e) => setEditingItem({ ...editingItem, type: e.target.value as 'veg' | 'non-veg' })}
                                    >
                                        <option value="veg">Vegetarian</option>
                                        <option value="non-veg">Non-Vegetarian</option>
                                    </select>
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                        Save Changes
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        style={{
                                            backgroundColor: 'var(--color-error)',
                                            color: 'white',
                                            border: 'none'
                                        }}
                                        onClick={() => handleDeleteItem(editingItem.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
