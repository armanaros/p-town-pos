const https = require('https');

console.log('📱 MOBILE & TABLET PRODUCTION DEBUGGER');
console.log('=====================================');
console.log('Time:', new Date().toLocaleString());
console.log('');

// Different user agents for testing
const userAgents = {
    'iPhone': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    'iPad': 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    'Android Phone': 'Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36',
    'Android Tablet': 'Mozilla/5.0 (Linux; Android 13; SM-T870) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
    'Desktop': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36'
};

function testDeviceResponse(deviceName, userAgent) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'ptownrestaurant.com',
            port: 443,
            path: '/',
            method: 'GET',
            headers: {
                'User-Agent': userAgent,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                // Check for mobile-specific elements
                const hasViewport = data.includes('viewport');
                const hasResponsive = data.includes('responsive') || data.includes('mobile');
                const hasBootstrap = data.includes('bootstrap');
                const hasTouchIcons = data.includes('apple-touch-icon') || data.includes('android-chrome');
                const hasCSS = data.includes('main.5b27e879.css') || data.includes('main.') && data.includes('.css');
                const hasJS = data.includes('main.efaebe38.js') || data.includes('main.') && data.includes('.js');

                console.log(`\n📱 ${deviceName} Response:`);
                console.log(`   Status: ${res.statusCode === 200 ? '✅' : '❌'} ${res.statusCode}`);
                console.log(`   Content-Length: ${res.headers['content-length'] || data.length} bytes`);
                console.log(`   Viewport Meta: ${hasViewport ? '✅' : '❌'}`);
                console.log(`   CSS Bundle: ${hasCSS ? '✅' : '❌'}`);
                console.log(`   JS Bundle: ${hasJS ? '✅' : '❌'}`);
                console.log(`   Touch Icons: ${hasTouchIcons ? '✅' : '❌'}`);
                
                // Debug: Show first 100 chars of content
                console.log(`   Content preview: ${data.substring(0, 100)}...`);
                
                // Check for potential mobile issues
                if (data.length < 500) {
                    console.log('   ⚠️  Content seems too small - possible loading issue');
                }
                
                resolve({
                    device: deviceName,
                    status: res.statusCode,
                    contentLength: data.length,
                    hasViewport,
                    hasCSS,
                    hasJS,
                    headers: res.headers
                });
            });
        });

        req.on('error', (e) => {
            console.log(`\n❌ ${deviceName} Error: ${e.message}`);
            reject(e);
        });

        req.setTimeout(10000, () => {
            console.log(`\n⏰ ${deviceName} Timeout`);
            req.destroy();
            reject(new Error('Timeout'));
        });

        req.end();
    });
}

async function testMobileRoutes() {
    const routes = ['/', '/#admin', '/#cashier', '/#menu'];
    const mobileUA = userAgents['iPhone'];
    
    console.log('\n🔗 TESTING MOBILE ROUTES:');
    console.log('========================');
    
    for (const route of routes) {
        try {
            const options = {
                hostname: 'ptownrestaurant.com',
                port: 443,
                path: route,
                method: 'GET',
                headers: { 'User-Agent': mobileUA }
            };

            const result = await new Promise((resolve, reject) => {
                const req = https.request(options, (res) => {
                    console.log(`   ${route}: ${res.statusCode === 200 ? '✅' : '❌'} ${res.statusCode}`);
                    resolve(res.statusCode);
                });
                req.on('error', reject);
                req.setTimeout(5000, () => reject(new Error('Timeout')));
                req.end();
            });
        } catch (error) {
            console.log(`   ${route}: ❌ ${error.message}`);
        }
    }
}

async function runMobileDebug() {
    try {
        console.log('🚀 Starting mobile/tablet debugging...\n');
        
        // Test different devices
        for (const [deviceName, userAgent] of Object.entries(userAgents)) {
            try {
                await testDeviceResponse(deviceName, userAgent);
                await new Promise(resolve => setTimeout(resolve, 500)); // Rate limiting
            } catch (error) {
                console.log(`❌ ${deviceName} failed: ${error.message}`);
            }
        }
        
        // Test mobile routes
        await testMobileRoutes();
        
        console.log('\n📋 MOBILE DEBUGGING CHECKLIST:');
        console.log('==============================');
        console.log('1. 📱 iPhone Safari Test:');
        console.log('   - Open https://ptownrestaurant.com on iPhone');
        console.log('   - Check if UI scales properly');
        console.log('   - Test touch interactions');
        console.log('   - Verify admin login works');
        console.log('');
        console.log('2. 📱 Android Chrome Test:');
        console.log('   - Open site on Android device');
        console.log('   - Check responsive layout');
        console.log('   - Test menu navigation');
        console.log('   - Verify staff tab emojis');
        console.log('');
        console.log('3. 📱 iPad/Tablet Test:');
        console.log('   - Open on tablet device');
        console.log('   - Check landscape/portrait modes');
        console.log('   - Test admin dashboard layout');
        console.log('   - Verify cashier interface');
        console.log('');
        console.log('4. 🔍 Browser Dev Tools Mobile Simulation:');
        console.log('   - Open Chrome DevTools (F12)');
        console.log('   - Click device toolbar icon (Ctrl+Shift+M)');
        console.log('   - Test different device sizes');
        console.log('   - Check console for mobile-specific errors');
        
        console.log('\n⚠️  COMMON MOBILE ISSUES TO CHECK:');
        console.log('===================================');
        console.log('- Text too small to read');
        console.log('- Buttons too small to tap');
        console.log('- Horizontal scrolling required');
        console.log('- Forms not mobile-friendly');
        console.log('- Menu items overlapping');
        console.log('- Touch targets too close together');
        console.log('- Loading performance on mobile networks');
        
        console.log('\n🛠️  MOBILE DEBUGGING TOOLS:');
        console.log('============================');
        console.log('- Chrome DevTools Device Mode');
        console.log('- Safari Web Inspector (iOS)');
        console.log('- Android Chrome Remote Debugging');
        console.log('- Responsive Design Mode (Firefox)');
        
        console.log('\n✅ Mobile debugging analysis complete!');
        console.log('🌐 Test URL: https://ptownrestaurant.com');
        
    } catch (error) {
        console.error('❌ Mobile debug failed:', error.message);
    }
}

runMobileDebug();
