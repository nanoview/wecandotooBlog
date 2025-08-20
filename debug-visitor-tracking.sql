-- 🔍 Debug Visitor Tracking Tables and Functions
-- This script helps debug visitor tracking database issues

-- Check visitor_sessions table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'visitor_sessions' 
ORDER BY ordinal_position;

-- Check post_impressions table structure  
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'post_impressions' 
ORDER BY ordinal_position;

-- Check if tables exist and have data
SELECT 
    'visitor_sessions' as table_name,
    COUNT(*) as record_count
FROM visitor_sessions
UNION ALL
SELECT 
    'post_impressions' as table_name,
    COUNT(*) as record_count  
FROM post_impressions;

-- Test a simple insert to post_impressions
INSERT INTO post_impressions (
    session_id, 
    post_id, 
    post_slug, 
    view_duration, 
    scroll_depth, 
    is_bounce, 
    timestamp
) VALUES (
    'test-session-123',
    '1',  -- Testing with string post_id
    'test-slug',
    0,
    0,
    false,
    NOW()
) ON CONFLICT DO NOTHING;

-- Show recent test data
SELECT * FROM post_impressions 
WHERE session_id = 'test-session-123' 
LIMIT 5;

-- Clean up test data
DELETE FROM post_impressions 
WHERE session_id = 'test-session-123';

-- Check for any existing visitor tracking data
SELECT 
    vs.session_id,
    vs.ip_address,
    vs.visit_count,
    COUNT(pi.id) as page_views
FROM visitor_sessions vs
LEFT JOIN post_impressions pi ON vs.session_id = pi.session_id
GROUP BY vs.session_id, vs.ip_address, vs.visit_count
ORDER BY vs.created_at DESC
LIMIT 10;
