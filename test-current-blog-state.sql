-- Test current blog post data and URLs
-- Run this in Supabase SQL Editor to see what we're working with

-- 1. Check all published posts with their slug data
SELECT 
  id,
  title,
  slug,
  status,
  excerpt,
  LENGTH(content) as content_length,
  author_id,
  published_at,
  created_at
FROM blog_posts 
WHERE status = 'published'
ORDER BY published_at DESC;

-- 2. Check for posts missing slugs
SELECT 
  id,
  title,
  CASE 
    WHEN slug IS NULL THEN 'NULL'
    WHEN slug = '' THEN 'EMPTY'
    ELSE slug
  END as slug_status,
  status
FROM blog_posts 
WHERE status = 'published' 
  AND (slug IS NULL OR slug = '');

-- 3. Test URL patterns that should work
SELECT 
  id,
  title,
  slug,
  -- This shows what URL should be generated
  CASE 
    WHEN slug IS NOT NULL AND slug != '' 
    THEN '/' || slug 
    ELSE '/post/' || id
  END as generated_url,
  status
FROM blog_posts 
WHERE status = 'published'
ORDER BY published_at DESC
LIMIT 5;
