'use client';

import { use, useState, useEffect } from 'react';
import { CartItem } from '@/lib/types';
import { mockRestaurant, mockCategories, getMenuItemsByCategory, getMenuItemById } from '@/lib/mockData';

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

    // Bill / Active Orders State
    const [activeOrders, setActiveOrders] = useState<any[]>([]);
    const [showBill, setShowBill] = useState(false);

    // Unwrap promises
    const unwrappedParams = use(params);
    const unwrappedSearchParams = use(searchParams);

    const tableNumber = unwrappedSearchParams.table || '0';

    // Fetch Menu Data
    useEffect(() => {
        const fetchMenuData = async () => {
            try {
                const [catRes, itemRes] = await Promise.all([
                    fetch('/api/categories'),
                    fetch('/api/menu-items')
                ]);

                if (catRes.ok && itemRes.ok) {
                    const cats = await catRes.json();
                    const items = await itemRes.json();
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

    // Fetch Active Orders for this Table
    useEffect(() => {
        if (!tableNumber || tableNumber === '0') return;

        const fetchActiveOrders = async () => {
            try {
                const res = await fetch(`/api/orders?table=${tableNumber}`);
                if (res.ok) {
                    const data = await res.json();
                    setActiveOrders(data);
                }
            } catch (e) { console.error('Error fetching active orders', e); }
        };

        fetchActiveOrders();
        const interval = setInterval(fetchActiveOrders, 10000);
        return () => clearInterval(interval);
    }, [tableNumber]);

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
                    total: getTotalPrice()
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
            const activeRes = await fetch(`/api/orders?table=${tableNumber}`);
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
    const getBillTotal = () => activeOrders.reduce((sum, order) => sum + order.total, 0);

    const filteredItems = menuItems.filter(item => item.category_id === currentCategory);

    if (loading) return <div className="p-4 text-center">Loading menu...</div>;

    return (
        <>
            {/* Header */}
            <header className="header-customer">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1>{mockRestaurant.name} (Online Menu)</h1>
                        <p className="table-number">Table {tableNumber}</p>
                    </div>
                    {activeOrders.length > 0 && (
                        <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setShowBill(true)}
                            style={{ backgroundColor: '#fff', color: 'var(--color-primary)', border: '1px solid var(--color-primary)' }}
                        >
                            View Bill (₹{getBillTotal()})
                        </button>
                    )}
                </div>
            </header>

            {/* Category Navigation */}
            <nav className="category-nav">
                {categories.map(category => (
                    <button
                        key={category.id}
                        className={`category-tab ${currentCategory === category.id ? 'active' : ''}`}
                        onClick={() => setCurrentCategory(category.id)}
                    >
                        {category.name}
                    </button>
                ))}
            </nav>

            {/* Menu Items */}
            <div className="menu-container">
                {filteredItems.length === 0 ? (
                    <p className="text-center text-secondary">No items in this category</p>
                ) : (
                    filteredItems.map(item => {
                        const cartItem = getCartItem(item.id);
                        const isAvailable = item.available !== false;

                        return (
                            <div key={item.id} className={`menu-item ${!isAvailable ? 'unavailable' : ''}`}>
                                <div className="menu-item-info">
                                    <div className="menu-item-header">
                                        <div className={`veg-indicator ${item.type}`}></div>
                                        <div>
                                            <h3 style={{ textDecoration: !isAvailable ? 'line-through' : 'none', color: !isAvailable ? '#94a3b8' : 'inherit' }}>{item.name}</h3>
                                            <div className="menu-item-price">₹{item.price}</div>
                                        </div>
                                    </div>
                                    <div className="menu-item-actions">
                                        {!isAvailable ? (
                                            <button className="btn btn-secondary btn-sm" disabled style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                                                Sold Out
                                            </button>
                                        ) : !cartItem ? (
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={() => addToCart(item)}
                                            >
                                                Add
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
                                {item.image_url && (
                                    <img src={item.image_url} alt={item.name} className="menu-item-image" style={{ filter: !isAvailable ? 'grayscale(100%)' : 'none' }} />
                                )}
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
                        <div className="modal-header">
                            <h2>Your Cart</h2>
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
                                    <button className="btn btn-primary" onClick={placeOrder} style={{ width: '100%' }}>
                                        Place Order
                                    </button>
                                    <button className="btn btn-secondary" onClick={() => setShowCart(false)} style={{ width: '100%' }}>
                                        Continue Browsing
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Bill Modal */}
            {showBill && (
                <>
                    <div className="modal-overlay active" onClick={() => setShowBill(false)}></div>
                    <div className="modal active">
                        <div className="modal-header">
                            <h2>Your Bill</h2>
                            <button className="btn-icon btn-secondary" onClick={() => setShowBill(false)}>✕</button>
                        </div>
                        <div className="modal-content">
                            {activeOrders.map(order => (
                                <div key={order.id} className="order-summary-card" style={{
                                    border: '1px solid #eee', padding: '1rem', marginBottom: '1rem', borderRadius: '8px'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span className={`status-badge ${order.status}`}>{order.status.toUpperCase()}</span>
                                        <span style={{ fontSize: '0.9rem', color: '#666' }}>Order #{order.id.slice(0, 4)}</span>
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
                            ))}
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
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    setShowConfirmation(false);
                                    setShowBill(true); // Show Status/Bill immediately after ordering
                                }}
                            >
                                View Order Status
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
