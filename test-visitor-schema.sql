-- 🧪 Test Visitor Tracking Database Schema
-- This script tests if visitor tracking tables can handle the data structure

-- Test 1: Check visitor_sessions table structure
\d visitor_sessions;

-- Test 2: Check post_impressions table structure  
\d post_impressions;

-- Test 3: Try a simple insert to visitor_sessions
INSERT INTO visitor_sessions (
    session_id,
    ip_address,
    user_agent,
    country,
    country_code,
    region,
    city,
    latitude,
    longitude,
    timezone,
    isp,
    device_type,
    browser,
    os,
    referrer,
    first_visit,
    last_visit,
    visit_count
) VALUES (
    'test-session-debug-123',
    '192.168.1.1',
    'Mozilla/5.0 Test Browser',
    'United States',
    'US',
    'California',
    'San Francisco',
    37.7749,
    -122.4194,
    'America/Los_Angeles',
    'Test ISP',
    'desktop',
    'Chrome',
    'Windows',
    'https://google.com',
    NOW(),
    NOW(),
    1
) ON CONFLICT (session_id) DO UPDATE SET
    last_visit = NOW(),
    visit_count = visitor_sessions.visit_count + 1;

-- Test 4: Try a simple insert to post_impressions
INSERT INTO post_impressions (
    session_id,
    post_id,
    post_slug,
    view_duration,
    scroll_depth,
    is_bounce,
    timestamp
) VALUES (
    'test-session-debug-123',
    '1',
    'test-post',
    0,
    0,
    false,
    NOW()
) ON CONFLICT DO NOTHING;

-- Test 5: Check what was inserted
SELECT 'visitor_sessions' as table_name, session_id, ip_address, visit_count, created_at 
FROM visitor_sessions 
WHERE session_id = 'test-session-debug-123'
UNION ALL
SELECT 'post_impressions' as table_name, session_id, post_id::text, scroll_depth::text, timestamp::text
FROM post_impressions 
WHERE session_id = 'test-session-debug-123';

-- Test 6: Clean up
DELETE FROM post_impressions WHERE session_id = 'test-session-debug-123';
DELETE FROM visitor_sessions WHERE session_id = 'test-session-debug-123';

-- Test 7: Check for missing columns that might cause issues
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('visitor_sessions', 'post_impressions')
ORDER BY table_name, ordinal_position;
