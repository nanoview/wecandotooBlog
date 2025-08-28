import { createClient } from '@supabase/supabase-js';

// ⚠️ SECURITY: Load from environment variables - never hardcode tokens!
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'your_supabase_url_here';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your_supabase_anon_key_here';

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your_') || supabaseKey.includes('your_')) {
  console.error('❌ Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

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
