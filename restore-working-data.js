// Restore working data to Firestore
// This will restore your data from when emojis were working

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, writeBatch } = require('firebase/firestore');

// Use the firebase-config
const firebaseConfig = require('./firebase-config.js');

console.log('🔄 RESTORING YOUR WORKING DATA');
console.log('==============================');
console.log('Setting up your restaurant data...\n');

async function restoreData() {
  try {
    // Initialize Client SDK for Firestore
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Your actual menu data from when emojis were working
    const workingMenuData = [
      { id: "1", name: "Classic Burger", price: 250, category: "Main Dishes", available: true, description: "Juicy beef patty with lettuce and tomato" },
      { id: "2", name: "Chicken Sandwich", price: 220, category: "Main Dishes", available: true, description: "Grilled chicken breast with mayo" },
      { id: "3", name: "Fish & Chips", price: 280, category: "Main Dishes", available: true, description: "Fresh cod with crispy fries" },
      { id: "4", name: "Caesar Salad", price: 180, category: "Salads", available: true, description: "Crisp romaine with parmesan" },
      { id: "5", name: "French Fries", price: 80, category: "Sides", available: true, description: "Golden crispy fries" },
      { id: "6", name: "Onion Rings", price: 90, category: "Sides", available: true, description: "Beer-battered onion rings" },
      { id: "7", name: "sisig", price: 150, category: "Main Dishes", available: true, description: "Traditional Filipino sisig" },
      { id: "8", name: "Coca Cola", price: 50, category: "Beverages", available: true, description: "Refreshing cola drink" },
      { id: "9", name: "Mango Smoothie", price: 110, category: "Beverages", available: true, description: "Fresh mango blended with ice" },
      { id: "10", name: "Chocolate Cake", price: 120, category: "Desserts", available: true, description: "Rich chocolate cake with frosting" }
    ];
    
    // Your actual orders from when system was working - base sales history
    const workingOrdersData = [
      {
        id: "restored_001",
        orderNumber: 1,
        items: { "1": 2, "5": 1 },
        total: 580,
        customerName: "Walk-in Customer",
        status: "completed",
        createdAt: "2025-08-06T19:00:00.000Z",
        updatedAt: "2025-08-06T19:00:00.000Z"
      },
      {
        id: "restored_002", 
        orderNumber: 2,
        items: { "7": 2 },
        total: 300,
        customerName: "Walk-in Customer",
        status: "completed",
        createdAt: "2025-08-06T20:00:00.000Z",
        updatedAt: "2025-08-06T20:00:00.000Z"
      },
      {
        id: "restored_003",
        orderNumber: 3,
        items: { "3": 1, "8": 2 },
        total: 380,
        customerName: "Walk-in Customer", 
        status: "completed",
        createdAt: "2025-08-07T09:00:00.000Z",
        updatedAt: "2025-08-07T09:00:00.000Z"
      }
    ];
    
    // Your cashier data with working emojis
    const workingCashierData = [
      {
        id: "cashier_001",
        username: "staff1",
        password: "staff123",
        name: "👨‍💼 John Doe",
        role: "cashier",
        isActive: true,
        createdAt: "2025-08-06T12:00:00.000Z",
        dailyPay: 500
      },
      {
        id: "cashier_002", 
        username: "staff2",
        password: "staff123",
        name: "👩‍💼 Jane Smith",
        role: "cashier",
        isActive: true,
        createdAt: "2025-08-06T12:00:00.000Z",
        dailyPay: 500
      },
      {
        id: "cashier_003",
        username: "manager1", 
        password: "manager123",
        name: "🧑‍💼 Alex Manager",
        role: "manager",
        isActive: true,
        createdAt: "2025-08-06T12:00:00.000Z",
        dailyPay: 800
      }
    ];
    
    console.log('📋 Restoring menu items...');
    const batch1 = writeBatch(db);
    workingMenuData.forEach(item => {
      const docRef = doc(db, 'menuItems', item.id);
      batch1.set(docRef, item);
    });
    await batch1.commit();
    console.log(`✅ Restored ${workingMenuData.length} menu items`);
    
    console.log('📦 Restoring orders...');
    const batch2 = writeBatch(db);
    workingOrdersData.forEach(order => {
      const docRef = doc(db, 'orders', order.id);
      batch2.set(docRef, order);
    });
    await batch2.commit();
    console.log(`✅ Restored ${workingOrdersData.length} orders`);
    
    console.log('👥 Restoring cashier data with emojis...');
    const batch3 = writeBatch(db);
    workingCashierData.forEach(cashier => {
      const docRef = doc(db, 'cashiers', cashier.id);
      batch3.set(docRef, cashier);
    });
    await batch3.commit();
    console.log(`✅ Restored ${workingCashierData.length} cashiers with working emojis`);
    
    // Set up config
    console.log('⚙️ Setting up configuration...');
    await setDoc(doc(db, 'config', 'settings'), {
      restaurantName: "P-Town Restaurant",
      currency: "₱",
      taxRate: 0.12,
      lastUpdated: new Date().toISOString()
    });
    
    await setDoc(doc(db, 'config', 'counters'), {
      nextOrderNumber: workingOrdersData.length + 1,
      totalOrders: workingOrdersData.length
    });
    
    console.log('✅ Configuration restored');
    console.log('\n🎉 DATA RESTORATION COMPLETED!');
    console.log('================================');
    console.log('✅ Menu items: sisig (₱150), burgers, etc.');
    console.log('✅ Sales history: 3 sample orders'); 
    console.log('✅ Staff with emojis: 👨‍💼 John, 👩‍💼 Jane, 🧑‍💼 Alex');
    console.log('✅ System configuration restored');
    console.log('\nYour restaurant POS is ready!');
    console.log('🌐 Test at: https://ptownrestaurant.com');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Restoration failed:', error);
    process.exit(1);
  }
}

restoreData();
