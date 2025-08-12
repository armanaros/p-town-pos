// Script to update existing pending orders to completed status
// Run this with: node update-pending-orders.js

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  getDocs, 
  updateDoc, 
  doc 
} = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyBNzFtLJj5hJOYKT9-VdBQmtpJWWGjqsKo",
  authDomain: "p-town-pos.firebaseapp.com",
  projectId: "p-town-pos",
  storageBucket: "p-town-pos.firebasestorage.app",
  messagingSenderId: "423326426374",
  appId: "1:423326426374:web:df35b3b6b7c7f5bce3a3f5"
};

async function main() {
  try {
    console.log('🔄 Starting pending orders update...');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Get all orders
    console.log('📋 Fetching all orders...');
    const ordersSnapshot = await getDocs(collection(db, 'orders'));
    
    if (ordersSnapshot.docs.length === 0) {
      console.log('ℹ️ No orders found');
      process.exit(0);
    }
    
    // Find pending orders
    const pendingOrders = [];
    const allOrders = [];
    
    ordersSnapshot.docs.forEach(docRef => {
      const orderData = docRef.data();
      allOrders.push({ id: docRef.id, ...orderData });
      
      if (orderData.status === 'pending') {
        pendingOrders.push({ id: docRef.id, ...orderData });
      }
    });
    
    console.log(`📊 Found ${allOrders.length} total orders`);
    console.log(`⏳ Found ${pendingOrders.length} pending orders to update`);
    
    if (pendingOrders.length === 0) {
      console.log('✅ No pending orders to update');
      process.exit(0);
    }
    
    // Update pending orders to completed
    console.log('🔄 Updating pending orders to completed status...');
    
    const updatePromises = pendingOrders.map(order => {
      console.log(`   Updating order ${order.id}: Total ₱${order.total}`);
      return updateDoc(doc(db, 'orders', order.id), { status: 'completed' });
    });
    
    await Promise.all(updatePromises);
    
    console.log(`✅ Successfully updated ${pendingOrders.length} orders to completed status`);
    console.log('💰 These orders will now be counted in sales totals');
    console.log('📊 Refresh your dashboard to see the updated sales numbers');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error updating orders:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

main();
