// Browser console script to reset data
// Copy and paste this into your browser console while on ptownrestaurant.com

async function quickReset() {
  try {
    console.log('🔄 Starting browser-based reset...');
    
    // Import Firebase functions (they should be available on the page)
    const { collection, getDocs, deleteDoc } = window.firebase.firestore;
    const db = window.firebase.firestore();
    
    // Delete all orders
    console.log('📋 Deleting all orders...');
    const ordersSnapshot = await getDocs(collection(db, 'orders'));
    for (const doc of ordersSnapshot.docs) {
      await deleteDoc(doc.ref);
    }
    console.log(`✅ Deleted ${ordersSnapshot.docs.length} orders`);
    
    // Delete all menu items
    console.log('🍽️ Deleting all menu items...');
    const menuSnapshot = await getDocs(collection(db, 'menuItems'));
    for (const doc of menuSnapshot.docs) {
      await deleteDoc(doc.ref);
    }
    console.log(`✅ Deleted ${menuSnapshot.docs.length} menu items`);
    
    console.log('🎉 Reset completed! Refresh the page to see changes.');
    alert('Data reset completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    alert('Error resetting data: ' + error.message);
  }
}

// Run the reset
quickReset();
