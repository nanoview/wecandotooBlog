-- 🎯 FIXED: LIST OF 16 POSTS WITH SEO SCORES BELOW 60
-- This version uses the correct view and won't have column errors

SELECT 
    ROW_NUMBER() OVER (ORDER BY seo_score ASC) as priority_rank,
    title,
    seo_score,
    CASE 
        WHEN seo_score < 40 THEN '🔴 CRITICAL'
        WHEN seo_score < 50 THEN '🟠 URGENT' 
        WHEN seo_score < 60 THEN '🟡 HIGH PRIORITY'
    END as urgency_level,
    keyword_count,
    tag_count,
    description_length,
    recommendations,
    effort_level
FROM posts_needing_seo_optimization
WHERE seo_score < 60
ORDER BY seo_score ASC;

-- 📊 QUICK SUMMARY
SELECT 
    'SUMMARY OF 16 POSTS NEEDING OPTIMIZATION' as report_title,
    COUNT(*) as total_posts,
    COUNT(*) FILTER (WHERE seo_score < 40) as critical_posts,
    COUNT(*) FILTER (WHERE seo_score >= 40 AND seo_score < 50) as urgent_posts,
    COUNT(*) FILTER (WHERE seo_score >= 50 AND seo_score < 60) as high_priority_posts,
    ROUND(AVG(seo_score), 1) as average_score
FROM posts_needing_seo_optimization
WHERE seo_score < 60;

-- ⚡ ONE-CLICK OPTIMIZATION
-- Uncomment the line below to automatically optimize all 16 posts:
-- SELECT jsonb_pretty(bulk_optimize_low_seo_posts(60)) as auto_optimization_result;
