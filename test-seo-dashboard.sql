-- Test the SEO Dashboard creation with proper data type handling

-- First, let's check what columns exist in blog_posts
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'blog_posts' 
AND column_name IN ('tags', 'suggested_keywords', 'seo_score', 'meta_description', 'focus_keyword');

-- Test the view creation with a simple query first
SELECT 
    id,
    title,
    CASE 
        WHEN suggested_keywords IS NULL THEN 0
        WHEN jsonb_typeof(suggested_keywords) = 'array' THEN jsonb_array_length(suggested_keywords)
        ELSE 0
    END as keyword_count,
    CASE 
        WHEN tags IS NULL THEN 0
        ELSE COALESCE(array_length(tags, 1), 0)
    END as tag_count,
    seo_score
FROM blog_posts 
LIMIT 5;
