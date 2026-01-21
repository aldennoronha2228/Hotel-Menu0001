'use client';

import { useState, useEffect } from 'react';
import { MenuItem, Category } from '@/lib/types';
import './dashboard-menu.css';

export default function MenuManagementPage() {
    const [menuItems, setMenuItems] = useState<any[]>([]); // Using any for joined data flexibility
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null); // Extended MenuItem
    const [loading, setLoading] = useState(true);

    // Form States
    const [newItem, setNewItem] = useState({
        name: '',
        price: '',
        category_id: '',
        type: 'veg' as 'veg' | 'non-veg',
    });

    // Category Management State
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
    const [editingCategoryName, setEditingCategoryName] = useState('');

    // Fetch Data
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Categories
            const catRes = await fetch('/api/categories');
            if (catRes.ok) {
                const cats = await catRes.json();
                setCategories(cats);
                if (cats.length > 0 && !selectedCategory) {
                    setSelectedCategory(cats[0].id);
                    setNewItem(prev => ({ ...prev, category_id: cats[0].id }));
                }
            }

            // Fetch Items
            const itemRes = await fetch('/api/menu-items');
            if (itemRes.ok) {
                const items = await itemRes.json();
                setMenuItems(items);
            }
        } catch (error) {
            console.error('Error loading menu data:', error);
        } finally {
            setLoading(false);
        }
    };

    const categoryItems = menuItems.filter(item => item.category_id === selectedCategory);

    const toggleAvailability = async (item: any) => {
        const newStatus = !item.available;
        // Optimistic update
        setMenuItems(prev => prev.map(i => i.id === item.id ? { ...i, available: newStatus } : i));

        try {
            await fetch(`/api/menu-items/${item.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ available: newStatus })
            });
        } catch (error) {
            console.error('Failed to update status', error);
            // Revert on error
            setMenuItems(prev => prev.map(i => i.id === item.id ? { ...i, available: !newStatus } : i));
        }
    };

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/menu-items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newItem.name,
                    price: parseFloat(newItem.price),
                    category_id: newItem.category_id,
                    type: newItem.type
                })
            });

            if (response.ok) {
                const navItem = await response.json();
                setMenuItems([...menuItems, navItem]);
                setShowAddModal(false);
                setNewItem({
                    name: '',
                    price: '',
                    category_id: categories[0]?.id || '',
                    type: 'veg'
                });
                fetchData();
            } else {
                const errorData = await response.json().catch(() => ({}));
                alert(`Failed to add item: ${errorData.error || response.statusText}`);
            }
        } catch (error) {
            console.error('Error adding item:', error);
            alert('Error adding item: ' + (error instanceof Error ? error.message : String(error)));
        }
    };

    const handleEditItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem) return;

        try {
            const response = await fetch(`/api/menu-items/${editingItem.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: editingItem.name,
                    price: parseFloat(editingItem.price),
                    category_id: editingItem.category_id,
                    type: editingItem.type,
                    available: editingItem.available
                })
            });

            if (response.ok) {
                const updated = await response.json();
                setMenuItems(menuItems.map(i => i.id === updated.id ? updated : i));
                setShowEditModal(false);
                setEditingItem(null);
            } else {
                alert('Failed to update item');
            }
        } catch (error) {
            console.error(error);
            alert('Error updating item');
        }
    };

    const handleDeleteItem = async (itemId: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        try {
            const response = await fetch(`/api/menu-items/${itemId}`, { method: 'DELETE' });
            if (response.ok) {
                setMenuItems(menuItems.filter(i => i.id !== itemId));
                setShowEditModal(false);
                setEditingItem(null);
            } else {
                alert('Failed to delete item');
            }
        } catch (error) {
            console.error(error);
            alert('Error deleting item');
        }
    };

    // --- Category Management Handlers ---

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newCategoryName, display_order: categories.length })
            });
            if (res.ok) {
                const newCat = await res.json();
                setCategories([...categories, newCat]);
                setNewCategoryName('');
                if (!selectedCategory) setSelectedCategory(newCat.id);
            } else {
                alert('Failed to add category');
            }
        } catch (error) {
            console.error(error);
            alert('Error adding category');
        }
    };

    const handleUpdateCategory = async (id: string) => {
        if (!editingCategoryName.trim()) return;
        try {
            const res = await fetch(`/api/categories/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editingCategoryName })
            });
            if (res.ok) {
                const updated = await res.json();
                setCategories(categories.map(c => c.id === id ? updated : c));
                setEditingCategoryId(null);
                setEditingCategoryName('');
            } else {
                alert('Failed to update category');
            }
        } catch (error) {
            console.error(error);
            alert('Error updating category');
        }
    };

    const handleDeleteCategory = async (id: string, name: string) => {
        // Check if category has items
        const hasItems = menuItems.some(i => i.category_id === id);
        if (hasItems) {
            alert('Cannot delete category because it contains items. Please move or delete items first.');
            return;
        }

        if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

        try {
            const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
            if (res.ok) {
                const newCats = categories.filter(c => c.id !== id);
                setCategories(newCats);
                if (selectedCategory === id) {
                    setSelectedCategory(newCats[0]?.id || '');
                }
            } else {
                alert('Failed to delete category');
            }
        } catch (error) {
            console.error(error);
            alert('Error deleting category');
        }
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading menu...</div>;

    return (
        <>
            <header className="dashboard-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1>Menu Management</h1>
                        <p className="text-secondary">{menuItems.length} items total</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="btn btn-secondary" onClick={() => setShowCategoryModal(true)}>
                            Manage Categories
                        </button>
                        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                            Add Item
                        </button>
                    </div>
                </div>
            </header>

            <div className="menu-management">
                {/* Category List */}
                <div className="category-list">
                    <h3>Categories</h3>
                    <ul>
                        {categories.map(category => (
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
                                        onClick={() => toggleAvailability(item)}
                                    ></div>
                                    <span>{item.available ? 'Available' : 'Unavailable'}</span>
                                </div>

                                <button className="btn btn-secondary btn-sm" style={{ width: '100%' }} onClick={() => {
                                    setEditingItem(item);
                                    setShowEditModal(true);
                                }}>
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
                            <button className="btn-icon btn-secondary" onClick={() => setShowAddModal(false)}>✕</button>
                        </div>
                        <div className="modal-content">
                            <form onSubmit={handleAddItem}>
                                <div className="form-group">
                                    <label className="form-label">Item Name</label>
                                    <input
                                        type="text" className="form-input" required
                                        value={newItem.name}
                                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Price (₹)</label>
                                    <input
                                        type="number" className="form-input" required min="0" step="1"
                                        value={newItem.price}
                                        onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Category</label>
                                    <select
                                        className="form-select"
                                        value={newItem.category_id}
                                        onChange={(e) => setNewItem({ ...newItem, category_id: e.target.value })}
                                    >
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
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
                                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Add Item</button>
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
                            <button className="btn-icon btn-secondary" onClick={() => setShowEditModal(false)}>✕</button>
                        </div>
                        <div className="modal-content">
                            <form onSubmit={handleEditItem}>
                                <div className="form-group">
                                    <label className="form-label">Item Name</label>
                                    <input
                                        type="text" className="form-input" required
                                        value={editingItem.name}
                                        onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Price (₹)</label>
                                    <input
                                        type="number" className="form-input" required min="0" step="1"
                                        value={editingItem.price}
                                        onChange={(e) => setEditingItem({ ...editingItem, price: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Category</label>
                                    <select
                                        className="form-select"
                                        value={editingItem.category_id}
                                        onChange={(e) => setEditingItem({ ...editingItem, category_id: e.target.value })}
                                    >
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
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

            {/* Manage Categories Modal */}
            {showCategoryModal && (
                <>
                    <div className="modal-overlay active" onClick={() => setShowCategoryModal(false)}></div>
                    <div className="modal active">
                        <div className="modal-header">
                            <h2>Manage Categories</h2>
                            <button className="btn-icon btn-secondary" onClick={() => setShowCategoryModal(false)}>✕</button>
                        </div>
                        <div className="modal-content">
                            {/* Add Category Form */}
                            <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="New Category Name"
                                    required
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    style={{ flex: 1 }}
                                />
                                <button type="submit" className="btn btn-primary">Add</button>
                            </form>

                            {/* Categories List */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {categories.map(cat => (
                                    <div key={cat.id} style={{
                                        padding: '0.75rem',
                                        backgroundColor: '#f8fafc',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '6px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}>
                                        {editingCategoryId === cat.id ? (
                                            <div style={{ display: 'flex', gap: '0.5rem', flex: 1, marginRight: '1rem' }}>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    value={editingCategoryName}
                                                    onChange={(e) => setEditingCategoryName(e.target.value)}
                                                    style={{ padding: '0.25rem 0.5rem', height: '32px' }}
                                                />
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() => handleUpdateCategory(cat.id)}
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => setEditingCategoryId(null)}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <span style={{ fontWeight: 500 }}>{cat.name}</span>
                                        )}

                                        {editingCategoryId !== cat.id && (
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => {
                                                        setEditingCategoryId(cat.id);
                                                        setEditingCategoryName(cat.name);
                                                    }}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn btn-sm"
                                                    style={{ color: '#ef4444', borderColor: '#ef4444' }}
                                                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {categories.length === 0 && (
                                    <p className="text-secondary text-center">No categories yet</p>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
