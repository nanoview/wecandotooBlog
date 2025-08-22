// 🔧 CONSOLE TEST FOR ADMIN ANALYTICS ACCESS
// Copy and paste this into your browser console to test the visitor analytics

// Test 1: Check if you can access visitor_sessions
console.log('🔍 Testing visitor_sessions access...');
const { createClient } = window.supabase || {};

if (createClient) {
  const supabase = createClient(
    'https://rowcloxlszwnowlggqon.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvd2Nsb3hsc3p3bm93bGdncW9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ3OTAyNzcsImV4cCI6MjA1MDM2NjI3N30.wf2TIf_fFEfnyMIgQvKPrZQBNpj38XOHYqHuaMj8J8c'
  );

  // Test visitor_sessions access
  supabase
    .from('visitor_sessions')
    .select('*')
    .limit(5)
    .then(({ data, error }) => {
      if (error) {
        console.error('❌ visitor_sessions error:', error);
      } else {
        console.log('✅ visitor_sessions access working!', data?.length, 'sessions found');
      }
    });

  // Test post_impressions access
  supabase
    .from('post_impressions')
    .select('*')
    .limit(5)
    .then(({ data, error }) => {
      if (error) {
        console.error('❌ post_impressions error:', error);
      } else {
        console.log('✅ post_impressions access working!', data?.length, 'impressions found');
      }
    });

  // Test current user auth status
  supabase.auth.getUser().then(({ data: { user }, error }) => {
    if (error) {
      console.error('❌ Auth error:', error);
    } else if (user) {
      console.log('✅ User authenticated:', user.email);
    } else {
      console.log('⚠️ User not authenticated - please log in first');
    }
  });

} else {
  console.log('⚠️ Supabase not loaded. Try this on the actual website.');
}

console.log('📊 Analytics test completed. Check the results above.');
