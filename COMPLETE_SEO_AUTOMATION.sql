-- 🎯 COMPLETE SEO OPTIMIZATION SOLUTION
-- Copy and paste this ENTIRE script into Supabase SQL Editor for full automation

-- ✅ STEP 1: Show the 16 posts that need optimization
SELECT 
    '📋 POSTS NEEDING OPTIMIZATION (Score < 60)' as action_status,
    ROW_NUMBER() OVER (ORDER BY seo_score ASC) as rank,
    title,
    seo_score,
    CASE 
        WHEN seo_score < 40 THEN '🔴 CRITICAL'
        WHEN seo_score < 50 THEN '🟠 URGENT' 
        WHEN seo_score < 60 THEN '🟡 HIGH PRIORITY'
    END as urgency,
    keyword_count || ' keywords' as current_keywords,
    tag_count || ' tags' as current_tags,
    description_length || ' chars' as description,
    recommendations as what_to_fix
FROM seo_optimization_dashboard
WHERE seo_score < 60
ORDER BY seo_score ASC;

-- ✅ STEP 2: Show summary before optimization
SELECT 
    '📊 BEFORE OPTIMIZATION SUMMARY' as report_type,
    COUNT(*) as posts_below_60,
    COUNT(*) FILTER (WHERE seo_score < 40) as critical,
    COUNT(*) FILTER (WHERE seo_score >= 40 AND seo_score < 50) as urgent,
    COUNT(*) FILTER (WHERE seo_score >= 50 AND seo_score < 60) as high_priority,
    ROUND(AVG(seo_score), 1) as avg_score_before
FROM seo_optimization_dashboard
WHERE seo_score < 60;

-- ✅ STEP 3: AUTOMATIC OPTIMIZATION - Run bulk improvement
SELECT 
    '⚡ RUNNING AUTOMATIC OPTIMIZATION...' as status,
    jsonb_pretty(bulk_optimize_low_seo_posts(60)) as optimization_results;

-- ✅ STEP 4: Show what was optimized (posts updated in last 5 minutes)
SELECT 
    '🎉 RECENTLY OPTIMIZED POSTS' as success_report,
    title,
    seo_score as new_score,
    keyword_count as new_keywords,
    tag_count as new_tags,
    'Optimized at ' || last_seo_update::TEXT as optimized_time
FROM seo_optimization_dashboard
WHERE last_seo_update > CURRENT_TIMESTAMP - INTERVAL '5 minutes'
ORDER BY last_seo_update DESC;

-- ✅ STEP 5: Show improvement summary
SELECT 
    '📈 AFTER OPTIMIZATION SUMMARY' as final_report,
    COUNT(*) as total_posts_now,
    COUNT(*) FILTER (WHERE seo_score < 60) as still_below_60,
    COUNT(*) FILTER (WHERE seo_score >= 60) as now_above_60,
    ROUND(AVG(seo_score), 1) as new_avg_score,
    'Improvement: +' || ROUND(AVG(seo_score) - (
        SELECT AVG(seo_score) FROM blog_posts 
        WHERE last_seo_update < CURRENT_TIMESTAMP - INTERVAL '10 minutes'
    ), 1) || ' points' as score_improvement
FROM blog_posts;

-- ✅ STEP 6: Show any posts that still need manual attention
SELECT 
    '⚠️ POSTS STILL NEEDING MANUAL WORK' as manual_attention,
    COALESCE(
        STRING_AGG(
            title || ' (Score: ' || seo_score || ')', 
            ', ' 
            ORDER BY seo_score ASC
        ),
        'All posts have been successfully optimized! 🎉'
    ) as remaining_issues
FROM seo_optimization_dashboard
WHERE seo_score < 60;

SELECT '✅ COMPLETE! Your SEO optimization is finished. Check the results above.' as final_status;
