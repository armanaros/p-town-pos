// Simple database setup script
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc } = require('firebase/firestore');
const firebaseConfig = require('./firebase-config.js');

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample menu items for P-Town POS
const sampleMenuItems = [
  { id: 1, name: "Classic Burger", price: 250, category: "Main Dishes", available: true, description: "Juicy beef patty" },
  { id: 2, name: "French Fries", price: 80, category: "Sides", available: true, description: "Golden crispy fries" },
  { id: 3, name: "Coca Cola", price: 50, category: "Beverages", available: true, description: "Refreshing cola" },
  { id: 4, name: "Chicken Sandwich", price: 220, category: "Main Dishes", available: true, description: "Grilled chicken breast" },
  { id: 5, name: "Garden Salad", price: 180, category: "Salads", available: true, description: "Fresh mixed greens" },
  { id: 6, name: "Chocolate Cake", price: 120, category: "Desserts", available: true, description: "Rich chocolate cake with frosting" },
  { id: 7, name: "Pepperoni Pizza", price: 320, category: "Main Dishes", available: true, description: "Classic pizza with pepperoni and cheese" },
  { id: 8, name: "French Fries", price: 80, category: "Sides", available: true, description: "Crispy golden fries" },
  { id: 9, name: "Mango Smoothie", price: 110, category: "Beverages", available: true, description: "Fresh mango blended with ice" },
  { id: 10, name: "Grilled Chicken", price: 280, category: "Main Dishes", available: true, description: "Seasoned grilled chicken breast" }
];

async function setupDatabase() {
  try {
    console.log('🚀 Setting up database...');
    
    // Add sample menu items
    const menuItems = [
      { id: 1, name: "Classic Burger", price: 250, category: "Main Dishes", available: true, description: "Juicy beef patty" },
      { id: 2, name: "French Fries", price: 80, category: "Sides", available: true, description: "Golden crispy fries" },
      { id: 3, name: "Coca Cola", price: 50, category: "Beverages", available: true, description: "Refreshing cola" }
    ];
    
    for (const item of menuItems) {
      const docRef = doc(db, 'menuItems', `item${item.id}`);
      await setDoc(docRef, item);
      console.log(`✅ Added: ${item.name}`);
    }
    
    // Add admin user
    await setDoc(doc(db, 'users', 'admin'), {
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      name: 'Administrator'
    });
    console.log('✅ Added admin user');
    
    // Add settings
    await setDoc(doc(db, 'settings', 'orderCounter'), { value: 1 });
    console.log('✅ Added settings');
    
    console.log('🎉 Database setup complete!');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
  }
}

setupDatabase();

async function setupDatabase() {
  try {
    console.log('🚀 Setting up P-Town POS database...');
    
    // Create menu document with items
    await setDoc(doc(db, 'config', 'menu'), {
      items: sampleMenuItems,
      lastUpdated: new Date().toISOString(),
      version: 1
    });
    
    console.log('✅ Menu items added successfully!');
    
    // Create sample cashier
    await setDoc(doc(db, 'cashiers', 'admin'), {
      username: 'admin',
      password: 'admin123',
      role: 'manager',
      name: 'Administrator',
      isActive: true,
      createdAt: new Date().toISOString()
    });
    
    console.log('✅ Admin user created (username: admin, password: admin123)');
    
    // Create sample order counter
    await setDoc(doc(db, 'config', 'counters'), {
      nextOrderNumber: 1
    });
    
    console.log('✅ Order counter initialized');
    console.log('🎉 Database setup complete!');
    console.log('');
    console.log('🔐 Admin Login:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('');
    console.log('📱 You can now use your P-Town POS system!');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
  }
}

setupDatabase();
