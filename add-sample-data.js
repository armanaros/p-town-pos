// Browser console script to add sample data
// Copy and paste this into your browser's developer console when your app is running

const addSampleData = async () => {
  try {
    console.log('Adding sample data to Firestore...');
    
    // Import Firebase functions
    const { collection, doc, setDoc } = await import('firebase/firestore');
    const { db } = await import('./utils/firebase.ts');
    
    // Sample menu items
    const menuItems = [
      { id: 1, name: "Classic Burger", price: 250, category: "Main Dishes", available: true, description: "Juicy beef patty with lettuce, tomato, and special sauce" },
      { id: 2, name: "Chicken Sandwich", price: 220, category: "Main Dishes", available: true, description: "Grilled chicken breast with mayo and pickles" },
      { id: 3, name: "Fish & Chips", price: 280, category: "Main Dishes", available: true, description: "Fresh cod with crispy fries" },
      { id: 4, name: "Caesar Salad", price: 180, category: "Salads", available: true, description: "Crisp romaine with parmesan and croutons" },
      { id: 5, name: "French Fries", price: 80, category: "Sides", available: true, description: "Golden crispy fries" },
      { id: 6, name: "Onion Rings", price: 90, category: "Sides", available: true, description: "Beer-battered onion rings" },
      { id: 7, name: "Coca Cola", price: 50, category: "Beverages", available: true, description: "Refreshing cola drink" },
      { id: 8, name: "Orange Juice", price: 60, category: "Beverages", available: true, description: "Fresh squeezed orange juice" },
      { id: 9, name: "Chocolate Cake", price: 120, category: "Desserts", available: true, description: "Rich chocolate layer cake" },
      { id: 10, name: "Ice Cream", price: 80, category: "Desserts", available: true, description: "Vanilla ice cream scoop" }
    ];
    
    // Add menu items
    for (let i = 0; i < menuItems.length; i++) {
      const item = menuItems[i];
      await setDoc(doc(db, 'menuItems', `item${item.id}`), item);
      console.log(`Added menu item: ${item.name}`);
    }
    
    // Add admin user
    await setDoc(doc(db, 'users', 'admin'), {
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      name: 'Administrator'
    });
    console.log('Added admin user');
    
    // Add settings
    await setDoc(doc(db, 'settings', 'orderCounter'), {
      value: 1
    });
    console.log('Added order counter setting');
    
    console.log('✅ Sample data added successfully!');
    
  } catch (error) {
    console.error('❌ Error adding sample data:', error);
  }
};

// Run the function
addSampleData();
