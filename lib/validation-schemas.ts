import { z } from 'zod';

/**
 * Schema for validating order creation requests
 */
export const createOrderSchema = z.object({
    restaurantId: z.string().min(1, 'Restaurant ID is required'),
    tableNumber: z.string().min(1, 'Table number is required'),
    items: z.array(
        z.object({
            id: z.string(),
            name: z.string().min(1, 'Item name is required'),
            price: z.number().positive('Price must be positive'),
            quantity: z.number().int().positive('Quantity must be a positive integer')
        })
    ).min(1, 'At least one item is required'),
    total: z.number().positive('Total must be positive'),
    user_id: z.string().optional().nullable()
});

/**
 * Schema for validating order update requests
 */
export const updateOrderSchema = z.object({
    status: z.enum(['new', 'preparing', 'ready', 'delivered', 'paid', 'cancelled']).optional(),
    items: z.array(
        z.object({
            id: z.string(),
            name: z.string().min(1, 'Item name is required'),
            price: z.number().positive('Price must be positive'),
            quantity: z.number().int().positive('Quantity must be a positive integer')
        })
    ).optional(),
    total: z.number().positive('Total must be positive').optional()
}).refine(
    (data) => data.status || data.items || data.total,
    { message: 'At least one field (status, items, or total) must be provided' }
);

/**
 * Type exports for TypeScript usage
 */
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
