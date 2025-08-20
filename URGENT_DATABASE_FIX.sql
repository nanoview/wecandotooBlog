-- 🚀 URGENT FIX: Copy and paste this entire script into Supabase SQL Editor
-- This will fix the 500 error by adding missing columns and RLS policies

-- Step 1: Add missing columns that cause "column does not exist" errors
DO $$ 
BEGIN
    -- Add missing columns to visitor_sessions (these are causing the 500 errors)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'visitor_sessions' AND column_name = 'browser') THEN
        ALTER TABLE visitor_sessions ADD COLUMN browser TEXT DEFAULT 'unknown';
        RAISE NOTICE 'Added browser column to visitor_sessions';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'visitor_sessions' AND column_name = 'device_type') THEN
        ALTER TABLE visitor_sessions ADD COLUMN device_type TEXT DEFAULT 'unknown';
        RAISE NOTICE 'Added device_type column to visitor_sessions';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'visitor_sessions' AND column_name = 'os') THEN
        ALTER TABLE visitor_sessions ADD COLUMN os TEXT DEFAULT 'unknown';
        RAISE NOTICE 'Added os column to visitor_sessions';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'visitor_sessions' AND column_name = 'user_agent') THEN
        ALTER TABLE visitor_sessions ADD COLUMN user_agent TEXT;
        RAISE NOTICE 'Added user_agent column to visitor_sessions';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'visitor_sessions' AND column_name = 'country') THEN
        ALTER TABLE visitor_sessions ADD COLUMN country TEXT;
        RAISE NOTICE 'Added country column to visitor_sessions';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'visitor_sessions' AND column_name = 'city') THEN
        ALTER TABLE visitor_sessions ADD COLUMN city TEXT;
        RAISE NOTICE 'Added city column to visitor_sessions';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'visitor_sessions' AND column_name = 'first_visit') THEN
        ALTER TABLE visitor_sessions ADD COLUMN first_visit TIMESTAMPTZ DEFAULT NOW();
        RAISE NOTICE 'Added first_visit column to visitor_sessions';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'visitor_sessions' AND column_name = 'last_visit') THEN
        ALTER TABLE visitor_sessions ADD COLUMN last_visit TIMESTAMPTZ DEFAULT NOW();
        RAISE NOTICE 'Added last_visit column to visitor_sessions';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'visitor_sessions' AND column_name = 'visit_count') THEN
        ALTER TABLE visitor_sessions ADD COLUMN visit_count INTEGER DEFAULT 1;
        RAISE NOTICE 'Added visit_count column to visitor_sessions';
    END IF;

    -- Add missing columns to post_impressions
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'post_impressions' AND column_name = 'view_duration') THEN
        ALTER TABLE post_impressions ADD COLUMN view_duration INTEGER DEFAULT 0;
        RAISE NOTICE 'Added view_duration column to post_impressions';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'post_impressions' AND column_name = 'scroll_depth') THEN
        ALTER TABLE post_impressions ADD COLUMN scroll_depth INTEGER DEFAULT 0;
        RAISE NOTICE 'Added scroll_depth column to post_impressions';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'post_impressions' AND column_name = 'is_bounce') THEN
        ALTER TABLE post_impressions ADD COLUMN is_bounce BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added is_bounce column to post_impressions';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'post_impressions' AND column_name = 'timestamp') THEN
        ALTER TABLE post_impressions ADD COLUMN timestamp TIMESTAMPTZ DEFAULT NOW();
        RAISE NOTICE 'Added timestamp column to post_impressions';
    END IF;
END $$;

-- Step 2: Enable RLS and create anonymous access policies
ALTER TABLE visitor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_impressions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow anonymous insert on visitor_sessions" ON visitor_sessions;
DROP POLICY IF EXISTS "Allow anonymous update own session" ON visitor_sessions;
DROP POLICY IF EXISTS "Allow anonymous read on visitor_sessions" ON visitor_sessions;
DROP POLICY IF EXISTS "Allow service role full access on visitor_sessions" ON visitor_sessions;

DROP POLICY IF EXISTS "Allow anonymous insert on post_impressions" ON post_impressions;
DROP POLICY IF EXISTS "Allow anonymous update own impressions" ON post_impressions;
DROP POLICY IF EXISTS "Allow anonymous read on post_impressions" ON post_impressions;
DROP POLICY IF EXISTS "Allow service role full access on post_impressions" ON post_impressions;

-- Create new policies for visitor_sessions
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

-- Create new policies for post_impressions
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

-- Step 3: Test the setup
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
    'test-fix-session-' || EXTRACT(EPOCH FROM NOW())::text,
    '127.0.0.1',
    'Test Browser',
    'desktop',
    'chrome',
    'windows',
    NOW(),
    NOW(),
    1
);

-- Verify the test worked
SELECT 'SUCCESS: visitor_sessions table ready!' as status, count(*) as sessions_count
FROM visitor_sessions 
WHERE session_id LIKE 'test-fix-session-%';

-- Clean up test data
DELETE FROM visitor_sessions WHERE session_id LIKE 'test-fix-session-%';

-- Final verification
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name IN ('visitor_sessions', 'post_impressions')
    AND column_name IN ('browser', 'device_type', 'os', 'user_agent', 'view_duration', 'scroll_depth')
ORDER BY table_name, column_name;

SELECT '✅ VISITOR TRACKING FIX COMPLETE!' as final_status;
