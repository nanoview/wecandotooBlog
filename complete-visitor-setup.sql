-- 🚀 Complete Visitor Tracking Setup & Debug
-- Run this script in Supabase SQL Editor to fix all visitor tracking issues

-- Step 1: First run the RLS policies fix
-- Enable RLS on visitor_sessions if not already enabled
ALTER TABLE visitor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_impressions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Allow public read on visitor_sessions" ON visitor_sessions;
DROP POLICY IF EXISTS "Allow public insert on visitor_sessions" ON visitor_sessions;
DROP POLICY IF EXISTS "Allow public update on visitor_sessions" ON visitor_sessions;
DROP POLICY IF EXISTS "Allow service role full access on visitor_sessions" ON visitor_sessions;
DROP POLICY IF EXISTS "Allow anonymous insert on visitor_sessions" ON visitor_sessions;
DROP POLICY IF EXISTS "Allow anonymous update own session" ON visitor_sessions;
DROP POLICY IF EXISTS "Allow anonymous read on visitor_sessions" ON visitor_sessions;

DROP POLICY IF EXISTS "Allow public read on post_impressions" ON post_impressions;
DROP POLICY IF EXISTS "Allow public insert on post_impressions" ON post_impressions;
DROP POLICY IF EXISTS "Allow public update on post_impressions" ON post_impressions;
DROP POLICY IF EXISTS "Allow service role full access on post_impressions" ON post_impressions;
DROP POLICY IF EXISTS "Allow anonymous insert on post_impressions" ON post_impressions;
DROP POLICY IF EXISTS "Allow anonymous update own impressions" ON post_impressions;
DROP POLICY IF EXISTS "Allow anonymous read on post_impressions" ON post_impressions;

-- Create policies for visitor_sessions
CREATE POLICY "Allow anonymous insert on visitor_sessions" ON visitor_sessions
    FOR INSERT 
    TO anon
    WITH CHECK (true);

CREATE POLICY "Allow anonymous update own session" ON visitor_sessions
    FOR UPDATE 
    TO anon
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow anonymous read on visitor_sessions" ON visitor_sessions
    FOR SELECT 
    TO anon
    USING (true);

CREATE POLICY "Allow service role full access on visitor_sessions" ON visitor_sessions
    FOR ALL 
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Create policies for post_impressions
CREATE POLICY "Allow anonymous insert on post_impressions" ON post_impressions
    FOR INSERT 
    TO anon
    WITH CHECK (true);

CREATE POLICY "Allow anonymous update own impressions" ON post_impressions
    FOR UPDATE 
    TO anon
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow anonymous read on post_impressions" ON post_impressions
    FOR SELECT 
    TO anon
    USING (true);

CREATE POLICY "Allow service role full access on post_impressions" ON post_impressions
    FOR ALL 
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Step 2: Add all missing columns that the visitor tracking system expects
DO $$ 
BEGIN
    -- Add all missing columns to visitor_sessions
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'visitor_sessions' AND column_name = 'user_agent') THEN
        ALTER TABLE visitor_sessions ADD COLUMN user_agent TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'visitor_sessions' AND column_name = 'country') THEN
        ALTER TABLE visitor_sessions ADD COLUMN country TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'visitor_sessions' AND column_name = 'country_code') THEN
        ALTER TABLE visitor_sessions ADD COLUMN country_code TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'visitor_sessions' AND column_name = 'region') THEN
        ALTER TABLE visitor_sessions ADD COLUMN region TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'visitor_sessions' AND column_name = 'city') THEN
        ALTER TABLE visitor_sessions ADD COLUMN city TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'visitor_sessions' AND column_name = 'latitude') THEN
        ALTER TABLE visitor_sessions ADD COLUMN latitude DOUBLE PRECISION;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'visitor_sessions' AND column_name = 'longitude') THEN
        ALTER TABLE visitor_sessions ADD COLUMN longitude DOUBLE PRECISION;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'visitor_sessions' AND column_name = 'timezone') THEN
        ALTER TABLE visitor_sessions ADD COLUMN timezone TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'visitor_sessions' AND column_name = 'isp') THEN
        ALTER TABLE visitor_sessions ADD COLUMN isp TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'visitor_sessions' AND column_name = 'device_type') THEN
        ALTER TABLE visitor_sessions ADD COLUMN device_type TEXT DEFAULT 'unknown';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'visitor_sessions' AND column_name = 'browser') THEN
        ALTER TABLE visitor_sessions ADD COLUMN browser TEXT DEFAULT 'unknown';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'visitor_sessions' AND column_name = 'os') THEN
        ALTER TABLE visitor_sessions ADD COLUMN os TEXT DEFAULT 'unknown';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'visitor_sessions' AND column_name = 'referrer') THEN
        ALTER TABLE visitor_sessions ADD COLUMN referrer TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'visitor_sessions' AND column_name = 'first_visit') THEN
        ALTER TABLE visitor_sessions ADD COLUMN first_visit TIMESTAMPTZ DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'visitor_sessions' AND column_name = 'last_visit') THEN
        ALTER TABLE visitor_sessions ADD COLUMN last_visit TIMESTAMPTZ DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'visitor_sessions' AND column_name = 'visit_count') THEN
        ALTER TABLE visitor_sessions ADD COLUMN visit_count INTEGER DEFAULT 1;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'visitor_sessions' AND column_name = 'updated_at') THEN
        ALTER TABLE visitor_sessions ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'visitor_sessions' AND column_name = 'created_at') THEN
        ALTER TABLE visitor_sessions ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;

    -- Add missing columns to post_impressions
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'post_impressions' AND column_name = 'view_duration') THEN
        ALTER TABLE post_impressions ADD COLUMN view_duration INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'post_impressions' AND column_name = 'scroll_depth') THEN
        ALTER TABLE post_impressions ADD COLUMN scroll_depth INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'post_impressions' AND column_name = 'is_bounce') THEN
        ALTER TABLE post_impressions ADD COLUMN is_bounce BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'post_impressions' AND column_name = 'timestamp') THEN
        ALTER TABLE post_impressions ADD COLUMN timestamp TIMESTAMPTZ DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'post_impressions' AND column_name = 'created_at') THEN
        ALTER TABLE post_impressions ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Step 3: Test the setup with sample data
-- Test visitor session creation
INSERT INTO visitor_sessions (
    session_id,
    ip_address,
    user_agent,
    device_type,
    browser,
    os,
    first_visit,
    last_visit,
    visit_count
) VALUES (
    'test-debug-session-456',
    '127.0.0.1',
    'Debug Browser',
    'desktop',
    'chrome',
    'windows',
    NOW(),
    NOW(),
    1
) ON CONFLICT (session_id) DO UPDATE SET
    last_visit = NOW(),
    visit_count = visitor_sessions.visit_count + 1;

-- Test post impression creation
INSERT INTO post_impressions (
    session_id,
    post_id,
    post_slug,
    view_duration,
    scroll_depth,
    is_bounce,
    timestamp
) VALUES (
    'test-debug-session-456',
    '1',
    'debug-post',
    0,
    0,
    false,
    NOW()
) ON CONFLICT DO NOTHING;

-- Step 4: Verify the data was inserted
SELECT 'VISITOR_SESSION_TEST' as test_type, session_id, ip_address::text as ip, visit_count::text as count
FROM visitor_sessions 
WHERE session_id = 'test-debug-session-456';

SELECT 'POST_IMPRESSION_TEST' as test_type, session_id, post_id, scroll_depth::text as scroll
FROM post_impressions 
WHERE session_id = 'test-debug-session-456';

-- Step 5: Clean up test data
DELETE FROM post_impressions WHERE session_id = 'test-debug-session-456';
DELETE FROM visitor_sessions WHERE session_id = 'test-debug-session-456';

-- Step 6: Show final table structures
SELECT 
    'visitor_sessions' as table_name,
    column_name,
    data_type,
    is_nullable,
    COALESCE(column_default, 'NULL') as column_default
FROM information_schema.columns 
WHERE table_name = 'visitor_sessions'
ORDER BY ordinal_position;

SELECT 
    'post_impressions' as table_name,
    column_name,
    data_type,
    is_nullable,
    COALESCE(column_default, 'NULL') as column_default
FROM information_schema.columns 
WHERE table_name = 'post_impressions'
ORDER BY ordinal_position;

-- Success message
SELECT 'VISITOR TRACKING SETUP COMPLETE! ✅' as status;
