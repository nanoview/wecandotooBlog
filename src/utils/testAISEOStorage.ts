import { supabase } from '@/integrations/supabase/client';

// Test function to verify AI SEO data storage
export const testAISEOStorage = async () => {
  try {
    // Test 1: Check if SEO columns exist
    console.log('🔍 Testing AI SEO Database Storage...');
    
    const { data: columns, error: columnError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'blog_posts')
      .in('column_name', [
        'meta_description', 
        'focus_keyword', 
        'suggested_keywords', 
        'seo_score', 
        'last_seo_update'
      ]);

    if (columnError) {
      console.error('❌ Error checking columns:', columnError);
      return false;
    }

    const existingColumns = columns?.map(col => col.column_name) || [];
    console.log('✅ Found SEO columns:', existingColumns);

    // Test 2: Try to fetch a blog post and check SEO fields
    const { data: posts, error: postError } = await supabase
      .from('blog_posts')
      .select(`
        id, 
        title, 
        meta_description, 
        focus_keyword, 
        suggested_keywords, 
        seo_score, 
        last_seo_update
      `)
      .limit(1);

    if (postError) {
      console.error('❌ Error fetching posts:', postError);
      return false;
    }

    if (posts && posts.length > 0) {
      console.log('✅ Sample post SEO data:', posts[0]);
    } else {
      console.log('ℹ️ No posts found to test');
    }

    // Test 3: Try to update SEO data (mock)
    if (posts && posts.length > 0) {
      const testUpdate = {
        meta_description: 'Test AI-generated description',
        focus_keyword: 'test keyword',
        suggested_keywords: ['test', 'ai', 'seo'],
        seo_score: 85,
        last_seo_update: new Date().toISOString()
      };

      const { error: updateError } = await supabase
        .from('blog_posts')
        .update(testUpdate)
        .eq('id', posts[0].id);

      if (updateError) {
        console.error('❌ Error updating SEO data:', updateError);
        return false;
      }

      console.log('✅ Successfully updated SEO data');
      
      // Revert the test update
      const { error: revertError } = await supabase
        .from('blog_posts')
        .update({
          meta_description: posts[0].meta_description,
          focus_keyword: posts[0].focus_keyword,
          suggested_keywords: posts[0].suggested_keywords,
          seo_score: posts[0].seo_score,
          last_seo_update: posts[0].last_seo_update
        })
        .eq('id', posts[0].id);

      if (!revertError) {
        console.log('✅ Reverted test changes');
      }
    }

    console.log('🎉 AI SEO storage test completed successfully!');
    return true;

  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
};

// Usage: Call this function in your admin panel to test
// testAISEOStorage();
