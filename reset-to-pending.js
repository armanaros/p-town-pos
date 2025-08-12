// Script to update existing completed orders back to pending for order queue workflow
// Run this with: node reset-to-pending.js

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

async function resetToPending() {
  try {
    console.log('🔄 Resetting orders to pending status for order queue...');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Get all orders
    const ordersSnapshot = await getDocs(collection(db, 'orders'));
    
    if (ordersSnapshot.docs.length === 0) {
      console.log('ℹ️ No orders found');
      process.exit(0);
    }
    
    console.log(`📊 Found ${ordersSnapshot.docs.length} orders total\n`);
    
    // Find completed orders to reset to pending
    const completedOrders = [];
    
    ordersSnapshot.docs.forEach(docRef => {
      const orderData = docRef.data();
      if (orderData.status === 'completed') {
        completedOrders.push({ id: docRef.id, ...orderData });
      }
    });
    
    console.log(`🔄 Found ${completedOrders.length} completed orders to reset to pending`);
    
    if (completedOrders.length === 0) {
      console.log('✅ No completed orders to reset');
      process.exit(0);
    }
    
    // Update completed orders to pending
    const updatePromises = completedOrders.map(order => {
      console.log(`   Resetting order ${order.id}: Total ₱${order.total} → pending`);
      return updateDoc(doc(db, 'orders', order.id), { status: 'pending' });
    });
    
    await Promise.all(updatePromises);
    
    console.log(`\n✅ Successfully reset ${completedOrders.length} orders to pending status`);
    console.log('📋 Orders will now appear in the order queue for processing');
    console.log('💰 Sales calculations now count all paid orders (pending + processing + ready + completed)');
    console.log('🔄 Refresh your dashboard to see the order queue working again');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error resetting orders:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

resetToPending();
