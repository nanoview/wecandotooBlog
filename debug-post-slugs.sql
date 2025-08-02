-- Check current blog post slugs and data
-- Run this in Supabase SQL Editor to see the actual post data

SELECT 
  id,
  title,
  slug,
  status,
  author_id,
  excerpt,
  created_at
FROM blog_posts
WHERE status = 'published'
ORDER BY created_at DESC;

-- Also check if profiles are properly associated
SELECT 
  bp.id,
  bp.title,
  bp.slug,
  bp.status,
  bp.author_id,
  p.username,
  p.display_name
FROM blog_posts bp
LEFT JOIN profiles p ON p.user_id = bp.author_id
WHERE bp.status = 'published'
ORDER BY bp.created_at DESC;
