'use client';

import { use, useState, useEffect } from 'react';
import { CartItem } from '@/lib/types';
import { mockRestaurant } from '@/lib/mockData';
import './menu-styles.css';

export default function MenuPage({
    params,
    searchParams
}: {
    params: Promise<{ restaurantId: string }>
    searchParams: Promise<{ table?: string }>
}) {
    const [mounted, setMounted] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [menuItems, setMenuItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentCategory, setCurrentCategory] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [showCart, setShowCart] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [typeFilter, setTypeFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showCategories, setShowCategories] = useState(false); // New state for category toggle

    // Bill / Active Orders State
    const [activeOrders, setActiveOrders] = useState<any[]>([]);
    const [showBill, setShowBill] = useState(false);

    // Unwrap promises
    const unwrappedParams = use(params);
    const unwrappedSearchParams = use(searchParams);

    const tableNumber = unwrappedSearchParams.table || '0';

    // Generate unique user ID for this customer session
    const [userId, setUserId] = useState<string>('');

    // Initialize user ID from localStorage or generate new one
    // Use a device-specific key, not table-specific, so each customer has their own unique ID
    useEffect(() => {
        const storageKey = 'menuUserId'; // Device-specific, not table-specific
        let storedUserId = localStorage.getItem(storageKey);

        if (!storedUserId) {
            // Generate a unique user ID: timestamp + random string
            storedUserId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            localStorage.setItem(storageKey, storedUserId);
        }

        setUserId(storedUserId);
    }, []); // Remove tableNumber dependency

    // Fetch Menu Data
    useEffect(() => {
        const fetchMenuData = async () => {
            try {
                const [catRes, itemRes] = await Promise.all([
                    fetch('/api/categories'),
                    fetch('/api/menu-items')
                ]);

                if (catRes.ok && itemRes.ok) {
                    let cats = await catRes.json();
                    const items = await itemRes.json();

                    // Fallback: If categories API returns empty (e.g. RLS issue), extract from items
                    if ((!cats || cats.length === 0) && items.length > 0) {
                        const uniqueCats = new Map();
                        items.forEach((item: any) => {
                            if (item.categories) {
                                uniqueCats.set(item.categories.id, item.categories);
                            }
                        });
                        cats = Array.from(uniqueCats.values())
                            .sort((a: any, b: any) => a.name.localeCompare(b.name));
                    }

                    setCategories(cats);
                    setMenuItems(items);
                    if (cats.length > 0) setCurrentCategory(cats[0].id);
                }
            } catch (error) {
                console.error('Failed to load menu', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMenuData();
    }, []);

    // Fetch Active Orders for this User (not entire table)
    useEffect(() => {
        if (!tableNumber || tableNumber === '0' || !userId) return;

        const fetchActiveOrders = async () => {
            try {
                // Fetch only THIS user's orders (not all orders from the table)
                const res = await fetch(`/api/orders?table=${tableNumber}&userId=${userId}`);
                if (res.ok) {
                    const data = await res.json();
                    setActiveOrders(data);
                }
            } catch (e) { console.error('Error fetching active orders', e); }
        };

        fetchActiveOrders();
        const interval = setInterval(fetchActiveOrders, 10000);
        return () => clearInterval(interval);
    }, [tableNumber, userId]);

    // Set mounted state and load cart from localStorage
    useEffect(() => {
        setMounted(true);
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (error) {
                console.error('Failed to load cart:', error);
            }
        }
    }, []);

    // Save cart to localStorage whenever it changes (only on client)
    useEffect(() => {
        if (mounted) {
            localStorage.setItem('cart', JSON.stringify(cart));
        }
    }, [cart, mounted]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (showCart || showConfirmation || showBill) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [showCart, showConfirmation, showBill]);

    const addToCart = (item: any) => {
        setCart([...cart, {
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: 1
        }]);
    };

    const increaseQuantity = (itemId: string) => {
        setCart(cart.map(item =>
            item.id === itemId
                ? { ...item, quantity: item.quantity + 1 }
                : item
        ));
    };

    const decreaseQuantity = (itemId: string) => {
        const cartItem = cart.find(item => item.id === itemId);
        if (!cartItem) return;

        if (cartItem.quantity > 1) {
            setCart(cart.map(item =>
                item.id === itemId
                    ? { ...item, quantity: item.quantity - 1 }
                    : item
            ));
        } else {
            removeFromCart(itemId);
        }
    };

    const removeFromCart = (itemId: string) => {
        setCart(cart.filter(item => item.id !== itemId));
    };

    const placeOrder = async () => {
        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    restaurantId: unwrappedParams.restaurantId,
                    tableNumber,
                    items: cart,
                    total: getTotalPrice(),
                    user_id: userId // Include user ID to track who placed this order
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to place order');
            }

            // Clear cart and show confirmation
            setCart([]);
            setShowCart(false);
            setShowConfirmation(true);

            // Fetch active orders immediately update UI
            // (The poll will catch it too, but this is faster)
            const activeRes = await fetch(`/api/orders?table=${tableNumber}&userId=${userId}`);
            if (activeRes.ok) setActiveOrders(await activeRes.json());

            if (data.demo) {
                console.log('Demo Mode:', data.message);
            }
        } catch (error: any) {
            console.error('Error placing order:', error);
            alert(error.message || 'Failed to place order. Please try again.');
        }
    };

    const getTotalItems = () => cart.reduce((sum, item) => sum + item.quantity, 0);
    const getTotalPrice = () => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const getCartItem = (itemId: string) => cart.find(item => item.id === itemId);

    // Filter orders to show only current user's orders
    const userOrders = activeOrders.filter(order => order.user_id === userId);
    const getBillTotal = () => userOrders.reduce((sum, order) => sum + order.total, 0);

    // Filter items by category, type (veg/non-veg), and search query
    const filteredItems = menuItems.filter(item => {
        const matchesCategory = searchQuery.trim() ? true : item.category_id === currentCategory;
        const matchesType = typeFilter === 'all' || item.type === typeFilter;
        const matchesSearch = searchQuery.trim()
            ? item.name.toLowerCase().includes(searchQuery.toLowerCase())
            : true;
        return matchesCategory && matchesType && matchesSearch;
    });

    if (loading) return <div className="p-4 text-center">Loading menu...</div>;


    return (
        <div className="menu-page-wrapper">
            {/* Header */}
            <header className="header-customer">
                <h1>{mockRestaurant.name}</h1>
                <p className="table-number">Table {tableNumber}</p>
                {userOrders.length > 0 && (
                    <button
                        className="btn btn-secondary"
                        onClick={() => setShowBill(true)}
                        style={{
                            marginTop: '0.75rem',
                            fontSize: '0.875rem',
                            padding: '0.5rem 1.25rem',
                            minHeight: '40px'
                        }}
                    >
                        View Bill (₹{getBillTotal()})
                    </button>
                )}
            </header>

            {/* Search Bar */}
            <div style={{
                padding: '1.25rem 1.5rem',
                backgroundColor: 'var(--color-bg-primary)',
                borderBottom: '1px solid var(--color-border-light)'
            }}>
                <div style={{
                    maxWidth: '640px',
                    margin: '0 auto',
                    position: 'relative'
                }}>
                    <input
                        type="text"
                        placeholder="Search dishes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.875rem 1rem 0.875rem 3rem',
                            fontSize: '0.9375rem',
                            fontFamily: 'var(--font-primary)',
                            color: 'var(--color-text-primary)',
                            backgroundColor: 'white',
                            border: '1.5px solid var(--color-border)',
                            borderRadius: 'var(--radius-full)',
                            outline: 'none',
                            transition: 'all 0.25s ease',
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = 'var(--color-basil-green)';
                            e.target.style.boxShadow = '0 2px 8px rgba(45, 122, 79, 0.12)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = 'var(--color-border)';
                            e.target.style.boxShadow = 'none';
                        }}
                    />
                    <span style={{
                        position: 'absolute',
                        left: '1.125rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: '1.125rem',
                        color: 'var(--color-text-muted)'
                    }}>
                        🔍
                    </span>
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            style={{
                                position: 'absolute',
                                right: '0.875rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'var(--color-basil-green)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 'var(--radius-full)',
                                width: '28px',
                                height: '28px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                fontWeight: '600'
                            }}
                        >
                            ×
                        </button>
                    )}
                </div>
                {searchQuery && (
                    <p style={{
                        maxWidth: '640px',
                        margin: '0.75rem auto 0',
                        fontSize: '0.875rem',
                        color: 'var(--color-text-secondary)',
                        textAlign: 'center'
                    }}>
                        Found {filteredItems.length} {filteredItems.length === 1 ? 'dish' : 'dishes'} matching "{searchQuery}"
                    </p>
                )}
            </div>

            {/* Category Navigation moved to Filter Row */}

            {/* Veg/Non-Veg Filter */}
            <div style={{
                display: 'flex',
                padding: '0.25rem 1rem 0 1rem',
                backgroundColor: 'var(--color-bg-primary)',
                justifyContent: 'center',
                flexWrap: 'wrap',
                gap: '0.5rem',
                marginBottom: 0
            }}>
                <button
                    className={`btn ${showCategories ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setShowCategories(!showCategories)}
                    style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        minHeight: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}
                >
                    <span>Categories</span>
                    <span style={{ fontSize: '10px' }}>{showCategories ? '▲' : '▼'}</span>
                </button>
                <button
                    className={`btn ${typeFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setTypeFilter('all')}
                    style={{
                        minWidth: '80px',
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        minHeight: '36px'
                    }}
                >
                    All
                </button>
                <button
                    className={`btn ${typeFilter === 'veg' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setTypeFilter('veg')}
                    style={{
                        minWidth: '80px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        minHeight: '36px'
                    }}
                >
                    <span className="veg-indicator veg" style={{ width: '12px', height: '12px', margin: 0 }}></span>
                    Veg
                </button>
                <button
                    className={`btn ${typeFilter === 'non-veg' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setTypeFilter('non-veg')}
                    style={{
                        minWidth: '100px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        minHeight: '36px'
                    }}
                >
                    <span className="veg-indicator non-veg" style={{ width: '12px', height: '12px', margin: 0 }}></span>
                    Non-Veg
                </button>
            </div>

            {/* Collapsible Category Nav */}
            {showCategories && (
                <nav style={{
                    display: 'flex',
                    gap: '8px',
                    overflowX: 'auto',
                    padding: '0 24px 8px 24px',
                    background: 'var(--color-bg-primary)',
                    borderBottom: '1px solid var(--color-border-light)',
                    boxShadow: 'none',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    zIndex: 35,
                    position: 'relative',
                    alignItems: 'center',
                    marginBottom: '0px',
                    marginTop: '4px',
                    animation: 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}>
                    <style jsx>{`
                        .category-nav::-webkit-scrollbar { display: none; }
                        @keyframes slideDown {
                            from { opacity: 0; transform: translateY(-8px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                    `}</style>
                    {categories.length === 0 && (
                        <div style={{ padding: '1rem', color: '#e53e3e', fontSize: '0.875rem', textAlign: 'center', width: '100%' }}>
                            ⚠️ Categories unavailable. Check database permissions.
                        </div>
                    )}
                    {categories.map(category => (
                        <button
                            key={category.id}
                            onClick={() => setCurrentCategory(category.id)}
                            style={{
                                padding: '8px 20px',
                                backgroundColor: currentCategory === category.id ? '#10b981' : 'white',
                                color: currentCategory === category.id ? 'white' : '#475569',
                                border: currentCategory === category.id ? 'none' : '1px solid #e2e8f0',
                                borderRadius: '9999px',
                                whiteSpace: 'nowrap',
                                fontSize: '14px',
                                fontWeight: 600,
                                flexShrink: 0,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: currentCategory === category.id ? '0 4px 6px rgba(16, 185, 129, 0.25)' : '0 1px 2px rgba(0,0,0,0.05)'
                            }}
                        >
                            {category.name || `Cat ${category.id}`}
                        </button>
                    ))}
                </nav>
            )}

            {/* Menu Items */}
            <div className="menu-container" style={{ paddingTop: '0.5rem' }}>
                {filteredItems.length === 0 ? (
                    <p className="text-center text-secondary">No items in this category</p>
                ) : (
                    filteredItems.map(item => {
                        const cartItem = getCartItem(item.id);
                        const isAvailable = item.available !== false;

                        return (
                            <div key={item.id} className={`menu-item ${!isAvailable ? 'unavailable' : ''}`}>
                                {item.image_url && (
                                    <img src={item.image_url} alt={item.name} className="menu-item-image" style={{ filter: !isAvailable ? 'grayscale(100%)' : 'none' }} />
                                )}
                                <div className="menu-item-info">
                                    <div className="menu-item-header">
                                        <div className={`veg-indicator ${item.type}`}></div>
                                        <h3 style={{ textDecoration: !isAvailable ? 'line-through' : 'none', color: !isAvailable ? '#94a3b8' : 'inherit' }}>{item.name}</h3>
                                    </div>
                                    <div className="menu-item-footer">
                                        <div className="menu-item-price">₹{item.price}</div>
                                        {!isAvailable ? (
                                            <button className="btn-add" disabled style={{ opacity: 0.4, cursor: 'not-allowed' }}>
                                                +
                                            </button>
                                        ) : !cartItem ? (
                                            <button
                                                className="btn-add"
                                                onClick={() => addToCart(item)}
                                            >
                                                +
                                            </button>
                                        ) : (
                                            <div className="quantity-controls">
                                                <button
                                                    className="quantity-btn"
                                                    onClick={() => decreaseQuantity(item.id)}
                                                >
                                                    −
                                                </button>
                                                <span className="quantity-value">{cartItem.quantity}</span>
                                                <button
                                                    className="quantity-btn"
                                                    onClick={() => increaseQuantity(item.id)}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Cart Bar */}
            <div className={`cart-bar ${cart.length > 0 ? 'active' : ''}`}>
                <div className="cart-bar-content">
                    <div className="cart-info">
                        <div className="cart-items-count">{getTotalItems()} items</div>
                        <div className="cart-total">₹{getTotalPrice()}</div>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowCart(true)}>
                        View Cart
                    </button>
                </div>
            </div>

            {/* Cart Modal */}
            {showCart && (
                <>
                    <div className="modal-overlay active" onClick={() => setShowCart(false)}></div>
                    <div className="modal active">
                        <div className="modal-wrapper">
                            <div className="modal-header">
                                <h2>Your Order</h2>
                                <button className="btn-icon btn-secondary" onClick={() => setShowCart(false)}>
                                    ✕
                                </button>
                            </div>
                            <div className="modal-content">
                                {cart.length === 0 ? (
                                    <p className="text-center text-secondary">Your cart is empty</p>
                                ) : (
                                    cart.map(item => (
                                        <div key={item.id} className="cart-item">
                                            <div className="cart-item-header">
                                                <h3>{item.name}</h3>
                                                <div className="cart-item-price">₹{item.price * item.quantity}</div>
                                            </div>
                                            <div className="cart-item-controls">
                                                <div className="quantity-controls">
                                                    <button
                                                        className="quantity-btn"
                                                        onClick={() => decreaseQuantity(item.id)}
                                                    >
                                                        −
                                                    </button>
                                                    <span className="quantity-value">{item.quantity}</span>
                                                    <button
                                                        className="quantity-btn"
                                                        onClick={() => increaseQuantity(item.id)}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <button
                                                    className="remove-item"
                                                    onClick={() => removeFromCart(item.id)}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            {cart.length > 0 && (
                                <div className="modal-footer">
                                    <div className="modal-footer-content">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                            <h3>Total</h3>
                                            <h3>₹{getTotalPrice()}</h3>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.75rem', flexDirection: 'column' }}>
                                            <button className="btn btn-primary" onClick={placeOrder} style={{ width: '100%' }}>
                                                Place Order
                                            </button>
                                            <button className="btn btn-secondary" onClick={() => setShowCart(false)} style={{ width: '100%' }}>
                                                Continue Browsing
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Bill Modal */}
            {showBill && (
                <>
                    <div className="modal-overlay active" onClick={() => setShowBill(false)}></div>
                    <div className="modal active">
                        <div className="modal-wrapper">
                            <div className="modal-header">
                                <h2>Your Bill</h2>
                                <button className="btn-icon btn-secondary" onClick={() => setShowBill(false)}>✕</button>
                            </div>
                            <div className="modal-content">
                                {userOrders.length === 0 ? (
                                    <p className="text-center text-secondary">You haven't placed any orders yet</p>
                                ) : (
                                    userOrders.map(order => (
                                        <div key={order.id} className="order-summary-card" style={{
                                            border: '1px solid #eee', padding: '1rem', marginBottom: '1rem', borderRadius: '8px'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <span className={`status-badge ${order.status}`}>{order.status.toUpperCase()}</span>
                                                <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: 600 }}>
                                                    {order.dailyOrderNumber ? `Order #${order.dailyOrderNumber}` : `Order #${order.id.slice(0, 4)}`}
                                                </span>
                                            </div>
                                            {order.items.map((img: any, idx: number) => (
                                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', marginBottom: '0.2rem' }}>
                                                    <span>{img.name} x{img.quantity}</span>
                                                    <span>₹{img.price * img.quantity}</span>
                                                </div>
                                            ))}
                                            <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed #ddd', display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                                                <span>Total</span>
                                                <span>₹{order.total}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="modal-footer">
                                <div className="modal-footer-content">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem' }}>
                                        <span>Grand Total</span>
                                        <span>₹{getBillTotal()}</span>
                                    </div>
                                    <button className="btn btn-secondary" onClick={() => setShowBill(false)} style={{ width: '100%' }}>
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Order Confirmation */}
            {showConfirmation && (
                <div className="modal active">
                    <div className="modal-content">
                        <div className="order-confirmation">
                            <div className="success-icon">✓</div>
                            <h2>Order Sent to Kitchen</h2>
                            <p>Please pay at the counter after dining</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => setShowConfirmation(false)}
                                    style={{ width: '100%' }}
                                >
                                    Back to Menu
                                </button>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setShowConfirmation(false);
                                        setShowBill(true);
                                    }}
                                    style={{ width: '100%' }}
                                >
                                    View Order Status
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
