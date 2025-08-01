-- Quick check of existing blog posts in database
SELECT id, title, author_id, status, created_at
FROM public.blog_posts 
ORDER BY created_at DESC 
LIMIT 10;
