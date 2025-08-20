-- 🔧 Fixed version of AUTO SEO TAGS KEYWORDS
-- This version handles different column types properly

-- First, let's check what column types we have
SELECT 
    column_name,
    data_type,
    udt_name
FROM information_schema.columns 
WHERE table_name = 'blog_posts'
    AND column_name IN ('tags', 'suggested_keywords');

-- Create a safe update function that handles different column types
CREATE OR REPLACE FUNCTION safe_update_seo_posts()
RETURNS TEXT AS $$
DECLARE
    tags_type TEXT;
    keywords_type TEXT;
    update_count INTEGER := 0;
BEGIN
    -- Get column types
    SELECT data_type INTO tags_type 
    FROM information_schema.columns 
    WHERE table_name = 'blog_posts' AND column_name = 'tags';
    
    SELECT data_type INTO keywords_type 
    FROM information_schema.columns 
    WHERE table_name = 'blog_posts' AND column_name = 'suggested_keywords';
    
    -- Update posts based on column types
    IF tags_type = 'ARRAY' AND keywords_type = 'jsonb' THEN
        -- tags is text[], suggested_keywords is JSONB
        UPDATE blog_posts 
        SET title = title, updated_at = CURRENT_TIMESTAMP
        WHERE suggested_keywords IS NULL 
           OR tags IS NULL 
           OR suggested_keywords = '[]'::JSONB 
           OR COALESCE(array_length(tags, 1), 0) = 0
           OR jsonb_array_length(COALESCE(suggested_keywords, '[]'::JSONB)) < 3;
           
    ELSIF tags_type = 'jsonb' AND keywords_type = 'jsonb' THEN
        -- Both are JSONB
        UPDATE blog_posts 
        SET title = title, updated_at = CURRENT_TIMESTAMP
        WHERE suggested_keywords IS NULL 
           OR tags IS NULL 
           OR suggested_keywords = '[]'::JSONB 
           OR tags = '[]'::JSONB
           OR jsonb_array_length(COALESCE(suggested_keywords, '[]'::JSONB)) < 3
           OR jsonb_array_length(COALESCE(tags, '[]'::JSONB)) < 1;
           
    ELSIF tags_type = 'ARRAY' AND keywords_type = 'ARRAY' THEN
        -- Both are text[]
        UPDATE blog_posts 
        SET title = title, updated_at = CURRENT_TIMESTAMP
        WHERE suggested_keywords IS NULL 
           OR tags IS NULL 
           OR COALESCE(array_length(suggested_keywords, 1), 0) = 0
           OR COALESCE(array_length(tags, 1), 0) = 0;
           
    ELSE
        -- Mixed or other types - be more conservative
        UPDATE blog_posts 
        SET title = title, updated_at = CURRENT_TIMESTAMP
        WHERE suggested_keywords IS NULL OR tags IS NULL;
    END IF;
    
    GET DIAGNOSTICS update_count = ROW_COUNT;
    
    RETURN 'Updated ' || update_count || ' posts with tags_type: ' || COALESCE(tags_type, 'NULL') || 
           ', keywords_type: ' || COALESCE(keywords_type, 'NULL');
END;
$$ LANGUAGE plpgsql;

-- Run the safe update
SELECT safe_update_seo_posts() as update_result;
