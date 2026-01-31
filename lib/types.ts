// ========================================
// TYPE DEFINITIONS
// ========================================

export interface MenuItem {
    id: string;
    name: string;
    price: number;
    category: string;
    type: 'veg' | 'non-veg';
    image?: string;
    available?: boolean;
}

export interface Category {
    id: string;
    name: string;
}

export interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

export interface Order {
    id: string;
    dailyOrderNumber?: number;
    restaurantId: string;
    tableNumber: string;
    items: CartItem[];
    total: number;
    status: 'new' | 'preparing' | 'done' | 'paid' | 'cancelled';
    timestamp: string;
    user_id?: string; // Unique identifier for the customer who placed this order
}

export interface Restaurant {
    id: string;
    name: string;
    logo?: string;
}
