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
    restaurantId: string;
    tableNumber: string;
    items: CartItem[];
    total: number;
    status: 'new' | 'preparing' | 'done';
    timestamp: string;
}

export interface Restaurant {
    id: string;
    name: string;
}
