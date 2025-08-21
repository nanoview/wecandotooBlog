-- 🎯 LIST OF 16 POSTS WITH SEO SCORES BELOW 60
-- Copy and paste this into Supabase SQL Editor to see your priority optimization list

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
    CASE 
        WHEN seo_score < 40 THEN 'High effort needed'
        WHEN seo_score < 65 THEN 'Medium effort needed'
        WHEN seo_score < 80 THEN 'Quick fixes needed'
        ELSE 'Minor tweaks needed'
    END as effort_level
FROM seo_optimization_dashboard
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
FROM seo_optimization_dashboard
WHERE seo_score < 60;
