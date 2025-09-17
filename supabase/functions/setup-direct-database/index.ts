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

    console.log('🚀 Setting up simplified direct database system...');

    // Read the SQL file content
    const simplifiedSQL = `
-- SIMPLIFIED BLOG SYSTEM - NO EDGE FUNCTIONS NEEDED
CREATE TABLE IF NOT EXISTS blog_posts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    content text NOT NULL,
    excerpt text,
    slug text UNIQUE,
    status text DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    author_id uuid REFERENCES auth.users(id),
    created_at timestamptz DEFAULT NOW(),
    updated_at timestamptz DEFAULT NOW(),
    published_at timestamptz,
    category text DEFAULT 'Other',
    tags text[] DEFAULT ARRAY[]::text[],
    featured_image text,
    seo_title text,
    meta_description text,
    focus_keyword text,
    read_time integer DEFAULT 0
);

CREATE TABLE IF NOT EXISTS user_roles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) UNIQUE,
    role text NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'editor', 'user')),
    created_at timestamptz DEFAULT NOW(),
    updated_at timestamptz DEFAULT NOW()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published posts" ON blog_posts;
CREATE POLICY "Public can read published posts" ON blog_posts
    FOR SELECT
    USING (status = 'published');

DROP POLICY IF EXISTS "Users can read own posts" ON blog_posts;
CREATE POLICY "Users can read own posts" ON blog_posts
    FOR SELECT
    USING (author_id = auth.uid());

DROP POLICY IF EXISTS "Admins and editors can manage all posts" ON blog_posts;
CREATE POLICY "Admins and editors can manage all posts" ON blog_posts
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'editor')
        )
    );

DROP POLICY IF EXISTS "Users can read own role" ON user_roles;
CREATE POLICY "Users can read own role" ON user_roles
    FOR SELECT
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage all roles" ON user_roles;
CREATE POLICY "Admins can manage all roles" ON user_roles
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE OR REPLACE FUNCTION create_blog_post_direct(
    p_title text,
    p_content text,
    p_status text DEFAULT 'draft',
    p_category text DEFAULT 'Other',
    p_tags text[] DEFAULT ARRAY[]::text[],
    p_excerpt text DEFAULT NULL
)
RETURNS json
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
    v_result json;
BEGIN
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Authentication required',
            'code', 'AUTH_REQUIRED'
        );
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
        RETURN json_build_object(
            'success', false,
            'error', 'Insufficient permissions. Only admins and editors can create posts.',
            'code', 'INSUFFICIENT_PERMISSIONS',
            'user_role', v_user_role
        );
    END IF;
    
    v_base_slug := lower(regexp_replace(trim(p_title), '[^a-zA-Z0-9\\s]', '', 'g'));
    v_base_slug := regexp_replace(v_base_slug, '\\s+', '-', 'g');
    v_base_slug := trim(v_base_slug, '-');
    
    IF LENGTH(v_base_slug) = 0 THEN
        v_base_slug := 'untitled-post';
    END IF;
    
    v_slug := v_base_slug;
    
    WHILE EXISTS (SELECT 1 FROM blog_posts WHERE slug = v_slug) LOOP
        v_slug := v_base_slug || '-' || v_counter;
        v_counter := v_counter + 1;
    END LOOP;
    
    INSERT INTO blog_posts (
        title,
        content,
        excerpt,
        status,
        author_id,
        slug,
        category,
        tags,
        published_at,
        created_at,
        updated_at
    ) VALUES (
        p_title,
        p_content,
        COALESCE(p_excerpt, LEFT(regexp_replace(p_content, '<[^>]*>', '', 'g'), 150) || '...'),
        p_status,
        v_user_id,
        v_slug,
        p_category,
        p_tags,
        CASE WHEN p_status = 'published' THEN NOW() ELSE NULL END,
        NOW(),
        NOW()
    ) RETURNING id INTO v_post_id;
    
    SELECT json_build_object(
        'success', true,
        'message', 'Blog post created successfully',
        'post', json_build_object(
            'id', bp.id,
            'title', bp.title,
            'slug', bp.slug,
            'status', bp.status,
            'author_id', bp.author_id,
            'created_at', bp.created_at,
            'updated_at', bp.updated_at,
            'category', bp.category,
            'tags', bp.tags
        ),
        'user_role', v_user_role,
        'note', 'Post created successfully. SEO can be generated later via dashboard.'
    ) INTO v_result
    FROM blog_posts bp
    WHERE bp.id = v_post_id;
    
    RETURN v_result;
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM,
            'code', SQLSTATE,
            'hint', 'Database error occurred during post creation'
        );
END;
$$;

GRANT EXECUTE ON FUNCTION create_blog_post_direct TO authenticated;

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id uuid;
    v_user_role text;
BEGIN
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Not authenticated'
        );
    END IF;
    
    SELECT role INTO v_user_role 
    FROM user_roles 
    WHERE user_id = v_user_id;
    
    RETURN json_build_object(
        'success', true,
        'user_id', v_user_id,
        'role', COALESCE(v_user_role, 'none'),
        'has_posting_permission', COALESCE(v_user_role, 'none') IN ('admin', 'editor')
    );
END;
$$;

GRANT EXECUTE ON FUNCTION get_user_role TO authenticated;

DROP FUNCTION IF EXISTS generate_comprehensive_keywords_and_tags(text, text, text);
`;

    // Execute the setup
    try {
      const { data, error } = await supabaseClient.rpc('exec_sql', { 
        sql: simplifiedSQL 
      });
      
      if (error) {
        console.error('Error executing SQL:', error);
        throw error;
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Simplified direct database system setup complete! No edge functions needed.',
          details: 'Blog posts can now be created directly via database functions.',
          next_steps: [
            'Update frontend to use create_blog_post_direct() via RPC',
            'Remove edge function dependencies',
            'Test blog post creation'
          ],
          timestamp: new Date().toISOString()
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
      
    } catch (setupError) {
      console.error('Setup error:', setupError);
      
      return new Response(
        JSON.stringify({ 
          error: setupError.message,
          success: false,
          details: 'Failed to setup simplified database system'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

  } catch (error) {
    console.error('❌ Setup error:', error);
    
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
