// Clear localStorage script - run this in browser console
// This removes any cached menu items with hardcoded sample data

console.log('Clearing localStorage...');

// Remove any cached menu items
localStorage.removeItem('menuItems');

// Remove any other cached data that might contain sample data
localStorage.removeItem('orders');
localStorage.removeItem('orderCounter');

console.log('localStorage cleared successfully!');
console.log('Please refresh the page to ensure clean state.');
