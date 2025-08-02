-- Quick check of current blog posts and their slugs
-- Run this in Supabase SQL Editor or browser console

SELECT 
  id,
  title,
  slug,
  status,
  author_id,
  excerpt,
  LENGTH(content) as content_length,
  created_at
FROM blog_posts 
ORDER BY created_at DESC 
LIMIT 5;

-- Check if any posts are missing slugs
SELECT 
  COUNT(*) as total_posts,
  COUNT(slug) as posts_with_slugs,
  COUNT(*) - COUNT(slug) as posts_missing_slugs
FROM blog_posts 
WHERE status = 'published';

-- Show posts that might need slug generation
SELECT 
  id,
  title,
  slug,
  CASE 
    WHEN slug IS NULL OR slug = '' THEN 'MISSING SLUG'
    ELSE 'HAS SLUG'
  END as slug_status
FROM blog_posts 
WHERE status = 'published'
ORDER BY created_at DESC;
