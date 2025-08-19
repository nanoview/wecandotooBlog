-- Simple test to check if we can access blog_posts and see what columns exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'blog_posts' 
ORDER BY ordinal_position;
