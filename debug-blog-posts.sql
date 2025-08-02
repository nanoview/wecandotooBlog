-- Debug Blog Posts Query
-- Run this in Supabase SQL Editor to check your blog posts

-- Check all blog posts with their status
SELECT 
  id,
  title,
  slug,
  status,
  published_at,
  created_at,
  author_id
FROM blog_posts 
ORDER BY created_at DESC;

-- Check published posts specifically
SELECT 
  id,
  title,
  slug,
  status,
  published_at,
  created_at,
  author_id
FROM blog_posts 
WHERE status = 'published'
ORDER BY published_at DESC;

-- Check if author profiles exist
SELECT 
  bp.title,
  bp.status,
  bp.author_id,
  p.username,
  p.display_name
FROM blog_posts bp
LEFT JOIN profiles p ON p.user_id = bp.author_id
WHERE bp.status = 'published'
ORDER BY bp.created_at DESC;
