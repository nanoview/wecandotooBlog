-- 🧪 Quick Test for Visitor Tracking Function
-- Run this after the complete-visitor-setup.sql to verify everything works

-- Test that we can insert a basic visitor session manually
INSERT INTO visitor_sessions (
    session_id,
    ip_address,
    device_type,
    browser,
    os,
    visit_count,
    first_visit,
    last_visit
) VALUES (
    'manual-test-789',
    '192.168.1.100',
    'desktop',
    'chrome',
    'windows',
    1,
    NOW(),
    NOW()
) ON CONFLICT (session_id) DO UPDATE SET
    visit_count = visitor_sessions.visit_count + 1,
    last_visit = NOW();

-- Test that we can insert a basic post impression manually
INSERT INTO post_impressions (
    session_id,
    post_id,
    post_slug,
    view_duration,
    scroll_depth,
    is_bounce,
    timestamp
) VALUES (
    'manual-test-789',
    '1',
    'test-post-manual',
    5,
    25,
    false,
    NOW()
) ON CONFLICT DO NOTHING;

-- Check that both inserts worked
SELECT 'SESSION TEST' as type, session_id, device_type, browser, visit_count 
FROM visitor_sessions 
WHERE session_id = 'manual-test-789';

SELECT 'IMPRESSION TEST' as type, session_id, post_id, view_duration, scroll_depth 
FROM post_impressions 
WHERE session_id = 'manual-test-789';

-- Clean up
DELETE FROM post_impressions WHERE session_id = 'manual-test-789';
DELETE FROM visitor_sessions WHERE session_id = 'manual-test-789';

SELECT 'MANUAL DATABASE TEST COMPLETE ✅' as result;
