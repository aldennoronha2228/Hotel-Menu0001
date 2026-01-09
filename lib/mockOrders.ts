import { Order } from './types';

// ========================================
// MOCK ORDERS DATA
// ========================================

export const mockOrders: Order[] = [
    {
        id: 'order001',
        restaurantId: 'rest001',
        tableNumber: '3',
        items: [
            { id: 'item001', name: 'Paneer Tikka', price: 180, quantity: 2 },
            { id: 'item009', name: 'Butter Naan', price: 50, quantity: 3 },
            { id: 'item015', name: 'Mango Lassi', price: 70, quantity: 2 },
        ],
        total: 640,
        status: 'new',
        timestamp: new Date(Date.now() - 5 * 60000).toISOString(), // 5 minutes ago
    },
    {
        id: 'order002',
        restaurantId: 'rest001',
        tableNumber: '7',
        items: [
            { id: 'item004', name: 'Butter Chicken', price: 280, quantity: 1 },
            { id: 'item008', name: 'Jeera Rice', price: 120, quantity: 1 },
            { id: 'item012', name: 'Gulab Jamun', price: 80, quantity: 2 },
        ],
        total: 560,
        status: 'preparing',
        timestamp: new Date(Date.now() - 15 * 60000).toISOString(), // 15 minutes ago
    },
    {
        id: 'order003',
        restaurantId: 'rest001',
        tableNumber: '12',
        items: [
            { id: 'item005', name: 'Paneer Butter Masala', price: 240, quantity: 1 },
            { id: 'item006', name: 'Dal Makhani', price: 200, quantity: 1 },
            { id: 'item010', name: 'Garlic Naan', price: 60, quantity: 4 },
        ],
        total: 680,
        status: 'preparing',
        timestamp: new Date(Date.now() - 20 * 60000).toISOString(), // 20 minutes ago
    },
    {
        id: 'order004',
        restaurantId: 'rest001',
        tableNumber: '5',
        items: [
            { id: 'item002', name: 'Chicken Kebab', price: 220, quantity: 1 },
            { id: 'item013', name: 'Ice Cream', price: 100, quantity: 2 },
        ],
        total: 420,
        status: 'done',
        timestamp: new Date(Date.now() - 35 * 60000).toISOString(), // 35 minutes ago
    },
];
