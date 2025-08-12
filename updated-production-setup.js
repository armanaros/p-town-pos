// Updated production data setup script for the new menu structure
const addUpdatedProductionData = async () => {
  try {
    console.log('🚀 Adding sample data to updated Firestore structure...');
    
    const { collection, doc, setDoc, getFirestore } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
    
    const firebaseConfig = {
      apiKey: "AIzaSyB6IKNhxMfAJ_07WlppWMWMdxK3jT81DJs",
      authDomain: "p-town-pos.firebaseapp.com",
      projectId: "p-town-pos",
      storageBucket: "p-town-pos.firebasestorage.app",
      messagingSenderId: "1079263515484",
      appId: "1:1079263515484:web:638f304af025663d472799"
    };
    
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Add sample menu items to the new menuItems collection
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
    
    console.log('Adding menu items to individual documents...');
    for (const item of menuItems) {
      await setDoc(doc(db, 'menuItems', `item${item.id}`), item);
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
    console.log('✅ Added order counter setting');
    
    console.log('🎉 Updated production data setup complete!');
    console.log('🔄 Reloading page to sync with new data...');
    
    setTimeout(() => {
      window.location.reload();
    }, 2000);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

// Run the function
addUpdatedProductionData();
