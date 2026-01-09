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
    const [currentCategory, setCurrentCategory] = useState('starters');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [showCart, setShowCart] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    // Unwrap promises
    const unwrappedParams = use(params);
    const unwrappedSearchParams = use(searchParams);

    const tableNumber = unwrappedSearchParams.table || '0';
    const menuItems = getMenuItemsByCategory(currentCategory);

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
        if (showCart || showConfirmation) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [showCart, showConfirmation]);

    const addToCart = (itemId: string) => {
        const item = getMenuItemById(itemId);
        if (!item) return;

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

            // If in demo mode, show a console message
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

    return (
        <>
            {/* Header */}
            <header className="header-customer">
                <h1>{mockRestaurant.name}</h1>
                <p className="table-number">Table {tableNumber}</p>
            </header>

            {/* Category Navigation */}
            <nav className="category-nav">
                {mockCategories.map(category => (
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
                {menuItems.length === 0 ? (
                    <p className="text-center text-secondary">No items in this category</p>
                ) : (
                    menuItems.map(item => {
                        const cartItem = getCartItem(item.id);
                        return (
                            <div key={item.id} className="menu-item">
                                <div className="menu-item-info">
                                    <div className="menu-item-header">
                                        <div className={`veg-indicator ${item.type}`}></div>
                                        <div>
                                            <h3>{item.name}</h3>
                                            <div className="menu-item-price">₹{item.price}</div>
                                        </div>
                                    </div>
                                    <div className="menu-item-actions">
                                        {!cartItem ? (
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={() => addToCart(item.id)}
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
                                {item.image && (
                                    <img src={item.image} alt={item.name} className="menu-item-image" />
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
                                onClick={() => setShowConfirmation(false)}
                            >
                                Back to Menu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
