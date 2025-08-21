-- 🚀 ONE-CLICK SEO OPTIMIZATION FOR 16 POSTS
-- This will automatically improve SEO for all posts scoring below 60

-- ✅ STEP 1: Show what will be optimized before running
SELECT 
    '📋 POSTS TO BE OPTIMIZED (Score < 60)' as action,
    COUNT(*) as total_posts,
    STRING_AGG(
        title || ' (Score: ' || seo_score || ')', 
        ', ' 
        ORDER BY seo_score ASC
    ) as posts_list
FROM blog_posts 
WHERE seo_score < 60 
AND title IS NOT NULL 
AND content IS NOT NULL;

-- ✅ STEP 2: Run bulk optimization for posts below 60
SELECT 
    '⚡ RUNNING BULK OPTIMIZATION...' as status,
    jsonb_pretty(bulk_optimize_low_seo_posts(60)) as optimization_result;

-- ✅ STEP 3: Show results after optimization
SELECT 
    '📈 OPTIMIZATION RESULTS' as results,
    COUNT(*) as remaining_posts_below_60,
    COUNT(*) FILTER (WHERE seo_score >= 60) as improved_posts,
    ROUND(AVG(seo_score), 1) as new_average_score
FROM blog_posts;

-- ✅ STEP 4: Show which posts were successfully improved
SELECT 
    '🎉 RECENTLY OPTIMIZED POSTS' as success_report,
    title,
    seo_score as new_score,
    keyword_count,
    tag_count,
    last_seo_update
FROM seo_optimization_dashboard
WHERE last_seo_update > CURRENT_TIMESTAMP - INTERVAL '10 minutes'
ORDER BY last_seo_update DESC;

-- ✅ STEP 5: Show remaining posts that still need manual attention
SELECT 
    '⚠️ POSTS STILL NEEDING MANUAL ATTENTION' as manual_needed,
    title,
    seo_score,
    recommendations,
    effort_level
FROM posts_needing_seo_optimization
WHERE seo_score < 60
ORDER BY seo_score ASC;

SELECT '✅ BULK OPTIMIZATION COMPLETE! Check the results above.' as final_status;
