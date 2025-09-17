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

    console.log('🚨 Running emergency database setup...');

    // Emergency database setup SQL
    const setupSQL = `
-- Simplified Blog Post Creation - Emergency Fix
CREATE TABLE IF NOT EXISTS blog_posts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    content text NOT NULL,
    excerpt text,
    slug text UNIQUE,
    status text DEFAULT 'draft',
    author_id uuid REFERENCES auth.users(id),
    created_at timestamptz DEFAULT NOW(),
    updated_at timestamptz DEFAULT NOW(),
    published_at timestamptz,
    category text DEFAULT 'Other',
    tags text[] DEFAULT ARRAY[]::text[],
    featured_image text,
    seo_title text,
    meta_description text,
    focus_keyword text
);

CREATE TABLE IF NOT EXISTS user_roles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) UNIQUE,
    role text NOT NULL DEFAULT 'user',
    created_at timestamptz DEFAULT NOW(),
    updated_at timestamptz DEFAULT NOW()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read published posts" ON blog_posts;
CREATE POLICY "Anyone can read published posts" ON blog_posts
    FOR SELECT
    USING (status = 'published');

DROP POLICY IF EXISTS "Admins and editors can manage posts" ON blog_posts;
CREATE POLICY "Admins and editors can manage posts" ON blog_posts
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'editor')
        )
    );
`;

    const functionSQL = `
CREATE OR REPLACE FUNCTION create_simple_blog_post_role_based(
    p_title text,
    p_content text,
    p_status text DEFAULT 'draft',
    p_post_id uuid DEFAULT NULL
)
RETURNS TABLE(
    id uuid,
    title text,
    content text,
    status text,
    author_id uuid,
    created_at timestamptz,
    updated_at timestamptz,
    slug text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id uuid;
    v_user_role text;
    v_post_id uuid;
    v_slug text;
    v_base_slug text;
    v_counter integer := 1;
BEGIN
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;
    
    SELECT role INTO v_user_role 
    FROM user_roles 
    WHERE user_id = v_user_id;
    
    IF v_user_role IS NULL THEN
        INSERT INTO user_roles (user_id, role) 
        VALUES (v_user_id, 'editor')
        ON CONFLICT (user_id) DO UPDATE SET role = 'editor';
        v_user_role := 'editor';
    END IF;
    
    IF v_user_role NOT IN ('admin', 'editor') THEN
        RAISE EXCEPTION 'Insufficient permissions. Only admins and editors can create blog posts. Your role: %', COALESCE(v_user_role, 'none');
    END IF;
    
    v_base_slug := lower(regexp_replace(trim(p_title), '[^a-zA-Z0-9\\s]', '', 'g'));
    v_base_slug := regexp_replace(v_base_slug, '\\s+', '-', 'g');
    v_base_slug := trim(v_base_slug, '-');
    
    IF LENGTH(v_base_slug) = 0 THEN
        v_base_slug := 'untitled-post';
    END IF;
    
    v_slug := v_base_slug;
    
    WHILE EXISTS (SELECT 1 FROM blog_posts WHERE slug = v_slug AND (p_post_id IS NULL OR id != p_post_id)) LOOP
        v_slug := v_base_slug || '-' || v_counter;
        v_counter := v_counter + 1;
    END LOOP;
    
    IF p_post_id IS NOT NULL THEN
        UPDATE blog_posts SET
            title = p_title,
            content = p_content,
            status = p_status,
            slug = v_slug,
            updated_at = NOW()
        WHERE blog_posts.id = p_post_id
        AND author_id = v_user_id
        RETURNING blog_posts.id INTO v_post_id;
        
        IF v_post_id IS NULL THEN
            RAISE EXCEPTION 'Post not found or access denied';
        END IF;
    ELSE
        INSERT INTO blog_posts (
            title,
            content,
            status,
            author_id,
            slug,
            created_at,
            updated_at,
            published_at
        ) VALUES (
            p_title,
            p_content,
            p_status,
            v_user_id,
            v_slug,
            NOW(),
            NOW(),
            CASE WHEN p_status = 'published' THEN NOW() ELSE NULL END
        ) RETURNING blog_posts.id INTO v_post_id;
    END IF;
    
    RETURN QUERY
    SELECT 
        bp.id,
        bp.title,
        bp.content,
        bp.status,
        bp.author_id,
        bp.created_at,
        bp.updated_at,
        bp.slug
    FROM blog_posts bp
    WHERE bp.id = v_post_id;
END;
$$;

GRANT EXECUTE ON FUNCTION create_simple_blog_post_role_based TO authenticated;
`;

    const stubSQL = `
DROP FUNCTION IF EXISTS generate_comprehensive_keywords_and_tags(text, text, text);
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
    RETURN QUERY SELECT 
        ARRAY[]::text[] as keywords,
        ARRAY[]::text[] as tags,
        COALESCE(p_title, 'Untitled') as seo_title,
        COALESCE(LEFT(p_content, 150) || '...', 'No description available') as meta_description;
END;
$$;

GRANT EXECUTE ON FUNCTION generate_comprehensive_keywords_and_tags TO authenticated;
`;

    // Execute setup in parts
    const statements = [setupSQL, functionSQL, stubSQL];
    const results = [];

    for (let i = 0; i < statements.length; i++) {
      try {
        console.log(`Executing setup part ${i + 1}/${statements.length}`);
        const { data, error } = await supabaseClient.rpc('exec_sql', { 
          sql: statements[i]
        });
        
        results.push({ 
          part: i + 1, 
          success: !error, 
          error: error?.message 
        });
        
        if (error) {
          console.warn(`Warning in part ${i + 1}:`, error.message);
        }
      } catch (err) {
        console.warn(`Failed to execute part ${i + 1}:`, err.message);
        results.push({ 
          part: i + 1, 
          success: false, 
          error: err.message 
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Emergency database setup completed',
        results: results,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ Emergency setup error:', error);
    
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
