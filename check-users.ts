import { createClient } from '@supabase/supabase-js';

// ⚠️ SECURITY: Load from environment variables - never hardcode tokens!
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'your_supabase_url_here';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your_supabase_anon_key_here';

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your_') || supabaseKey.includes('your_')) {
  console.error('❌ Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsers() {
  console.log('👥 Checking available users...');
  
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('user_id, username, display_name')
    .limit(10);
    
  if (error) {
    console.error('❌ Error fetching users:', error);
    return;
  }
  
  console.log('📋 Available users:');
  profiles?.forEach(profile => {
    console.log(`- ID: ${profile.user_id}`);
    console.log(`  Username: ${profile.username || 'No username'}`);
    console.log(`  Display Name: ${profile.display_name || 'No display name'}`);
    console.log('---');
  });
}

checkUsers().catch(console.error);
