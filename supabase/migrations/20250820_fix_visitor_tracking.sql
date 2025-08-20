-- Fix visitor tracking database schema and RLS policies
-- This migration adds all missing columns and sets up proper RLS policies

-- Enable RLS on visitor_sessions and post_impressions
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

-- Add all missing columns that the visitor tracking system expects
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
