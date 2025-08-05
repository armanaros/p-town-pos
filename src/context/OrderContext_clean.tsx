import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order, SalesData, MenuItem } from '../types';

interface ProcessedOrder {
    id: number;
    items: Record<number, number>;
    status: 'pending' | 'preparing' | 'ready' | 'served' | 'completed';
    orderType: 'dine-in' | 'take-out';
    createdAt: string;
    updatedAt?: string;
    total: number;
    cashierName: string;
    customerName?: string;
    tableNumber?: number;
    estimatedTime?: number; // in minutes
}

interface OrderContextType {
    processedOrders: ProcessedOrder[];
    salesData: SalesData[];
    menuItems: MenuItem[];
    addOrder: (order: Omit<ProcessedOrder, 'id' | 'createdAt' | 'status'>) => void;
    updateOrderStatus: (orderId: number, status: ProcessedOrder['status']) => void;
    getOrdersByStatus: (status: ProcessedOrder['status']) => ProcessedOrder[];
    getQueueOrders: () => ProcessedOrder[];
    getPendingOrdersCount: () => number;
    getCompletedOrdersCount: () => number;
    getSalesData: () => SalesData[];
    getTodaysSales: () => number;
    getTodaysOrderCount: () => number;
    refreshData: () => void;
    clearAllData: () => void;
    addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
    updateMenuItem: (id: number, item: Omit<MenuItem, 'id'>) => void;
    deleteMenuItem: (id: number) => void;
    getMenuItems: () => MenuItem[];
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const useOrderContext = () => {
    const context = useContext(OrderContext);
    if (!context) {
        throw new Error('useOrderContext must be used within an OrderProvider');
    }
    return context;
};

interface OrderProviderProps {
    children: ReactNode;
}

const STORAGE_KEY = 'ptown-pos-orders';
const MENU_STORAGE_KEY = 'ptown-pos-menu';

export const OrderProvider: React.FC<OrderProviderProps> = ({ children }) => {
    const [processedOrders, setProcessedOrders] = useState<ProcessedOrder[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

    // Load orders from localStorage on initialization
    useEffect(() => {
        const loadOrdersFromStorage = () => {
            try {
                const storedOrders = localStorage.getItem(STORAGE_KEY);
                if (storedOrders) {
                    const orders = JSON.parse(storedOrders) as ProcessedOrder[];
                    setProcessedOrders(orders);
                } else {
                    // Add some demo data if no orders exist
                    const demoOrders: ProcessedOrder[] = [
                        {
                            id: 1,
                            items: { 1: 2, 4: 1 }, // 2 Burgers, 1 Soda
                            status: 'completed',
                            orderType: 'dine-in',
                            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
                            total: 350,
                            cashierName: 'Demo Cashier',
                            customerName: 'John Doe',
                            tableNumber: 5
                        },
                        {
                            id: 2,
                            items: { 2: 1, 3: 2 }, // 1 Pizza, 2 Fries
                            status: 'completed',
                            orderType: 'take-out',
                            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
                            total: 460,
                            cashierName: 'Demo Cashier',
                            customerName: 'Jane Smith'
                        },
                        {
                            id: 3,
                            items: { 5: 1, 6: 2, 8: 1 }, // 1 Chicken, 2 Rice, 1 Coffee
                            status: 'preparing',
                            orderType: 'dine-in',
                            createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
                            total: 305,
                            cashierName: 'Demo Cashier',
                            customerName: 'Bob Wilson',
                            tableNumber: 3
                        }
                    ];
                    setProcessedOrders(demoOrders);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(demoOrders));
                }
            } catch (error) {
                console.error('Error loading orders from storage:', error);
            }
        };

        loadOrdersFromStorage();

        // Listen for storage changes
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY && e.newValue) {
                try {
                    const orders = JSON.parse(e.newValue) as ProcessedOrder[];
                    setProcessedOrders(orders);
                } catch (error) {
                    console.error('Error parsing orders from storage change:', error);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Load menu items from localStorage on initialization
    useEffect(() => {
        const loadMenuFromStorage = () => {
            try {
                const storedMenu = localStorage.getItem(MENU_STORAGE_KEY);
                if (storedMenu) {
                    const items = JSON.parse(storedMenu) as MenuItem[];
                    setMenuItems(items);
                } else {
                    // Initialize with default menu
                    const defaultMenu: MenuItem[] = [
                        { id: 1, name: 'Burger', price: 150, available: true },
                        { id: 2, name: 'Pizza', price: 300, available: true },
                        { id: 3, name: 'Fries', price: 80, available: true },
                        { id: 4, name: 'Soda', price: 50, available: true },
                        { id: 5, name: 'Chicken', price: 120, available: true },
                        { id: 6, name: 'Rice', price: 25, available: true },
                        { id: 7, name: 'Salad', price: 90, available: true },
                        { id: 8, name: 'Coffee', price: 60, available: true }
                    ];
                    setMenuItems(defaultMenu);
                    localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(defaultMenu));
                }
            } catch (error) {
                console.error('Error loading menu from storage:', error);
            }
        };

        loadMenuFromStorage();
    }, []);

    const saveOrdersToStorage = (orders: ProcessedOrder[]) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
        } catch (error) {
            console.error('Error saving orders to storage:', error);
        }
    };

    const saveMenuToStorage = (items: MenuItem[]) => {
        try {
            localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(items));
        } catch (error) {
            console.error('Error saving menu to storage:', error);
        }
    };

    const addOrder = (orderData: Omit<ProcessedOrder, 'id' | 'createdAt' | 'status'>) => {
        const newOrder: ProcessedOrder = {
            ...orderData,
            id: Date.now(),
            createdAt: new Date().toISOString(),
            status: 'pending'
        };

        const updatedOrders = [...processedOrders, newOrder];
        setProcessedOrders(updatedOrders);
        saveOrdersToStorage(updatedOrders);
    };

    const updateOrderStatus = (orderId: number, status: ProcessedOrder['status']) => {
        const updatedOrders = processedOrders.map(order => 
            order.id === orderId 
                ? { 
                    ...order, 
                    status, 
                    updatedAt: new Date().toISOString()
                }
                : order
        );
        setProcessedOrders(updatedOrders);
        saveOrdersToStorage(updatedOrders);
    };

    const getOrdersByStatus = (status: ProcessedOrder['status']) => {
        return processedOrders.filter(order => order.status === status);
    };

    const getQueueOrders = () => {
        return processedOrders.filter(order => 
            ['pending', 'preparing', 'ready'].includes(order.status)
        ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    };

    const getPendingOrdersCount = () => {
        return processedOrders.filter(order => 
            ['pending', 'preparing', 'ready'].includes(order.status)
        ).length;
    };

    const getCompletedOrdersCount = () => {
        return processedOrders.filter(order => order.status === 'completed').length;
    };

    const getSalesData = (): SalesData[] => {
        const today = new Date();
        const salesByDate: { [key: string]: { total: number; orders: number } } = {};

        // Get sales for last 30 days
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateKey = date.toISOString().split('T')[0];
            salesByDate[dateKey] = { total: 0, orders: 0 };
        }

        // Process completed orders only for sales data
        processedOrders
            .filter(order => order.status === 'completed')
            .forEach(order => {
                const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
                if (salesByDate[orderDate]) {
                    salesByDate[orderDate].total += order.total;
                    salesByDate[orderDate].orders += 1;
                }
            });

        return Object.entries(salesByDate).map(([date, data]) => ({
            date,
            totalSales: data.total,
            orderCount: data.orders,
            orders: processedOrders.filter(order => 
                order.status === 'completed' && 
                order.createdAt.startsWith(date)
            )
        }));
    };

    const getTodaysSales = () => {
        const today = new Date().toISOString().split('T')[0];
        return processedOrders
            .filter(order => 
                order.status === 'completed' && 
                order.createdAt.startsWith(today)
            )
            .reduce((total, order) => total + order.total, 0);
    };

    const getTodaysOrderCount = () => {
        const today = new Date().toISOString().split('T')[0];
        return processedOrders.filter(order => 
            order.status === 'completed' && 
            order.createdAt.startsWith(today)
        ).length;
    };

    const refreshData = () => {
        // Trigger a re-render by updating state
        setProcessedOrders([...processedOrders]);
    };

    const clearAllData = () => {
        setProcessedOrders([]);
        localStorage.removeItem(STORAGE_KEY);
    };

    // Menu management functions
    const addMenuItem = (itemData: Omit<MenuItem, 'id'>) => {
        const newItem: MenuItem = {
            ...itemData,
            id: Math.max(...menuItems.map(item => item.id), 0) + 1
        };
        const updatedMenu = [...menuItems, newItem];
        setMenuItems(updatedMenu);
        saveMenuToStorage(updatedMenu);
    };

    const updateMenuItem = (id: number, itemData: Omit<MenuItem, 'id'>) => {
        const updatedMenu = menuItems.map(item => 
            item.id === id ? { ...itemData, id } : item
        );
        setMenuItems(updatedMenu);
        saveMenuToStorage(updatedMenu);
    };

    const deleteMenuItem = (id: number) => {
        const updatedMenu = menuItems.filter(item => item.id !== id);
        setMenuItems(updatedMenu);
        saveMenuToStorage(updatedMenu);
    };

    const getMenuItems = () => {
        return menuItems;
    };

    const value: OrderContextType = {
        processedOrders,
        salesData: getSalesData(),
        menuItems,
        addOrder,
        updateOrderStatus,
        getOrdersByStatus,
        getQueueOrders,
        getPendingOrdersCount,
        getCompletedOrdersCount,
        getSalesData,
        getTodaysSales,
        getTodaysOrderCount,
        refreshData,
        clearAllData,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        getMenuItems
    };

    return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};

export type { ProcessedOrder };
