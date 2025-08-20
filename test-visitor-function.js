// Test the visitor-tracker edge function directly
// This helps isolate if the issue is frontend or backend

const SUPABASE_URL = 'https://rowcloxlszwnowlggqon.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvd2Nsb3hsc3p3bm93bGdncW9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MjAwMDQsImV4cCI6MjA2OTM5NjAwNH0.ZfSyOYsBhKkmYkPRecxPlItCLzu8tF5T9SiurZh9eis';

async function testVisitorFunction() {
    console.log('🧪 Testing visitor-tracker edge function...\n');
    
    const testData = {
        sessionId: 'test-manual-' + Date.now(),
        action: 'create_session',
        data: {
            ip_address: '127.0.0.1',
            user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            device_type: 'desktop',
            browser: 'chrome',
            os: 'windows',
            referrer: 'https://test.com',
            country: 'US',
            city: 'Test City'
        }
    };

    try {
        console.log('📤 Sending request to edge function...');
        console.log('URL:', `${SUPABASE_URL}/functions/v1/visitor-tracker`);
        console.log('Data:', JSON.stringify(testData, null, 2));
        
        const response = await fetch(`${SUPABASE_URL}/functions/v1/visitor-tracker`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });

        console.log('\n📥 Response received:');
        console.log('Status:', response.status);
        console.log('Status Text:', response.statusText);
        console.log('Headers:', Object.fromEntries(response.headers.entries()));

        const responseText = await response.text();
        console.log('Raw Response:', responseText);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}, body: ${responseText}`);
        }

        let result;
        try {
            result = JSON.parse(responseText);
        } catch (parseError) {
            console.error('❌ Failed to parse JSON response:', parseError);
            console.log('Response was:', responseText);
            return;
        }

        console.log('\n✅ Success! Function response:');
        console.log(JSON.stringify(result, null, 2));

        if (result.success) {
            console.log('\n🎉 Visitor tracking function is working correctly!');
        } else {
            console.log('\n❌ Function returned error:', result.error);
        }

    } catch (error) {
        console.error('\n❌ Error testing function:', error.message);
        
        if (error.message.includes('500')) {
            console.log('\n💡 This suggests the database schema is missing required columns.');
            console.log('Please run the URGENT_DATABASE_FIX.sql script in Supabase dashboard first.');
        }
    }
}

// Also test a page view tracking
async function testPageView() {
    console.log('\n\n🧪 Testing page view tracking...\n');
    
    const sessionId = 'test-manual-' + Date.now();
    
    // First create a session
    const sessionData = {
        sessionId: sessionId,
        action: 'create_session',
        data: {
            ip_address: '127.0.0.1',
            user_agent: 'Test Browser',
            device_type: 'desktop',
            browser: 'chrome',
            os: 'windows'
        }
    };

    try {
        // Create session first
        const sessionResponse = await fetch(`${SUPABASE_URL}/functions/v1/visitor-tracker`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sessionData)
        });

        if (!sessionResponse.ok) {
            throw new Error(`Failed to create session: ${sessionResponse.status}`);
        }

        console.log('✅ Session created for page view test');
        
        // Now test page view
        const testData = {
            sessionId: sessionId,
            action: 'track_page_view',
            data: {
                post_id: '1',
                post_slug: 'test-post'
            }
        };
        
        console.log('📤 Sending page view request...');
        
        const response = await fetch(`${SUPABASE_URL}/functions/v1/visitor-tracker`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });

        console.log('Status:', response.status);
        const responseText = await response.text();
        console.log('Response:', responseText);

        if (response.ok) {
            const result = JSON.parse(responseText);
            console.log('✅ Page view tracking working!');
        } else {
            console.log('❌ Page view tracking failed');
        }

    } catch (error) {
        console.error('❌ Error testing page view:', error.message);
    }
}

// Run the tests
async function runAllTests() {
    await testVisitorFunction();
    
    // Use the same session ID for page view test
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    await testPageView();
    
    console.log('\n\n📋 Next Steps:');
    console.log('1. If you see 500 errors, run URGENT_DATABASE_FIX.sql in Supabase dashboard');
    console.log('2. If you see 404 errors, the function might not be deployed');
    console.log('3. If you see other errors, check the function logs in Supabase dashboard');
}

runAllTests();
