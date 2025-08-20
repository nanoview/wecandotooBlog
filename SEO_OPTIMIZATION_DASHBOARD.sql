-- 📊 SEO OPTIMIZATION DASHBOARD
-- This creates views and functions for the admin dashboard to manage SEO optimization

-- ✅ Step 1: Create comprehensive SEO analysis view
CREATE OR REPLACE VIEW seo_optimization_dashboard AS
SELECT 
    id,
    title,
    category,
    status,
    tags,
    suggested_keywords,
    focus_keyword,
    meta_description,
    seo_score,
    last_seo_update,
    created_at,
    updated_at,
    
    -- Analysis fields
    CASE 
        WHEN suggested_keywords IS NULL THEN 0
        WHEN jsonb_typeof(suggested_keywords) = 'array' THEN jsonb_array_length(suggested_keywords)
        ELSE 0
    END as keyword_count,
    CASE 
        WHEN tags IS NULL THEN 0
        ELSE COALESCE(array_length(tags, 1), 0)
    END as tag_count,
    LENGTH(COALESCE(meta_description, '')) as description_length,
    
    -- SEO status categorization
    CASE 
        WHEN seo_score >= 90 THEN 'Excellent'
        WHEN seo_score >= 80 THEN 'Good'
        WHEN seo_score >= 65 THEN 'Needs Improvement'
        WHEN seo_score >= 40 THEN 'Poor'
        ELSE 'Critical'
    END as seo_status,
    
    -- Specific optimization recommendations
    CASE 
        WHEN seo_score < 80 THEN
            ARRAY_TO_STRING(ARRAY[
                CASE WHEN (suggested_keywords IS NULL OR (jsonb_typeof(suggested_keywords) = 'array' AND jsonb_array_length(suggested_keywords) < 5))
                     THEN 'Add more keywords' END,
                CASE WHEN (tags IS NULL OR COALESCE(array_length(tags, 1), 0) < 3)
                     THEN 'Add more tags' END,
                CASE WHEN LENGTH(COALESCE(meta_description, '')) < 120 
                     THEN 'Improve meta description' END,
                CASE WHEN LENGTH(COALESCE(meta_description, '')) > 160 
                     THEN 'Shorten meta description' END,
                CASE WHEN focus_keyword IS NULL OR LENGTH(focus_keyword) < 3 
                     THEN 'Set focus keyword' END,
                CASE WHEN last_seo_update < CURRENT_DATE - INTERVAL '30 days' 
                     THEN 'Refresh SEO data' END
            ]::TEXT[], ', ')
        ELSE 'SEO looks good!'
    END as recommendations,
    
    -- Priority score (higher = needs more attention)
    CASE 
        WHEN seo_score < 40 THEN 100
        WHEN seo_score < 65 THEN 80
        WHEN seo_score < 80 THEN 60
        ELSE 20
    END as optimization_priority
    
FROM blog_posts
ORDER BY optimization_priority DESC, seo_score ASC, updated_at DESC;

-- ✅ Step 2: Create specific view for posts needing optimization
CREATE OR REPLACE VIEW posts_needing_seo_optimization AS
SELECT 
    *,
    -- Estimated effort to improve
    CASE 
        WHEN seo_score < 40 THEN 'High effort needed'
        WHEN seo_score < 65 THEN 'Medium effort needed'
        WHEN seo_score < 80 THEN 'Quick fixes needed'
        ELSE 'Minor tweaks needed'
    END as effort_level
FROM seo_optimization_dashboard
WHERE seo_score < 80
ORDER BY optimization_priority DESC, seo_score ASC;

-- ✅ Step 3: Function to get SEO optimization summary
CREATE OR REPLACE FUNCTION get_seo_optimization_summary()
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_posts', (SELECT COUNT(*) FROM blog_posts),
        'posts_below_80', (SELECT COUNT(*) FROM blog_posts WHERE seo_score < 80),
        'posts_below_65', (SELECT COUNT(*) FROM blog_posts WHERE seo_score < 65),
        'posts_below_40', (SELECT COUNT(*) FROM blog_posts WHERE seo_score < 40),
        'average_seo_score', (SELECT ROUND(AVG(seo_score), 1) FROM blog_posts WHERE seo_score IS NOT NULL),
        'posts_without_keywords', (SELECT COUNT(*) FROM blog_posts WHERE suggested_keywords IS NULL OR (jsonb_typeof(suggested_keywords) = 'array' AND jsonb_array_length(suggested_keywords) = 0)),
        'posts_without_tags', (SELECT COUNT(*) FROM blog_posts WHERE tags IS NULL OR COALESCE(array_length(tags, 1), 0) = 0),
        'posts_without_meta_description', (SELECT COUNT(*) FROM blog_posts WHERE meta_description IS NULL OR LENGTH(meta_description) < 50),
        'last_updated', CURRENT_TIMESTAMP
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ✅ Step 4: Function to bulk optimize posts with low SEO scores
CREATE OR REPLACE FUNCTION bulk_optimize_low_seo_posts(score_threshold INTEGER DEFAULT 80)
RETURNS JSONB AS $$
DECLARE
    optimized_count INTEGER := 0;
    post_record RECORD;
BEGIN
    -- Update all posts with SEO score below threshold
    FOR post_record IN 
        SELECT id FROM blog_posts 
        WHERE seo_score < score_threshold 
        AND title IS NOT NULL 
        AND content IS NOT NULL
        LIMIT 50  -- Process in batches to avoid timeouts
    LOOP
        -- Trigger the SEO regeneration
        UPDATE blog_posts 
        SET 
            title = title,  -- This triggers the auto_generate_seo_data function
            updated_at = CURRENT_TIMESTAMP
        WHERE id = post_record.id;
        
        optimized_count := optimized_count + 1;
    END LOOP;
    
    RETURN jsonb_build_object(
        'success', true,
        'optimized_posts', optimized_count,
        'threshold_used', score_threshold,
        'timestamp', CURRENT_TIMESTAMP
    );
END;
$$ LANGUAGE plpgsql;

-- ✅ Step 5: Function to get detailed SEO recommendations for a specific post
CREATE OR REPLACE FUNCTION get_post_seo_recommendations(post_id UUID)
RETURNS JSONB AS $$
DECLARE
    post_data RECORD;
    recommendations TEXT[] := ARRAY[]::TEXT[];
    quick_fixes TEXT[] := ARRAY[]::TEXT[];
    improvements TEXT[] := ARRAY[]::TEXT[];
BEGIN
    SELECT * INTO post_data FROM seo_optimization_dashboard WHERE id = post_id;
    
    IF NOT FOUND THEN
        RETURN '{"error": "Post not found"}'::JSONB;
    END IF;
    
    -- Quick fixes (easy to implement)
    IF post_data.keyword_count < 5 THEN
        quick_fixes := quick_fixes || ARRAY['Add more relevant keywords (currently: ' || post_data.keyword_count::TEXT || ')'];
    END IF;
    
    IF post_data.tag_count < 3 THEN
        quick_fixes := quick_fixes || ARRAY['Add more tags (currently: ' || post_data.tag_count::TEXT || ')'];
    END IF;
    
    IF post_data.focus_keyword IS NULL OR LENGTH(post_data.focus_keyword) < 3 THEN
        quick_fixes := quick_fixes || ARRAY['Set a focus keyword'];
    END IF;
    
    -- Content improvements (more effort)
    IF post_data.description_length < 120 THEN
        improvements := improvements || ARRAY['Write a longer meta description (currently: ' || post_data.description_length::TEXT || ' chars, ideal: 120-160)'];
    ELSIF post_data.description_length > 160 THEN
        improvements := improvements || ARRAY['Shorten meta description (currently: ' || post_data.description_length::TEXT || ' chars, ideal: 120-160)'];
    END IF;
    
    IF post_data.last_seo_update < CURRENT_DATE - INTERVAL '30 days' THEN
        improvements := improvements || ARRAY['SEO data is outdated, consider refreshing'];
    END IF;
    
    -- Overall recommendations
    IF post_data.seo_score < 40 THEN
        recommendations := recommendations || ARRAY['Critical: This post needs immediate SEO attention'];
    ELSIF post_data.seo_score < 65 THEN
        recommendations := recommendations || ARRAY['Important: This post has significant SEO issues'];
    ELSIF post_data.seo_score < 80 THEN
        recommendations := recommendations || ARRAY['Minor: This post needs some SEO improvements'];
    END IF;
    
    RETURN jsonb_build_object(
        'post_id', post_id,
        'current_seo_score', post_data.seo_score,
        'seo_status', post_data.seo_status,
        'quick_fixes', quick_fixes,
        'content_improvements', improvements,
        'overall_recommendations', recommendations,
        'priority_level', post_data.optimization_priority,
        'effort_level', CASE 
            WHEN post_data.seo_score < 40 THEN 'High effort needed'
            WHEN post_data.seo_score < 65 THEN 'Medium effort needed'
            WHEN post_data.seo_score < 80 THEN 'Quick fixes needed'
            ELSE 'Minor tweaks needed'
        END,
        'generated_at', CURRENT_TIMESTAMP
    );
END;
$$ LANGUAGE plpgsql;

-- ✅ Step 6: Create indexes for better dashboard performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_seo_score ON blog_posts(seo_score);
CREATE INDEX IF NOT EXISTS idx_blog_posts_seo_update ON blog_posts(last_seo_update);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status_score ON blog_posts(status, seo_score);

-- ✅ Step 7: Sample queries for the admin dashboard

-- Get posts that need immediate attention (score < 80)
SELECT 
    '📋 POSTS NEEDING OPTIMIZATION (Score < 80)' as report_type,
    title,
    seo_score,
    seo_status,
    recommendations,
    effort_level
FROM posts_needing_seo_optimization
LIMIT 10;

-- Get optimization summary
SELECT 
    '📊 SEO OPTIMIZATION SUMMARY' as report_type,
    jsonb_pretty(get_seo_optimization_summary()) as summary;

-- Get detailed recommendations for the worst performing post
SELECT 
    '🔍 DETAILED RECOMMENDATIONS' as report_type,
    jsonb_pretty(get_post_seo_recommendations(
        (SELECT id FROM blog_posts ORDER BY seo_score ASC LIMIT 1)
    )) as recommendations;

-- Show SEO score distribution
SELECT 
    '📈 SEO SCORE DISTRIBUTION' as report_type,
    seo_status,
    COUNT(*) as post_count,
    ROUND(AVG(seo_score), 1) as avg_score
FROM seo_optimization_dashboard
GROUP BY seo_status
ORDER BY avg_score DESC;

SELECT '✅ SEO OPTIMIZATION DASHBOARD READY!' as status;
SELECT 'Use the views and functions above to build your admin dashboard!' as next_step;
