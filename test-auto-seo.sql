-- 🧪 Test the automatic SEO generation
-- Run this after running AUTO_SEO_TAGS_KEYWORDS.sql

-- Test 1: Insert a new blog post to see automatic generation
INSERT INTO blog_posts (
    title, 
    content, 
    category, 
    author_id,
    status
) VALUES (
    'Complete Guide to React Hooks in 2025',
    'React Hooks revolutionized the way we write React components. In this comprehensive guide, we will explore useState, useEffect, useContext, and custom hooks. Learn how to build modern React applications with functional components and hooks. This tutorial covers best practices, performance optimization, and advanced patterns for React development.',
    'web-development',
    '00000000-0000-0000-0000-000000000000', -- Replace with a real user ID
    'published'
) ON CONFLICT DO NOTHING;

-- Test 2: Update an existing post to trigger regeneration
UPDATE blog_posts 
SET content = content || ' Updated with new SEO-friendly content about modern web development practices.'
WHERE title ILIKE '%react%' OR title ILIKE '%javascript%'
LIMIT 1;

-- Test 3: Check the results
SELECT 
    '🔍 SEO GENERATION TEST RESULTS' as test_phase,
    title,
    category,
    jsonb_pretty(tags) as generated_tags,
    jsonb_pretty(suggested_keywords) as generated_keywords,
    focus_keyword,
    seo_score,
    last_seo_update
FROM blog_posts 
WHERE last_seo_update > CURRENT_TIMESTAMP - INTERVAL '5 minutes'
ORDER BY last_seo_update DESC
LIMIT 3;

-- Test 4: Show statistics
SELECT 
    '📊 SEO COVERAGE STATS' as report_type,
    COUNT(*) as total_posts,
    COUNT(CASE WHEN tags IS NOT NULL AND jsonb_array_length(tags) > 0 THEN 1 END) as posts_with_tags,
    COUNT(CASE WHEN suggested_keywords IS NOT NULL AND jsonb_array_length(suggested_keywords) > 0 THEN 1 END) as posts_with_keywords,
    ROUND(AVG(seo_score), 1) as average_seo_score
FROM blog_posts;

-- Test 5: Test manual regeneration function
SELECT '🔄 TESTING MANUAL REGENERATION' as test_type;

-- Find a post to regenerate
DO $$
DECLARE
    test_post_id UUID;
    result JSONB;
BEGIN
    -- Get a post ID for testing
    SELECT id INTO test_post_id FROM blog_posts LIMIT 1;
    
    IF test_post_id IS NOT NULL THEN
        -- Test manual regeneration
        SELECT regenerate_post_seo(test_post_id) INTO result;
        RAISE NOTICE 'Manual regeneration result: %', result;
    END IF;
END $$;

-- Final verification
SELECT 
    '✅ AUTO SEO TEST COMPLETE' as status,
    'Tags and keywords should now generate automatically!' as message;
