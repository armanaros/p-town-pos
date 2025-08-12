const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, setDoc, addDoc, collection } = require('firebase/firestore');

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

async function migrateToMenuItemsCollection() {
  try {
    console.log('🔄 Migrating menu data to individual documents in menuItems collection...');
    
    // Get existing menu data from config/menu
    const menuRef = doc(db, 'config', 'menu');
    const menuDoc = await getDoc(menuRef);
    
    if (menuDoc.exists()) {
      const data = menuDoc.data();
      const items = data.items || [];
      
      console.log(`📦 Found ${items.length} menu items to migrate`);
      
      // Clear existing menuItems collection by creating fresh documents
      const menuItemsRef = collection(db, 'menuItems');
      
      // Add each item as individual document
      for (const item of items) {
        await addDoc(menuItemsRef, {
          ...item,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        console.log(`✅ Migrated: ${item.name}`);
      }
      
      console.log('🎉 Migration completed successfully!');
      console.log(`📊 ${items.length} menu items are now stored as individual documents in the menuItems collection`);
      
    } else {
      console.log('❌ No existing menu data found in config/menu');
      
      // Create sample menu items directly in menuItems collection
      console.log('🆕 Creating sample menu items...');
      
      const sampleItems = [
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
      ];
      
      const menuItemsRef = collection(db, 'menuItems');
      
      for (const item of sampleItems) {
        await addDoc(menuItemsRef, {
          ...item,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        console.log(`✅ Created: ${item.name}`);
      }
      
      console.log('🎉 Sample menu items created successfully!');
    }
    
  } catch (error) {
    console.error('❌ Error during migration:', error);
  }
}

migrateToMenuItemsCollection();
