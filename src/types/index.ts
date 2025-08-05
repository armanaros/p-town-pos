type MenuItem = {
    id: number;
    name: string;
    price: number;
    available: boolean;
    cost?: number; // Cost to make the item (for profit margin calculation)
    ingredientIds?: number[]; // Links to inventory items
    category?: string; // Food category
};

type InventoryItem = {
    id: number;
    name: string;
    currentStock: number;
    minimumStock: number;
    unit: string; // kg, pieces, liters, etc.
    costPerUnit: number;
    sellingPrice?: number; // Price per unit when selling to customers
    supplier: string;
    lastRestocked: string;
    expiryDate?: string;
};

type Supplier = {
    id: number;
    name: string;
    contact: string;
    email: string;
    phone: string;
    address: string;
    paymentTerms: string;
};

type PurchaseOrder = {
    id: number;
    supplierId: number;
    items: { inventoryItemId: number; quantity: number; unitCost: number }[];
    orderDate: string;
    expectedDelivery: string;
    status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
    totalCost: number;
    notes?: string;
};

type StaffPerformance = {
    employeeId: string;
    employeeName: string;
    date: string;
    ordersProcessed: number;
    totalSales: number;
    hoursWorked: number;
    ordersPerHour: number;
    salesPerHour: number;
};

type PeakHourData = {
    hour: number;
    day: string;
    orderCount: number;
    totalSales: number;
    averageOrderValue: number;
};

type MenuItemProfitability = {
    itemId: number;
    itemName: string;
    unitsSold: number;
    revenue: number;
    cost: number;
    profit: number;
    profitMargin: number;
};

type Order = {
    id: number;
    items: Record<number, number>;
    status: 'pending' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
    orderType: 'dine-in' | 'take-out';
    createdAt: string;
    updatedAt?: string;
    customerName?: string;
    tableNumber?: number;
    estimatedTime?: number; // in minutes
    cancellationReason?: string;
    cancelledBy?: string;
    cancelledAt?: string;
};

type SalesData = {
    date: string;
    totalSales: number;
    orderCount: number; // Added missing property
    orders: Order[];
};

export type { 
    MenuItem, 
    Order, 
    SalesData, 
    InventoryItem, 
    Supplier, 
    PurchaseOrder, 
    StaffPerformance, 
    PeakHourData, 
    MenuItemProfitability 
};