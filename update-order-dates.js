// Script to update order dates to today for testing
// Run this with: node update-order-dates.js

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
    console.log('📅 Updating order dates to today...');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Get current date/time
    const now = new Date();
    const todayISO = now.toISOString();
    console.log(`🕐 Current time: ${todayISO}`);
    
    // Get all orders
    const ordersSnapshot = await getDocs(collection(db, 'orders'));
    
    if (ordersSnapshot.docs.length === 0) {
      console.log('ℹ️ No orders found');
      process.exit(0);
    }
    
    console.log(`📊 Found ${ordersSnapshot.docs.length} orders to update\n`);
    
    // Update all orders to today's date
    const updatePromises = ordersSnapshot.docs.map(async (docRef) => {
      const orderData = docRef.data();
      console.log(`📋 Updating order ${docRef.id}:`);
      console.log(`   Old date: ${orderData.createdAt}`);
      console.log(`   New date: ${todayISO}`);
      console.log(`   Total: ₱${orderData.total}`);
      
      return updateDoc(doc(db, 'orders', docRef.id), { 
        createdAt: todayISO 
      });
    });
    
    await Promise.all(updatePromises);
    
    console.log(`\n✅ Successfully updated ${ordersSnapshot.docs.length} orders to today's date`);
    console.log('📊 Orders should now appear in today\'s sales summary');
    console.log('🔄 Refresh your dashboard to see the updated sales');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error updating order dates:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

main();
