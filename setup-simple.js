// Restore previous working menu structure
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB6IKNhxMfAJ_07WlppWMWMdxK3jT81DJs",
  authDomain: "p-town-pos.firebaseapp.com",
  projectId: "p-town-pos",
  storageBucket: "p-town-pos.firebasestorage.app",
  messagingSenderId: "1079263515484",
  appId: "1:1079263515484:web:638f304af025663d472799",
  measurementId: "G-38L32K0BH9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function restorePreviousStructure() {
  try {
    console.log('� Restoring previous working menu structure...');
    
    // Restore menu items to config/menu document (previous working structure)
    const menuItems = [
      { id: 1, name: "Classic Burger", price: 250, category: "Main Dishes", available: true, description: "Juicy beef patty with lettuce and tomato" },
      { id: 2, name: "Chicken Sandwich", price: 220, category: "Main Dishes", available: true, description: "Grilled chicken breast with mayo" },
      { id: 3, name: "Fish & Chips", price: 280, category: "Main Dishes", available: true, description: "Fresh cod with crispy fries" },
      { id: 4, name: "Caesar Salad", price: 180, category: "Salads", available: true, description: "Crisp romaine with parmesan" },
      { id: 5, name: "French Fries", price: 80, category: "Sides", available: true, description: "Golden crispy fries" },
      { id: 6, name: "Onion Rings", price: 90, category: "Sides", available: true, description: "Beer-battered onion rings" },
      { id: 7, name: "Coca Cola", price: 50, category: "Beverages", available: true, description: "Refreshing cola drink" },
      { id: 8, name: "Orange Juice", price: 60, category: "Beverages", available: true, description: "Fresh squeezed orange juice" },
      { id: 9, name: "Chocolate Cake", price: 120, category: "Desserts", available: true, description: "Rich chocolate layer cake" },
      { id: 10, name: "Ice Cream", price: 80, category: "Desserts", available: true, description: "Vanilla ice cream scoop" }
    ];
    
    // Save to config/menu document (previous working structure)
    await setDoc(doc(db, 'config', 'menu'), {
      items: menuItems,
      updatedAt: new Date().toISOString()
    });
    console.log('✅ Menu items restored to config/menu structure');
    
    // Keep admin user and settings
    await setDoc(doc(db, 'users', 'admin'), {
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      name: 'Administrator'
    });
    console.log('✅ Admin user preserved');
    
    await setDoc(doc(db, 'settings', 'orderCounter'), { value: 1 });
    console.log('✅ Settings preserved');
    
    console.log('🎉 Previous working structure restored successfully!');
    console.log('📊 Menu items are now stored in config/menu document as before');
    
  } catch (error) {
    console.error('❌ Error restoring structure:', error);
  }
}

restorePreviousStructure();
