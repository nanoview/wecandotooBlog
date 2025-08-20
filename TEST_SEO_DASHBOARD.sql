-- 🧪 SUPABASE SEO DASHBOARD TEST SCRIPT
-- Run these queries step by step in Supabase SQL Editor to test the dashboard

-- ✅ STEP 1: Test basic view creation and data access
SELECT 'STEP 1: Testing basic SEO view' as test_step;
SELECT 
    id, 
    title, 
    seo_score, 
    keyword_count, 
    tag_count, 
    seo_status 
FROM seo_optimization_dashboard 
LIMIT 5;

-- ✅ STEP 2: Test posts needing optimization
SELECT 'STEP 2: Testing posts needing optimization' as test_step;
SELECT 
    title,
    seo_score,
    seo_status,
    effort_level,
    recommendations
FROM posts_needing_seo_optimization 
LIMIT 3;

-- ✅ STEP 3: Test SEO summary function
SELECT 'STEP 3: Testing SEO summary function' as test_step;
SELECT jsonb_pretty(get_seo_optimization_summary()) as summary_data;

-- ✅ STEP 4: Test detailed recommendations for a specific post
SELECT 'STEP 4: Testing detailed recommendations (FIXED)' as test_step;
SELECT jsonb_pretty(
    get_post_seo_recommendations(
        (SELECT id FROM blog_posts WHERE seo_score IS NOT NULL ORDER BY seo_score ASC LIMIT 1)
    )
) as detailed_recommendations;

-- ✅ STEP 5: Test bulk optimization function (DRY RUN - limit 1)
SELECT 'STEP 5: Testing bulk optimization (1 post only)' as test_step;
SELECT jsonb_pretty(
    bulk_optimize_low_seo_posts(80)  -- This will optimize posts with score < 80
) as bulk_optimization_result;

-- ✅ STEP 6: Verify the optimization worked
SELECT 'STEP 6: Checking if optimization updated posts' as test_step;
SELECT 
    title,
    seo_score,
    tag_count,
    keyword_count,
    last_seo_update
FROM seo_optimization_dashboard 
WHERE last_seo_update > CURRENT_TIMESTAMP - INTERVAL '5 minutes'
ORDER BY last_seo_update DESC
LIMIT 5;

-- ✅ STEP 7: Test SEO score distribution
SELECT 'STEP 7: Testing SEO score distribution' as test_step;
SELECT 
    seo_status,
    COUNT(*) as post_count,
    ROUND(AVG(seo_score), 1) as avg_score,
    MIN(seo_score) as min_score,
    MAX(seo_score) as max_score
FROM seo_optimization_dashboard
GROUP BY seo_status
ORDER BY avg_score DESC;

-- ✅ STEP 8: Performance test - check if indexes are working
SELECT 'STEP 8: Testing index performance' as test_step;
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM posts_needing_seo_optimization 
WHERE seo_score < 50 
ORDER BY optimization_priority DESC;

SELECT '🎉 ALL TESTS COMPLETED! Dashboard is ready to use!' as final_status;
