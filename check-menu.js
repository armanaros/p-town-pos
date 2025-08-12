// Script to check current menu items
// Run this with: node check-menu.js

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  getDocs 
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
    console.log('🍽️ Checking menu items in database...');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Check menuItems collection
    console.log('📋 Checking menuItems collection...');
    const menuSnapshot = await getDocs(collection(db, 'menuItems'));
    
    if (menuSnapshot.docs.length === 0) {
      console.log('❌ No menu items found in menuItems collection');
    } else {
      console.log(`✅ Found ${menuSnapshot.docs.length} menu items:`);
      menuSnapshot.docs.forEach((docRef, index) => {
        const itemData = docRef.data();
        console.log(`   ${index + 1}. ID: ${itemData.id}, Name: "${itemData.name}", Price: ₱${itemData.price}`);
      });
    }
    
    // Check config collection
    console.log('\n🔧 Checking config collection...');
    const configSnapshot = await getDocs(collection(db, 'config'));
    
    if (configSnapshot.docs.length === 0) {
      console.log('❌ No items found in config collection');
    } else {
      console.log(`✅ Found ${configSnapshot.docs.length} config items:`);
      configSnapshot.docs.forEach((docRef, index) => {
        const itemData = docRef.data();
        console.log(`   ${index + 1}. Document ID: ${docRef.id}`);
        console.log(`       Data: ${JSON.stringify(itemData, null, 2)}`);
      });
    }
    
    // Check if there's a menu collection
    console.log('\n🍽️ Checking menu collection...');
    const menuCollectionSnapshot = await getDocs(collection(db, 'menu'));
    
    if (menuCollectionSnapshot.docs.length === 0) {
      console.log('❌ No items found in menu collection');
    } else {
      console.log(`✅ Found ${menuCollectionSnapshot.docs.length} menu collection items:`);
      menuCollectionSnapshot.docs.forEach((docRef, index) => {
        const itemData = docRef.data();
        console.log(`   ${index + 1}. Document ID: ${docRef.id}`);
        console.log(`       Data: ${JSON.stringify(itemData, null, 2)}`);
      });
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error checking menu:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

main();
