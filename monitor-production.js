// Real-time Production Monitor
// Monitors the live production site for issues

const https = require('https');

console.log('🔥 Starting Production Monitoring...');

async function checkProductionHealth() {
    return new Promise((resolve, reject) => {
        const req = https.request('https://ptownrestaurant.com', { 
            method: 'GET',
            timeout: 10000
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const healthData = {
                    statusCode: res.statusCode,
                    headers: res.headers,
                    responseTime: Date.now(),
                    contentLength: data.length,
                    hasReactApp: data.includes('react-app'),
                    hasFirebase: data.includes('firebase'),
                    hasErrors: data.includes('error') || data.includes('Error'),
                };
                resolve(healthData);
            });
        });
        
        req.on('error', reject);
        req.on('timeout', () => reject(new Error('Request timeout')));
        req.end();
    });
}

async function monitorProduction() {
    try {
        console.log('🌐 Checking production site health...');
        const health = await checkProductionHealth();
        
        console.log('📊 PRODUCTION HEALTH REPORT:');
        console.log(`Status Code: ${health.statusCode === 200 ? '✅' : '❌'} ${health.statusCode}`);
        console.log(`Content Length: ${health.contentLength} bytes`);
        console.log(`React App Detected: ${health.hasReactApp ? '✅' : '❌'}`);
        console.log(`Firebase Detected: ${health.hasFirebase ? '✅' : '❌'}`);
        console.log(`Errors Detected: ${health.hasErrors ? '⚠️ Yes' : '✅ None'}`);
        console.log(`Content-Type: ${health.headers['content-type']}`);
        console.log(`Server: ${health.headers.server || 'Unknown'}`);
        
        if (health.statusCode !== 200) {
            console.log('❌ Production site is not responding properly!');
            return false;
        }
        
        if (!health.hasReactApp) {
            console.log('⚠️ React app may not be loading properly');
        }
        
        console.log('✅ Production site is healthy');
        return true;
        
    } catch (error) {
        console.error('❌ Production health check failed:', error.message);
        return false;
    }
}

// Check for specific admin/staff issues
async function checkAdminFeatures() {
    console.log('👤 Checking admin features...');
    
    // Simulate checking if admin routes work
    // (In a real browser, you'd navigate to these)
    const criticalRoutes = [
        '/#admin',
        '/#staff',
        '/#cashier'
    ];
    
    console.log('🔗 Critical routes to test:');
    criticalRoutes.forEach(route => {
        console.log(`  - https://ptownrestaurant.com${route}`);
    });
}

// Main monitoring loop
async function startDebugSession() {
    console.log('🚀 Starting Production Debug Session');
    console.log('Time:', new Date().toLocaleString());
    console.log('=====================================');
    
    const isHealthy = await monitorProduction();
    console.log('');
    
    await checkAdminFeatures();
    console.log('');
    
    console.log('🛠️ DEBUGGING TOOLS:');
    console.log('1. Open browser dev tools on: https://ptownrestaurant.com');
    console.log('2. Check Network tab for failed requests');
    console.log('3. Check Console tab for JavaScript errors');
    console.log('4. Test login flows: Admin → Staff tab');
    console.log('5. Test emoji display in Employee & Expense Management');
    console.log('');
    
    console.log('📝 RECENT CHANGES:');
    console.log('- ✅ Fixed corrupted emojis in staff management');
    console.log('- ✅ Removed duplicate gross margin KPI');
    console.log('- ✅ Cleaned up 113 VS Code problems');
    console.log('- ✅ Removed obsolete emoji fix scripts');
    console.log('');
    
    if (isHealthy) {
        console.log('🎉 Production debugging session ready!');
        console.log('🌐 Live site: https://ptownrestaurant.com');
        console.log('🛠️ Admin panel: https://app.netlify.com/projects/poetic-crisp-86f64a');
    } else {
        console.log('⚠️ Production issues detected - investigate immediately!');
    }
}

startDebugSession().catch(console.error);
