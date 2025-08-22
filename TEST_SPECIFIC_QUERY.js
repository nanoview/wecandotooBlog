// 🔧 SPECIFIC TEST FOR THE FAILING QUERY
// This tests the exact query that was returning 403 Forbidden

console.log('🔍 Testing the specific failing query...');

// Test the exact query from the error message
fetch('https://rowcloxlszwnowlggqon.supabase.co/rest/v1/visitor_sessions?select=*&created_at=gte.2025-08-20T21%3A00%3A00.000Z&order=created_at.desc&limit=100', {
  method: 'GET',
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvd2Nsb3hsc3p3bm93bGdncW9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ3OTAyNzcsImV4cCI6MjA1MDM2NjI3N30.wf2TIf_fFEfnyMIgQvKPrZQBNpj38XOHYqHuaMj8J8c',
    'Authorization': 'Bearer ' + (localStorage.getItem('supabase.auth.token') || 'no-token'),
    'Content-Type': 'application/json'
  }
})
.then(response => {
  console.log('📊 Response status:', response.status);
  if (response.ok) {
    return response.json();
  } else {
    console.error('❌ Response not OK:', response.status, response.statusText);
    return response.text().then(text => {
      console.error('❌ Error details:', text);
    });
  }
})
.then(data => {
  if (data) {
    console.log('✅ Query successful! Data:', data);
  }
})
.catch(error => {
  console.error('❌ Fetch error:', error);
});

// Also test with the current session token
if (window.supabase?.auth) {
  window.supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) {
      console.log('🔑 Testing with current session token...');
      fetch('https://rowcloxlszwnowlggqon.supabase.co/rest/v1/visitor_sessions?select=*&created_at=gte.2025-08-20T21%3A00%3A00.000Z&order=created_at.desc&limit=100', {
        method: 'GET',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvd2Nsb3hsc3p3bm93bGdncW9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ3OTAyNzcsImV4cCI6MjA1MDM2NjI3N30.wf2TIf_fFEfnyMIgQvKPrZQBNpj38XOHYqHuaMj8J8c',
          'Authorization': 'Bearer ' + session.access_token,
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        console.log('🔑 Authenticated response status:', response.status);
        if (response.ok) {
          return response.json();
        } else {
          return response.text();
        }
      })
      .then(data => {
        console.log('🔑 Authenticated query result:', data);
      });
    } else {
      console.log('⚠️ No active session found');
    }
  });
}
