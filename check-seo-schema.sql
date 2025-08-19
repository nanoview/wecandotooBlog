-- Check if SEO columns exist in blog_posts table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'blog_posts' 
  AND column_name IN (
    'meta_title',
    'meta_description', 
    'canonical_url',
    'schema_type',
    'focus_keyword',
    'alt_text',
    'suggested_keywords',
    'seo_score',
    'last_seo_update'
  )
ORDER BY column_name;

-- Also check the table structure
\d blog_posts;
