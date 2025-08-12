// Script to set order dates to August 7, 2025
// Run this with: node set-august7-dates.js

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
    console.log('📅 Setting order dates to August 7, 2025...');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Set to August 7, 2025 at current time
    const august7Date = new Date('2025-08-07T12:00:00.000Z');
    const august7ISO = august7Date.toISOString();
    console.log(`🕐 Setting date to: ${august7ISO}`);
    
    // Get all orders
    const ordersSnapshot = await getDocs(collection(db, 'orders'));
    
    if (ordersSnapshot.docs.length === 0) {
      console.log('ℹ️ No orders found');
      process.exit(0);
    }
    
    console.log(`📊 Found ${ordersSnapshot.docs.length} orders to update\n`);
    
    // Update all orders to August 7th
    const updatePromises = ordersSnapshot.docs.map(async (docRef) => {
      const orderData = docRef.data();
      console.log(`📋 Updating order ${docRef.id}:`);
      console.log(`   Old date: ${orderData.createdAt}`);
      console.log(`   New date: ${august7ISO}`);
      console.log(`   Total: ₱${orderData.total}`);
      
      return updateDoc(doc(db, 'orders', docRef.id), { 
        createdAt: august7ISO 
      });
    });
    
    await Promise.all(updatePromises);
    
    console.log(`\n✅ Successfully updated ${ordersSnapshot.docs.length} orders to August 7, 2025`);
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
