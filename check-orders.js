// Script to check the status and details of all orders
// Run this with: node check-orders.js

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  getDocs 
} = require('firebase/firestore');
const firebaseConfig = require('./firebase-config.js');

async function main() {
  try {
    console.log('🔍 Checking all orders in database...');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Get all orders
    const ordersSnapshot = await getDocs(collection(db, 'orders'));
    
    if (ordersSnapshot.docs.length === 0) {
      console.log('ℹ️ No orders found in database');
      process.exit(0);
    }
    
    console.log(`📊 Found ${ordersSnapshot.docs.length} orders total\n`);
    
    const statusCounts = {};
    
    ordersSnapshot.docs.forEach((docRef, index) => {
      const orderData = docRef.data();
      console.log(`📋 Order ${index + 1}:`);
      console.log(`   ID: ${docRef.id}`);
      console.log(`   Status: ${orderData.status}`);
      console.log(`   Total: ₱${orderData.total}`);
      console.log(`   Customer: ${orderData.customerName}`);
      console.log(`   Created: ${orderData.createdAt}`);
      console.log(`   Items: ${JSON.stringify(orderData.items)}`);
      console.log('');
      
      // Count statuses
      statusCounts[orderData.status] = (statusCounts[orderData.status] || 0) + 1;
    });
    
    console.log('📈 Status Summary:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} orders`);
    });
    
    console.log('\n💡 Only orders with status "completed" are counted in sales totals');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error checking orders:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

main();
