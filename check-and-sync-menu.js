const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, setDoc } = require('firebase/firestore');

// Firebase configuration
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

async function checkAndSyncMenu() {
  try {
    console.log('🔍 Checking current menu state in Firebase...');
    
    // Check if config/menu document exists
    const menuRef = doc(db, 'config', 'menu');
    const menuDoc = await getDoc(menuRef);
    
    if (menuDoc.exists()) {
      const data = menuDoc.data();
      console.log('✅ Menu document found!');
      console.log(`📊 Current menu has ${data.items ? data.items.length : 0} items`);
      console.log('📝 Menu items:', data.items);
      return;
    }
    
    console.log('❌ No menu document found. Creating initial menu structure...');
    
    // Create initial menu with sample items
    const initialMenu = {
      items: [
        {
          id: 1,
          name: "Classic Burger",
          price: 150.00,
          category: "Main Course",
          description: "Beef patty with lettuce, tomato, and special sauce",
          available: true
        },
        {
          id: 2,
          name: "Chicken Wings",
          price: 120.00,
          category: "Appetizer",
          description: "Crispy chicken wings with buffalo sauce",
          available: true
        },
        {
          id: 3,
          name: "Caesar Salad",
          price: 100.00,
          category: "Salad",
          description: "Fresh lettuce with caesar dressing and croutons",
          available: true
        },
        {
          id: 4,
          name: "Coca Cola",
          price: 50.00,
          category: "Beverage",
          description: "Cold refreshing soda",
          available: true
        },
        {
          id: 5,
          name: "French Fries",
          price: 80.00,
          category: "Side",
          description: "Golden crispy potato fries",
          available: true
        }
      ],
      updatedAt: new Date().toISOString()
    };
    
    await setDoc(menuRef, initialMenu);
    console.log('✅ Initial menu created successfully!');
    console.log(`📊 Created ${initialMenu.items.length} menu items`);
    
  } catch (error) {
    console.error('❌ Error checking/syncing menu:', error);
  }
}

checkAndSyncMenu();
