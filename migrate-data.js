// Migrate data from Realtime Database to Firestore
const admin = require('firebase-admin');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc } = require('firebase/firestore');

console.log('🔄 Starting data migration from Realtime Database to Firestore...');

// Initialize Firebase Admin (for Realtime Database)
const serviceAccount = {
  "type": "service_account",
  "project_id": "p-town-pos",
  "private_key_id": "key_id",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk@p-town-pos.iam.gserviceaccount.com",
  "client_id": "client_id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token"
};

// Use environment variable or service account
const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS ? 
  admin.credential.applicationDefault() : 
  admin.credential.cert({
    projectId: "p-town-pos",
    // We'll use the same config as client
  });

admin.initializeApp({
  credential: credentials,
  databaseURL: "https://p-town-default-rtdb.firebaseio.com/"
});

// Initialize Firestore client
const firebaseConfig = {
  apiKey: "AIzaSyB6IKNhxMfAJ_07WlppWMWMdxK3jT81DJs",
  authDomain: "p-town-pos.firebaseapp.com",
  projectId: "p-town-pos",
  storageBucket: "p-town-pos.firebasestorage.app",
  messagingSenderId: "1079263515484",
  appId: "1:1079263515484:web:638f304af025663d472799",
  measurementId: "G-38L32K0BH9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const rtdb = admin.database();

async function migrateData() {
  try {
    // Migrate Orders
    console.log('📋 Migrating orders...');
    const ordersSnapshot = await rtdb.ref('orders').once('value');
    const orders = ordersSnapshot.val();
    
    if (orders) {
      console.log(`Found ${Object.keys(orders).length} orders to migrate`);
      for (const [orderId, orderData] of Object.entries(orders)) {
        await setDoc(doc(db, 'orders', orderId), orderData);
        console.log(`✅ Migrated order: ${orderId}`);
      }
    }

    // Migrate Menu Items
    console.log('🍽️ Migrating menu items...');
    const menuSnapshot = await rtdb.ref('menuItems').once('value');
    const menuItems = menuSnapshot.val();
    
    if (menuItems) {
      console.log(`Found ${Object.keys(menuItems).length} menu items to migrate`);
      for (const [itemId, itemData] of Object.entries(menuItems)) {
        await setDoc(doc(db, 'menuItems', itemId), itemData);
        console.log(`✅ Migrated menu item: ${itemData.name}`);
      }
    }

    // Migrate Cashiers if they exist
    console.log('👨‍💼 Checking for cashiers...');
    const cashiersSnapshot = await rtdb.ref('cashiers').once('value');
    const cashiers = cashiersSnapshot.val();
    
    if (cashiers) {
      console.log(`Found ${Object.keys(cashiers).length} cashiers to migrate`);
      for (const [cashierId, cashierData] of Object.entries(cashiers)) {
        await setDoc(doc(db, 'cashiers', cashierId), cashierData);
        console.log(`✅ Migrated cashier: ${cashierData.name || cashierId}`);
      }
    }

    console.log('🎉 Data migration completed successfully!');
    console.log('Your restaurant data is now available in Firestore.');
    process.exit(0);

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrateData();
