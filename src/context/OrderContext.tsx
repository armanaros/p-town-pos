
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, onSnapshot, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { dataService } from '../utils/dataService';
import { Order, SalesData, MenuItem, ProcessedOrder } from '../types';
// Utility to convert ProcessedOrder to Order (id as string)
const processedOrderToOrder = (order: ProcessedOrder): Order => ({
    ...order,
    id: String(order.id)
});

interface OrderContextType {
    processedOrders: ProcessedOrder[];
    salesData: SalesData[];
    menuItems: MenuItem[];
    addOrder: (order: Omit<ProcessedOrder, 'id' | 'createdAt' | 'status'>) => void;
    updateOrderStatus: (orderId: string, status: ProcessedOrder['status']) => void;
    cancelOrder: (orderId: string, reason: string, cancelledBy: string) => void;
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

interface OrderProviderProps {
    children: ReactNode;
}

const STORAGE_KEY = 'ptown-pos-orders';
const MENU_STORAGE_KEY = 'menuItems';

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<OrderProviderProps> = ({ children }) => {
    const [processedOrders, setProcessedOrders] = useState<ProcessedOrder[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

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
                            id: '1',
                            items: { '1': 2, '4': 1 },
                            status: 'completed',
                            orderType: 'dine-in',
                            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                            total: 350,
                            cashierName: 'Demo Cashier',
                            customerName: 'John Doe',
                            tableNumber: 5
                        },
                        {
                            id: '2',
                            items: { '2': 1, '3': 2 },
                            status: 'completed',
                            orderType: 'take-out',
                            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
                            total: 220,
                            cashierName: 'Demo Cashier',
                            customerName: 'Jane Smith',
                            tableNumber: 0
                        },
                        {
                            id: '3',
                            items: { '5': 1, '6': 2, '8': 1 },
                            status: 'preparing',
                            orderType: 'dine-in',
                            createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
                            total: 305,
                            cashierName: 'Demo Cashier',
                            customerName: 'Bob Wilson',
                            tableNumber: 3
                        }
                    ];
                    setProcessedOrders(demoOrders);
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

    useEffect(() => {
        // Listen for real-time order updates from Firestore
        const unsubscribe = onSnapshot(collection(db, 'orders'), (snapshot) => {
            const orders = snapshot.docs.map(docSnap => {
                const data = docSnap.data();
                return {
                    id: docSnap.id,
                    items: data.items ?? {},
                    status: data.status ?? 'pending',
                    orderType: data.orderType ?? 'dine-in',
                    createdAt: data.createdAt ?? new Date().toISOString(),
                    updatedAt: data.updatedAt ?? new Date().toISOString(),
                    total: typeof data.total === 'number' ? data.total : 0,
                    cashierName: data.cashierName ?? '',
                    customerName: data.customerName ?? '',
                    tableNumber: data.tableNumber ?? undefined,
                    estimatedTime: data.estimatedTime ?? undefined,
                    cancellationReason: data.cancellationReason ?? undefined,
                    cancelledBy: data.cancelledBy ?? undefined,
                    cancelledAt: data.cancelledAt ?? undefined
                };
            });
            setProcessedOrders(orders);
        });
        return () => unsubscribe();
    }, []);

    // Context functions
    const addOrder = async (order: Omit<ProcessedOrder, 'id' | 'createdAt' | 'status'>) => {
        const newOrder = {
            ...order,
            status: 'pending',
            createdAt: new Date().toISOString(),
        };
        await addDoc(collection(db, 'orders'), newOrder);
    };

    const updateOrderStatus = async (orderId: string, status: ProcessedOrder['status']) => {
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, {
            status,
            updatedAt: new Date().toISOString(),
        });
    };

    const cancelOrder = async (orderId: string, reason: string, cancelledBy: string) => {
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, {
            status: 'cancelled',
            cancellationReason: reason,
            cancelledBy,
            cancelledAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
    };

    const getOrdersByStatus = (status: ProcessedOrder['status']) => {
        return processedOrders.filter(order => order.status === status);
    };

    const getQueueOrders = () => {
        return processedOrders.filter(order => ['pending', 'preparing', 'ready'].includes(order.status))
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    };

    const getPendingOrdersCount = () => {
        return processedOrders.filter(order => ['pending', 'preparing', 'ready'].includes(order.status)).length;
    };

    const getCompletedOrdersCount = () => {
        return processedOrders.filter(order => order.status === 'completed' || order.status === 'served').length;
    };

    const getSalesData = (): SalesData[] => {
        // Example sales summary logic
        // Group processedOrders by date
        const salesByDate: Record<string, { total: number; orders: number }> = {};
        processedOrders.forEach(order => {
            if (order.status === 'completed') {
                    const date = order.createdAt.split('T')[0];
                    if (!salesByDate[date]) {
                        salesByDate[date] = { total: 0, orders: 0 };
                    }
                    salesByDate[date].total += order.total;
                    salesByDate[date].orders += 1;
            }
        });

        return Object.entries(salesByDate).map(([date, data]) => ({
            date,
            totalSales: data.total,
            orderCount: data.orders,
            orders: processedOrders
                .filter(order => order.status === 'completed' && order.createdAt.startsWith(date))
                .map(processedOrderToOrder)
        }));
    };

    const getTodaysSales = () => {
        // Implement as needed
        return 0;
    };

    const getTodaysOrderCount = () => {
        // Implement as needed
        return 0;
    };

    const refreshData = () => {
        setProcessedOrders([...processedOrders]);
    };

    const clearAllData = () => {
        setProcessedOrders([]);
        setMenuItems([]);
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(MENU_STORAGE_KEY);
    };

    const addMenuItem = async (item: Omit<MenuItem, 'id'>) => {
        await dataService.createMenuItem({ ...item, category: item.category ?? '' });
        const items = await dataService.getMenuItems();
        setMenuItems(items.map(i => ({
            ...i,
            id: typeof i.id === 'string' ? Number(i.id) : i.id,
            available: typeof i.available === 'boolean' ? i.available : false
        })));
    };

    const updateMenuItem = async (id: number, item: Omit<MenuItem, 'id'>) => {
        await dataService.updateMenuItem(id, { ...item, category: item.category ?? '' });
        const items = await dataService.getMenuItems();
        setMenuItems(items.map(i => ({
            ...i,
            id: typeof i.id === 'string' ? Number(i.id) : i.id,
            available: typeof i.available === 'boolean' ? i.available : false
        })));
    };

    const deleteMenuItem = async (id: number) => {
        await dataService.deleteMenuItem(String(id));
        const items = await dataService.getMenuItems();
        setMenuItems(items.map(i => ({
            ...i,
            id: typeof i.id === 'string' ? Number(i.id) : i.id,
            available: typeof i.available === 'boolean' ? i.available : false
        })));
    };

    const getMenuItems = () => menuItems;

    const value: OrderContextType = {
        processedOrders,
        salesData: getSalesData(),
        menuItems,
        addOrder,
        updateOrderStatus,
        cancelOrder,
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
        getMenuItems,
    };

    return (
        <OrderContext.Provider value={value}>
            {children}
        </OrderContext.Provider>
    );
};

export const useOrderContext = () => {
    const context = useContext(OrderContext);
    if (!context) {
        throw new Error('useOrderContext must be used within an OrderProvider');
    }
    return context;
}