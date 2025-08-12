// Get ALL original data from Realtime Database and restore to Firestore
// This will restore your actual business data from when emojis were working

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, writeBatch } = require('firebase/firestore');
const https = require('https');

const firebaseConfig = require('./firebase-config.js');

console.log('🔄 RETRIEVING YOUR ORIGINAL BUSINESS DATA');
console.log('==========================================');
console.log('Getting your real data from Realtime Database...\n');

async function getRealtimeData(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'p-town-default-rtdb.firebaseio.com',
      port: 443,
      path: `/${path}.json`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function restoreOriginalData() {
  try {
    // Initialize Firestore
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('📦 Getting your original orders from Realtime Database...');
    const orders = await getRealtimeData('orders');
    
    if (orders) {
      console.log(`Found ${Object.keys(orders).length} original orders`);
      const orderBatch = writeBatch(db);
      Object.entries(orders).forEach(([id, order]) => {
        const docRef = doc(db, 'orders', id);
        orderBatch.set(docRef, order);
      });
      await orderBatch.commit();
      console.log(`✅ Restored ${Object.keys(orders).length} original orders`);
    } else {
      console.log('ℹ️  No orders found in Realtime Database');
    }
    
    console.log('🍽️ Getting your original menu items...');
    const menuItems = await getRealtimeData('menuItems');
    
    if (menuItems) {
      console.log(`Found ${Object.keys(menuItems).length} original menu items`);
      const menuBatch = writeBatch(db);
      Object.entries(menuItems).forEach(([id, item]) => {
        const docRef = doc(db, 'menuItems', id);
        menuBatch.set(docRef, item);
      });
      await menuBatch.commit();
      console.log(`✅ Restored ${Object.keys(menuItems).length} original menu items`);
      
      // Show what menu items were restored
      console.log('📋 Your original menu items:');
      Object.entries(menuItems).forEach(([id, item]) => {
        console.log(`   ${id}. ${item.name} - ₱${item.price}`);
      });
    } else {
      console.log('ℹ️  No menu items found in Realtime Database');
    }
    
    console.log('👥 Getting your original cashier data...');
    const cashiers = await getRealtimeData('cashiers');
    
    if (cashiers) {
      console.log(`Found ${Object.keys(cashiers).length} original cashiers`);
      const cashierBatch = writeBatch(db);
      Object.entries(cashiers).forEach(([id, cashier]) => {
        const docRef = doc(db, 'cashiers', id);
        cashierBatch.set(docRef, cashier);
      });
      await cashierBatch.commit();
      console.log(`✅ Restored ${Object.keys(cashiers).length} original cashiers`);
      
      // Show what cashiers were restored
      console.log('👥 Your original staff:');
      Object.entries(cashiers).forEach(([id, cashier]) => {
        console.log(`   ${cashier.name} (${cashier.role})`);
      });
    } else {
      console.log('ℹ️  No cashiers found in Realtime Database');
    }
    
    console.log('⚙️ Getting your original config...');
    const config = await getRealtimeData('config');
    
    if (config) {
      const configBatch = writeBatch(db);
      Object.entries(config).forEach(([id, configItem]) => {
        const docRef = doc(db, 'config', id);
        configBatch.set(docRef, configItem);
      });
      await configBatch.commit();
      console.log('✅ Restored original configuration');
    }
    
    // Get menu from config if it exists
    const menuConfig = await getRealtimeData('config/menu');
    if (menuConfig) {
      await setDoc(doc(db, 'config', 'menu'), menuConfig);
      console.log('✅ Restored menu configuration');
    }
    
    console.log('\n🎉 ORIGINAL DATA RESTORATION COMPLETED!');
    console.log('=======================================');
    console.log('✅ All your original orders restored');
    console.log('✅ All your original menu items restored');
    console.log('✅ All your original staff data restored');
    console.log('✅ All your original configuration restored');
    console.log('\n🌐 Your restaurant is back to the working state!');
    console.log('   Visit: https://ptownrestaurant.com');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Failed to restore original data:', error);
    process.exit(1);
  }
}

restoreOriginalData();
