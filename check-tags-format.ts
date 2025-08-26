import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rowcloxlszwnowlggqon.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvd2Nsb3hsc3p3bm93bGdncW9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MjAwMDQsImV4cCI6MjA2OTM5NjAwNH0.ZfSyOYsBhKkmYkPRecxPlItCLzu8tF5T9SiurZh9eis';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTagsFormat() {
  console.log('🏷️ Checking tags format in existing posts...');
  
  const { data, error } = await supabase
    .from('blog_posts')
    .select('title, tags')
    .limit(3);
    
  if (error) {
    console.error('❌ Error:', error);
    return;
  }
  
  if (data && data.length > 0) {
    console.log('📝 Tags format examples:');
    data.forEach(post => {
      console.log(`\nTitle: ${post.title}`);
      console.log(`Tags: ${JSON.stringify(post.tags)}`);
      console.log(`Type: ${typeof post.tags}`);
    });
  } else {
    console.log('📭 No posts found');
  }
}

checkTagsFormat().catch(console.error);
