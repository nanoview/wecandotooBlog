import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rowcloxlszwnowlggqon.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvd2Nsb3hsc3p3bm93bGdncW9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MjAwMDQsImV4cCI6MjA2OTM5NjAwNH0.ZfSyOYsBhKkmYkPRecxPlItCLzu8tF5T9SiurZh9eis';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructure() {
  console.log('📋 Checking blog_posts table structure...');
  
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .limit(1);
    
  if (error) {
    console.error('❌ Error:', error);
    return;
  }
  
  if (data && data.length > 0) {
    console.log('📝 Available columns:');
    Object.keys(data[0]).forEach(column => {
      console.log(`- ${column}: ${typeof data[0][column]}`);
    });
  } else {
    console.log('📭 No posts found');
  }
}

checkTableStructure().catch(console.error);
