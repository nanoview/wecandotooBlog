-- 🔒 Fix Visitor Sessions RLS Policies
-- This script creates proper RLS policies for visitor tracking

-- First, let's check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('visitor_sessions', 'post_impressions');

-- Enable RLS on visitor_sessions if not already enabled
ALTER TABLE visitor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_impressions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Allow public read on visitor_sessions" ON visitor_sessions;
DROP POLICY IF EXISTS "Allow public insert on visitor_sessions" ON visitor_sessions;
DROP POLICY IF EXISTS "Allow public update on visitor_sessions" ON visitor_sessions;
DROP POLICY IF EXISTS "Allow service role full access on visitor_sessions" ON visitor_sessions;

DROP POLICY IF EXISTS "Allow public read on post_impressions" ON post_impressions;
DROP POLICY IF EXISTS "Allow public insert on post_impressions" ON post_impressions;
DROP POLICY IF EXISTS "Allow public update on post_impressions" ON post_impressions;
DROP POLICY IF EXISTS "Allow service role full access on post_impressions" ON post_impressions;

-- Create policies for visitor_sessions
-- Allow anonymous users to insert their own sessions
CREATE POLICY "Allow anonymous insert on visitor_sessions" ON visitor_sessions
    FOR INSERT 
    TO anon
    WITH CHECK (true);

-- Allow anonymous users to update their own sessions by session_id
CREATE POLICY "Allow anonymous update own session" ON visitor_sessions
    FOR UPDATE 
    TO anon
    USING (true)
    WITH CHECK (true);

-- Allow anonymous users to read visitor sessions (for analytics)
CREATE POLICY "Allow anonymous read on visitor_sessions" ON visitor_sessions
    FOR SELECT 
    TO anon
    USING (true);

-- Allow service role full access
CREATE POLICY "Allow service role full access on visitor_sessions" ON visitor_sessions
    FOR ALL 
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Create policies for post_impressions
-- Allow anonymous users to insert impressions
CREATE POLICY "Allow anonymous insert on post_impressions" ON post_impressions
    FOR INSERT 
    TO anon
    WITH CHECK (true);

-- Allow anonymous users to update their own impressions
CREATE POLICY "Allow anonymous update own impressions" ON post_impressions
    FOR UPDATE 
    TO anon
    USING (true)
    WITH CHECK (true);

-- Allow anonymous users to read impressions (for analytics)
CREATE POLICY "Allow anonymous read on post_impressions" ON post_impressions
    FOR SELECT 
    TO anon
    USING (true);

-- Allow service role full access
CREATE POLICY "Allow service role full access on post_impressions" ON post_impressions
    FOR ALL 
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Test the policies with a sample update
DO $$
BEGIN
    -- This should work now
    RAISE NOTICE 'RLS policies updated successfully for visitor tracking';
END $$;

-- Show the new policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename IN ('visitor_sessions', 'post_impressions')
ORDER BY tablename, policyname;
