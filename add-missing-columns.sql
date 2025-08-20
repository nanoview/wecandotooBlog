-- 🔧 Add Missing Columns to Visitor Tracking Tables
-- This script adds all the columns that the visitor tracking system expects

-- First, let's see what columns currently exist
SELECT 
    'CURRENT visitor_sessions COLUMNS:' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'visitor_sessions'
ORDER BY ordinal_position;

-- Add missing columns to visitor_sessions table
ALTER TABLE visitor_sessions 
ADD COLUMN IF NOT EXISTS user_agent TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS country_code TEXT,
ADD COLUMN IF NOT EXISTS region TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS timezone TEXT,
ADD COLUMN IF NOT EXISTS isp TEXT,
ADD COLUMN IF NOT EXISTS device_type TEXT DEFAULT 'unknown',
ADD COLUMN IF NOT EXISTS browser TEXT DEFAULT 'unknown',
ADD COLUMN IF NOT EXISTS os TEXT DEFAULT 'unknown',
ADD COLUMN IF NOT EXISTS referrer TEXT,
ADD COLUMN IF NOT EXISTS first_visit TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS last_visit TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS visit_count INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Update any existing rows to have default values for new columns
UPDATE visitor_sessions 
SET 
    device_type = COALESCE(device_type, 'unknown'),
    browser = COALESCE(browser, 'unknown'),
    os = COALESCE(os, 'unknown'),
    visit_count = COALESCE(visit_count, 1),
    first_visit = COALESCE(first_visit, created_at, NOW()),
    last_visit = COALESCE(last_visit, updated_at, NOW())
WHERE device_type IS NULL 
   OR browser IS NULL 
   OR os IS NULL 
   OR visit_count IS NULL 
   OR first_visit IS NULL 
   OR last_visit IS NULL;

-- Also ensure post_impressions has all needed columns
ALTER TABLE post_impressions
ADD COLUMN IF NOT EXISTS view_duration INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS scroll_depth INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_bounce BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS timestamp TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Update any existing impression rows
UPDATE post_impressions 
SET 
    view_duration = COALESCE(view_duration, 0),
    scroll_depth = COALESCE(scroll_depth, 0),
    is_bounce = COALESCE(is_bounce, false),
    timestamp = COALESCE(timestamp, created_at, NOW())
WHERE view_duration IS NULL 
   OR scroll_depth IS NULL 
   OR is_bounce IS NULL 
   OR timestamp IS NULL;

-- Now let's see the updated structure
SELECT 
    'UPDATED visitor_sessions COLUMNS:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'visitor_sessions'
ORDER BY ordinal_position;

SELECT 
    'UPDATED post_impressions COLUMNS:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'post_impressions'
ORDER BY ordinal_position;

-- Test insert to make sure all columns work
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
    'test-column-check-789',
    '192.168.1.100',
    'Test User Agent',
    'United States',
    'US',
    'California',
    'San Francisco',
    37.7749,
    -122.4194,
    'America/Los_Angeles',
    'Test ISP',
    'desktop',
    'chrome',
    'windows',
    'https://test.com',
    NOW(),
    NOW(),
    1
) ON CONFLICT (session_id) DO UPDATE SET
    last_visit = NOW(),
    visit_count = visitor_sessions.visit_count + 1;

-- Test insert to post_impressions
INSERT INTO post_impressions (
    session_id,
    post_id,
    post_slug,
    view_duration,
    scroll_depth,
    is_bounce,
    timestamp
) VALUES (
    'test-column-check-789',
    '1',
    'test-post-columns',
    10,
    50,
    false,
    NOW()
) ON CONFLICT DO NOTHING;

-- Verify the test data
SELECT 'TEST VISITOR SESSION:' as test_type, session_id, browser, device_type, visit_count::text as value
FROM visitor_sessions 
WHERE session_id = 'test-column-check-789';

SELECT 'TEST POST IMPRESSION:' as test_type, session_id, post_id, view_duration::text as duration, scroll_depth::text as scroll
FROM post_impressions 
WHERE session_id = 'test-column-check-789';

-- Clean up test data
DELETE FROM post_impressions WHERE session_id = 'test-column-check-789';
DELETE FROM visitor_sessions WHERE session_id = 'test-column-check-789';

-- Success message
SELECT 'ALL COLUMNS ADDED SUCCESSFULLY! ✅ You can now test visitor tracking.' as result;
