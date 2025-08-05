import { Order, MenuItem } from '../types';

// Sample menu items - you should replace this with your actual menu data
const menuItems: MenuItem[] = [
    { id: 1, name: 'Burger', price: 150, available: true },
    { id: 2, name: 'Pizza', price: 300, available: true },
    { id: 3, name: 'Fries', price: 80, available: true },
    { id: 4, name: 'Soda', price: 50, available: true },
    // Add more menu items as needed
];

export const getItemPriceById = (itemId: string | number): number => {
    const id = typeof itemId === 'string' ? parseInt(itemId) : itemId;
    const item = menuItems.find(item => item.id === id);
    return item ? item.price : 0;
};

export const calculateTotalSales = (orders: Order[]): number => {
    return orders.reduce((total, order) => {
        const orderTotal = Object.entries(order.items).reduce((sum, [itemId, qty]) => {
            const itemPrice = getItemPriceById(itemId);
            return sum + (itemPrice * qty);
        }, 0);
        return total + orderTotal;
    }, 0);
};

export const getSalesByDate = (orders: Order[], date: string): Order[] => {
    return orders.filter(order => {
        const orderDate = new Date(order.createdAt).toDateString();
        return orderDate === new Date(date).toDateString();
    });
};

// Additional helper functions can be added here as needed.