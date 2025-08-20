// Test iPhone IP detection specifically
const SUPABASE_URL = 'https://rowcloxlszwnowlggqon.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvd2Nsb3hsc3p3bm93bGdncW9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MjAwMDQsImV4cCI6MjA2OTM5NjAwNH0.ZfSyOYsBhKkmYkPRecxPlItCLzu8tF5T9SiurZh9eis';

async function testMobileIPDetection() {
    console.log('📱 Testing Mobile/iPhone IP Detection...\n');
    
    // Simulate what an iPhone might send
    const testData = {
        sessionId: 'iphone-test-' + Date.now(),
        action: 'create_session',
        data: {
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
            deviceType: 'mobile',
            browser: 'safari',
            os: 'ios',
            referrer: 'https://google.com',
            // Client-side detected IP (from ipapi.co or similar)
            ip: '203.0.113.123', // Example public IP
            country: 'United States',
            countryCode: 'US',
            city: 'San Francisco',
            region: 'California'
        }
    };

    try {
        console.log('📤 Sending iPhone request to edge function...');
        console.log('Data:', JSON.stringify(testData, null, 2));
        
        const response = await fetch(`${SUPABASE_URL}/functions/v1/visitor-tracker`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'User-Agent': testData.data.userAgent,
                // Simulate headers that might be missing or problematic for mobile
                'X-Forwarded-For': '0.0.0.0', // This would cause the 0.0.0.0 issue
            },
            body: JSON.stringify(testData)
        });

        console.log('\n📥 Response received:');
        console.log('Status:', response.status);

        const responseText = await response.text();
        console.log('Response:', responseText);

        if (response.ok) {
            const result = JSON.parse(responseText);
            console.log('\n✅ Success! IP detected:', result.data.ip_address);
            
            if (result.data.ip_address !== '0.0.0.0' && result.data.ip_address !== 'mobile-device') {
                console.log('🎉 iPhone IP detection working correctly!');
            } else {
                console.log('⚠️  Still getting fallback IP:', result.data.ip_address);
            }
        } else {
            console.log('❌ Mobile IP detection failed');
        }

    } catch (error) {
        console.error('❌ Error testing mobile IP:', error.message);
    }
}

// Also test with completely missing headers (worst case scenario)
async function testWorstCaseScenario() {
    console.log('\n\n🔧 Testing worst case scenario (no IP headers)...\n');
    
    const testData = {
        sessionId: 'worst-case-' + Date.now(),
        action: 'create_session',
        data: {
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
            deviceType: 'mobile',
            browser: 'safari',
            os: 'ios',
            // Client-side detected IP should be used
            ip: '198.51.100.45',
            country: 'Canada',
            city: 'Toronto'
        }
    };

    try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/visitor-tracker`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                // No IP headers at all
            },
            body: JSON.stringify(testData)
        });

        if (response.ok) {
            const result = JSON.parse(await response.text());
            console.log('✅ Worst case IP:', result.data.ip_address);
            
            if (result.data.ip_address === testData.data.ip) {
                console.log('🎉 Client-side IP fallback working perfectly!');
            }
        }

    } catch (error) {
        console.error('❌ Worst case test failed:', error.message);
    }
}

async function runMobileTests() {
    await testMobileIPDetection();
    await testWorstCaseScenario();
    
    console.log('\n\n📋 Summary:');
    console.log('• If you see valid IPs (not 0.0.0.0), the fix is working');
    console.log('• The function now uses client-side IP detection as fallback');
    console.log('• Check function logs in Supabase dashboard for detailed debugging');
}

runMobileTests();
