import { Restaurant, Category, MenuItem } from './types';

// ========================================
// MOCK DATA
// ========================================

export const mockRestaurant: Restaurant = {
    id: 'rest001',
    name: 'Basil Cafe',
};

export const mockCategories: Category[] = [
    { id: 'starters', name: 'Starters' },
    { id: 'mains', name: 'Main Course' },
    { id: 'rice', name: 'Rice & Breads' },
    { id: 'desserts', name: 'Desserts' },
    { id: 'beverages', name: 'Beverages' },
];

export const mockMenuItems: MenuItem[] = [
    // Starters
    {
        id: 'item001',
        name: 'Paneer Tikka',
        price: 180,
        category: 'starters',
        type: 'veg',
        available: true,
    },
    {
        id: 'item002',
        name: 'Chicken Kebab',
        price: 220,
        category: 'starters',
        type: 'non-veg',
        available: true,
    },
    {
        id: 'item003',
        name: 'Vegetable Spring Rolls',
        price: 150,
        category: 'starters',
        type: 'veg',
        available: true,
    },
    // Mains
    {
        id: 'item004',
        name: 'Butter Chicken',
        price: 280,
        category: 'mains',
        type: 'non-veg',
        available: true,
    },
    {
        id: 'item005',
        name: 'Paneer Butter Masala',
        price: 240,
        category: 'mains',
        type: 'veg',
        available: true,
    },
    {
        id: 'item006',
        name: 'Dal Makhani',
        price: 200,
        category: 'mains',
        type: 'veg',
        available: true,
    },
    {
        id: 'item007',
        name: 'Chicken Curry',
        price: 260,
        category: 'mains',
        type: 'non-veg',
        available: true,
    },
    // Rice & Breads
    {
        id: 'item008',
        name: 'Jeera Rice',
        price: 120,
        category: 'rice',
        type: 'veg',
        available: true,
    },
    {
        id: 'item009',
        name: 'Butter Naan',
        price: 50,
        category: 'rice',
        type: 'veg',
        available: true,
    },
    {
        id: 'item010',
        name: 'Garlic Naan',
        price: 60,
        category: 'rice',
        type: 'veg',
        available: true,
    },
    {
        id: 'item011',
        name: 'Biryani',
        price: 280,
        category: 'rice',
        type: 'non-veg',
        available: true,
    },
    // Desserts
    {
        id: 'item012',
        name: 'Gulab Jamun',
        price: 80,
        category: 'desserts',
        type: 'veg',
        available: true,
    },
    {
        id: 'item013',
        name: 'Ice Cream',
        price: 100,
        category: 'desserts',
        type: 'veg',
        available: true,
    },
    {
        id: 'item014',
        name: 'Rasgulla',
        price: 70,
        category: 'desserts',
        type: 'veg',
        available: true,
    },
    // Beverages
    {
        id: 'item015',
        name: 'Mango Lassi',
        price: 70,
        category: 'beverages',
        type: 'veg',
        available: true,
    },
    {
        id: 'item016',
        name: 'Fresh Lime Soda',
        price: 60,
        category: 'beverages',
        type: 'veg',
        available: true,
    },
    {
        id: 'item017',
        name: 'Masala Chai',
        price: 40,
        category: 'beverages',
        type: 'veg',
        available: true,
    },
];

// Helper function to get menu items by category
export function getMenuItemsByCategory(categoryId: string): MenuItem[] {
    return mockMenuItems.filter(item => item.category === categoryId && item.available);
}

// Helper function to get menu item by ID
export function getMenuItemById(itemId: string): MenuItem | undefined {
    return mockMenuItems.find(item => item.id === itemId);
}
