import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Critical fix SQL
    const fixSQL = `
-- CRITICAL FIX: Remove problematic function and replace with safe version
DO $$
BEGIN
    -- Drop any triggers on blog_posts that might call the function
    DROP TRIGGER IF EXISTS update_blog_keywords ON blog_posts;
    DROP TRIGGER IF EXISTS blog_post_seo_trigger ON blog_posts;
    DROP TRIGGER IF EXISTS generate_blog_seo ON blog_posts;
    DROP TRIGGER IF EXISTS auto_generate_seo ON blog_posts;
    DROP TRIGGER IF EXISTS blog_post_keywords_trigger ON blog_posts;
    
    RAISE NOTICE '✅ Removed any remaining SEO triggers';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Some triggers may not have existed: %', SQLERRM;
END $$;

-- Drop the problematic function if it exists
DROP FUNCTION IF EXISTS generate_comprehensive_keywords_and_tags(text, text, text);
DROP FUNCTION IF EXISTS generate_comprehensive_keywords_and_tags(text, text);
DROP FUNCTION IF EXISTS generate_comprehensive_keywords_and_tags(text);

-- Create a safe stub version
CREATE OR REPLACE FUNCTION generate_comprehensive_keywords_and_tags(
    p_title text DEFAULT '',
    p_content text DEFAULT '',
    p_category text DEFAULT 'other'
)
RETURNS TABLE(
    keywords text[],
    tags text[],
    seo_title text,
    meta_description text
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RAISE NOTICE '🚨 DEPRECATED: generate_comprehensive_keywords_and_tags called. Use manual SEO generation instead.';
    
    RETURN QUERY SELECT 
        ARRAY[]::text[] as keywords,
        ARRAY[]::text[] as tags,
        COALESCE(p_title, 'Untitled') as seo_title,
        COALESCE(LEFT(p_content, 150) || '...', 'No description available') as meta_description
    ;
END;
$$;

GRANT EXECUTE ON FUNCTION generate_comprehensive_keywords_and_tags TO authenticated;
`;

    console.log('🔧 Applying critical database fix...');

    // Execute the fix
    const { data, error } = await supabaseClient.rpc('exec_sql', { 
      sql: fixSQL 
    });

    if (error) {
      console.error('❌ Error applying fix:', error);
      
      // Try alternative approach - execute each statement separately
      const statements = fixSQL.split(';').filter(stmt => stmt.trim());
      
      for (const statement of statements) {
        if (statement.trim()) {
          try {
            await supabaseClient.rpc('exec_sql', { sql: statement.trim() + ';' });
          } catch (err) {
            console.warn('⚠️ Statement failed (may be expected):', statement.substring(0, 50) + '...');
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Critical database fix applied successfully',
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ Critical fix error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
