// Quick script to reset sales data and order history
// Run this with: node reset-data.js

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  getDocs, 
  deleteDoc, 
  doc, 
  setDoc 
} = require('firebase/firestore');
const firebaseConfig = require('./firebase-config.js');

async function main() {
  try {
    console.log('🔄 Starting complete data reset...');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Delete all orders
    console.log('📋 Deleting all orders...');
    const ordersSnapshot = await getDocs(collection(db, 'orders'));
    if (ordersSnapshot.docs.length > 0) {
      const deletePromises = ordersSnapshot.docs.map(docRef => deleteDoc(docRef.ref));
      await Promise.all(deletePromises);
      console.log(`✅ Deleted ${ordersSnapshot.docs.length} orders`);
    } else {
      console.log('ℹ️ No orders found to delete');
    }
    
    // Delete all menu items (this is what you wanted!)
    console.log('🍽️ Deleting all menu items...');
    const menuSnapshot = await getDocs(collection(db, 'menuItems'));
    if (menuSnapshot.docs.length > 0) {
      const menuDeletePromises = menuSnapshot.docs.map(docRef => deleteDoc(docRef.ref));
      await Promise.all(menuDeletePromises);
      console.log(`✅ Deleted ${menuSnapshot.docs.length} menu items from menuItems collection`);
    } else {
      console.log('ℹ️ No menu items found in menuItems collection');
    }
    
    // Delete all config menu items (this is the one you noticed!)
    console.log('🔧 Deleting all config menu items...');
    const configSnapshot = await getDocs(collection(db, 'config'));
    if (configSnapshot.docs.length > 0) {
      const configDeletePromises = configSnapshot.docs.map(docRef => deleteDoc(docRef.ref));
      await Promise.all(configDeletePromises);
      console.log(`✅ Deleted ${configSnapshot.docs.length} items from config collection`);
    } else {
      console.log('ℹ️ No items found in config collection');
    }
    
    // Also check for a 'menu' collection just in case
    console.log('🍽️ Checking for menu collection...');
    const menuCollectionSnapshot = await getDocs(collection(db, 'menu'));
    if (menuCollectionSnapshot.docs.length > 0) {
      const menuCollectionDeletePromises = menuCollectionSnapshot.docs.map(docRef => deleteDoc(docRef.ref));
      await Promise.all(menuCollectionDeletePromises);
      console.log(`✅ Deleted ${menuCollectionSnapshot.docs.length} items from menu collection`);
    } else {
      console.log('ℹ️ No items found in menu collection');
    }
    
    // Reset order counter
    console.log('🔢 Resetting order counter...');
    await setDoc(doc(db, 'counters', 'orders'), { current: 0 });
    console.log('✅ Order counter reset to 0');
    
    console.log('🎉 Complete data reset completed successfully!');
    console.log('📊 Sales summary, order history, and menu items are now cleared');
    console.log('🍽️ You can now add your own menu items from scratch!');
    console.log('📍 Go to Admin Dashboard → Menu Management to add your items');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error resetting data:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

main();
