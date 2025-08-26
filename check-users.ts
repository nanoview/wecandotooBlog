import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rowcloxlszwnowlggqon.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvd2Nsb3hsc3p3bm93bGdncW9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MjAwMDQsImV4cCI6MjA2OTM5NjAwNH0.ZfSyOYsBhKkmYkPRecxPlItCLzu8tF5T9SiurZh9eis';

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
