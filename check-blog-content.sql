-- Check current blog posts content and length
SELECT 
    id,
    title,
    slug,
    LENGTH(content) as content_length,
    CASE 
        WHEN LENGTH(content) < 100 THEN 'Very Short'
        WHEN LENGTH(content) < 300 THEN 'Short'
        WHEN LENGTH(content) < 1000 THEN 'Medium'
        ELSE 'Long'
    END as content_category,
    LEFT(content, 100) as content_preview,
    created_at,
    status
FROM blog_posts 
ORDER BY created_at DESC;
