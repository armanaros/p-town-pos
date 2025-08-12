import { collection, doc, setDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';

// --- Interfaces ---
export interface Order {
  id: string;
  orderNumber: number;
  items: { [key: string]: number };
  total: number;
  customerName?: string;
  cashierName?: string;
  cashierId?: string;
  status: 'pending' | 'processing' | 'preparing' | 'ready' | 'completed' | 'served' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  cancellationReason?: string;
  cancelledBy?: string;
  cancelledAt?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  available?: boolean;
  cost?: number;
}

export interface Cashier {
  id: string;
  username: string;
  password: string;
  name: string;
  role: 'cashier' | 'manager' | 'waiter';
  createdAt: string;
  isActive: boolean;
  dailyPay?: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  cost: number;
  sellingPrice: number;
  category: string;
  lowStockThreshold: number;
  unit: string;
  supplier?: string;
  createdAt: string;
  updatedAt: string;
  lastRestocked?: string;
  currentStock?: number;
  minimumStock?: number;
  costPerUnit?: number;
  expiryDate?: string;
}

// --- DataService Class ---
class DataService {
  async getNextOrderNumber(): Promise<number> {
    return Date.now() % 100000;
  }

  async resetOrderCounter(): Promise<void> {
    return Promise.resolve();
  }

  async createOrder(order: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return Promise.resolve('order-id');
  }

  async updateOrder(orderId: string, updates: Partial<Order>): Promise<void> {
    return Promise.resolve();
  }

  async getOrders(): Promise<Order[]> {
    return Promise.resolve([]);
  }

  async createCashier(cashier: Omit<Cashier, 'id' | 'createdAt' | 'isActive'>): Promise<string> {
    // Generate a new cashier ID
    const cashierRef = doc(collection(db, 'cashiers'));
    const cashierId = cashierRef.id;
    const now = new Date().toISOString();
    const cashierData: Cashier = {
      ...cashier,
      id: cashierId,
      createdAt: now,
      isActive: true
    };
    await setDoc(cashierRef, cashierData);
    return cashierId;
  }

  async getCashiers(): Promise<Cashier[]> {
    const snapshot = await getDocs(collection(db, 'cashiers'));
    return snapshot.docs.map(doc => doc.data() as Cashier);
  }

  async updateCashier(cashierId: string, updates: Partial<Cashier>): Promise<void> {
    return Promise.resolve();
  }

  async deleteCashier(cashierId: string): Promise<void> {
    // Find the Firestore document where cashier.id matches cashierId
    const snapshot = await getDocs(collection(db, 'cashiers'));
    const docToDelete = snapshot.docs.find(doc => (doc.data() as Cashier).id === cashierId);
    if (docToDelete) {
      await deleteDoc(docToDelete.ref);
    }
  }

  async createInventoryItem(item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return Promise.resolve('inventory-id');
  }

  async updateInventoryItem(itemId: string, updates: Partial<InventoryItem>): Promise<void> {
    return Promise.resolve();
  }

  async getInventory(): Promise<InventoryItem[]> {
    return Promise.resolve([]);
  }

  async createMenuItem(item: Omit<MenuItem, 'id'>): Promise<void> {
    // Create a new menu item document in Firestore
    const menuRef = doc(collection(db, 'menuItems'));
    const menuData: MenuItem = {
      ...item,
      id: menuRef.id // Use Firestore doc ID as string for uniqueness
    };
    await setDoc(menuRef, menuData);
  }

  async updateMenuItem(id: number, updates: Partial<Omit<MenuItem, 'id'>>): Promise<void> {
    return Promise.resolve();
  }

  async deleteMenuItem(id: string): Promise<void> {
    // Delete the menu item document by Firestore doc ID
    const menuRef = doc(db, 'menuItems', id);
    await deleteDoc(menuRef);
  }

  async getMenuItems(): Promise<MenuItem[]> {
    const snapshot = await getDocs(collection(db, 'menuItems'));
    return snapshot.docs.map(doc => doc.data() as MenuItem);
  }

  async migrateLocalData(): Promise<void> {
    return Promise.resolve();
  }

  async clearAllData(): Promise<void> {
    try {
      const ordersSnapshot = await getDocs(collection(db, 'orders'));
      const orderDeletePromises = ordersSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(orderDeletePromises);

      const menuSnapshot = await getDocs(collection(db, 'menuItems'));
      const menuDeletePromises = menuSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(menuDeletePromises);

      const cashiersSnapshot = await getDocs(collection(db, 'cashiers'));
      const cashierDeletePromises = cashiersSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(cashierDeletePromises);

      const inventorySnapshot = await getDocs(collection(db, 'inventory'));
      const inventoryDeletePromises = inventorySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(inventoryDeletePromises);

      await this.resetOrderCounter();

      localStorage.removeItem('orders');
      localStorage.removeItem('processedOrders');
      localStorage.removeItem('menuItems');
      localStorage.removeItem('cashiers');
      localStorage.removeItem('inventory');
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  }

  async seedInitialData(): Promise<void> {
    return Promise.resolve();
  }

  async syncMenuToConfig(menuItems: MenuItem[]): Promise<void> {
    // Write all menu items to /config/menu as a single document
    const configMenuRef = doc(db, 'config', 'menu');
    await setDoc(configMenuRef, { items: menuItems });
  }
}

export const dataService = new DataService();

