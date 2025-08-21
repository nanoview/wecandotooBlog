-- 🎯 SEO OPTIMIZATION PRIORITY LIST
-- 16 posts with SEO scores below 60 that need immediate attention

-- ✅ CRITICAL POSTS (Score < 60) - Need Immediate Optimization
SELECT 
    '🚨 CRITICAL POSTS NEEDING IMMEDIATE ATTENTION' as priority_level,
    ROW_NUMBER() OVER (ORDER BY optimization_priority DESC, seo_score ASC) as rank,
    title,
    seo_score,
    seo_status,
    keyword_count,
    tag_count,
    description_length,
    recommendations,
    effort_level,
    CASE 
        WHEN seo_score < 40 THEN '🔴 CRITICAL'
        WHEN seo_score < 50 THEN '🟠 URGENT' 
        WHEN seo_score < 60 THEN '🟡 HIGH PRIORITY'
        ELSE '🟢 NORMAL'
    END as urgency_level
FROM seo_optimization_dashboard
WHERE seo_score < 60
ORDER BY optimization_priority DESC, seo_score ASC;

-- ✅ QUICK SUMMARY OF ISSUES
SELECT 
    '📊 SUMMARY OF OPTIMIZATION NEEDS' as report_type,
    COUNT(*) as total_posts_below_60,
    COUNT(*) FILTER (WHERE seo_score < 40) as critical_posts,
    COUNT(*) FILTER (WHERE seo_score >= 40 AND seo_score < 50) as urgent_posts,
    COUNT(*) FILTER (WHERE seo_score >= 50 AND seo_score < 60) as high_priority_posts,
    ROUND(AVG(seo_score), 1) as average_score,
    COUNT(*) FILTER (WHERE keyword_count < 3) as need_more_keywords,
    COUNT(*) FILTER (WHERE tag_count < 3) as need_more_tags,
    COUNT(*) FILTER (WHERE description_length < 120) as need_better_description
FROM seo_optimization_dashboard
WHERE seo_score < 60;

-- ✅ DETAILED RECOMMENDATIONS FOR TOP 5 WORST PERFORMING POSTS
SELECT 
    '🔍 DETAILED ACTION PLAN FOR WORST 5 POSTS' as action_plan,
    title,
    seo_score,
    jsonb_pretty(get_post_seo_recommendations(id)) as detailed_recommendations
FROM seo_optimization_dashboard
WHERE seo_score < 60
ORDER BY seo_score ASC
LIMIT 5;

-- ✅ BULK OPTIMIZATION PREVIEW (what would be optimized)
SELECT 
    '⚡ BULK OPTIMIZATION PREVIEW' as preview,
    COUNT(*) as posts_to_optimize,
    STRING_AGG(title, ', ' ORDER BY seo_score ASC) as post_titles
FROM blog_posts 
WHERE seo_score < 60 
AND title IS NOT NULL 
AND content IS NOT NULL;

SELECT '✅ SEO OPTIMIZATION LIST READY! Use the queries above to see all 16 posts needing attention.' as status;
