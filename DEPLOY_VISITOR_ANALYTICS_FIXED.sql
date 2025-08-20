-- 🚀 FIXED: Visitor Analytics Database Schema
-- This version handles both UUID and INTEGER post IDs

-- 1. Create visitor_sessions table
CREATE TABLE IF NOT EXISTS visitor_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) UNIQUE NOT NULL,
    ip_address INET NOT NULL,
    user_agent TEXT,
    country VARCHAR(100),
    country_code VARCHAR(2),
    region VARCHAR(100),
    city VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    timezone VARCHAR(100),
    isp VARCHAR(255),
    device_type VARCHAR(50), -- 'desktop', 'mobile', 'tablet'
    browser VARCHAR(100),
    os VARCHAR(100),
    referrer TEXT,
    first_visit TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_visit TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    visit_count INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create post_impressions table (NO foreign key constraint to avoid type issues)
CREATE TABLE IF NOT EXISTS post_impressions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) REFERENCES visitor_sessions(session_id) ON DELETE CASCADE,
    post_id VARCHAR(50), -- Store as string to handle both UUID and INTEGER
    post_slug VARCHAR(255),
    post_title TEXT, -- Store title for quick access
    view_duration INTEGER DEFAULT 0, -- seconds spent on page
    scroll_depth INTEGER DEFAULT 0, -- percentage of page scrolled
    is_bounce BOOLEAN DEFAULT false, -- true if user left immediately
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create visitor_analytics_summary table for quick stats
CREATE TABLE IF NOT EXISTS visitor_analytics_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL UNIQUE,
    total_visitors INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    page_views INTEGER DEFAULT 0,
    bounce_rate DECIMAL(5, 2) DEFAULT 0,
    avg_session_duration INTEGER DEFAULT 0,
    top_countries JSONB DEFAULT '[]'::jsonb,
    top_posts JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_session_id ON visitor_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_created_at ON visitor_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_country ON visitor_sessions(country);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_ip ON visitor_sessions(ip_address);

CREATE INDEX IF NOT EXISTS idx_post_impressions_session_id ON post_impressions(session_id);
CREATE INDEX IF NOT EXISTS idx_post_impressions_post_id ON post_impressions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_impressions_post_slug ON post_impressions(post_slug);
CREATE INDEX IF NOT EXISTS idx_post_impressions_timestamp ON post_impressions(timestamp);

CREATE INDEX IF NOT EXISTS idx_analytics_summary_date ON visitor_analytics_summary(date);

-- 5. Enable RLS (Row Level Security)
ALTER TABLE visitor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_analytics_summary ENABLE ROW LEVEL SECURITY;

-- 6. Drop existing policies if they exist
DROP POLICY IF EXISTS "Admin can view all visitor sessions" ON visitor_sessions;
DROP POLICY IF EXISTS "Admin can view all post impressions" ON post_impressions;
DROP POLICY IF EXISTS "Admin can view analytics summary" ON visitor_analytics_summary;
DROP POLICY IF EXISTS "Service role can insert visitor sessions" ON visitor_sessions;
DROP POLICY IF EXISTS "Service role can update visitor sessions" ON visitor_sessions;
DROP POLICY IF EXISTS "Service role can insert post impressions" ON post_impressions;
DROP POLICY IF EXISTS "Service role can update post impressions" ON post_impressions;

-- 7. Create RLS policies (admin only access for viewing)
CREATE POLICY "Admin can view all visitor sessions" ON visitor_sessions 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM user_roles ur 
        JOIN auth.users u ON u.email = ur.user_id::text 
        WHERE u.id = auth.uid() AND ur.role = 'admin'
    )
);

CREATE POLICY "Admin can view all post impressions" ON post_impressions 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM user_roles ur 
        JOIN auth.users u ON u.email = ur.user_id::text 
        WHERE u.id = auth.uid() AND ur.role = 'admin'
    )
);

CREATE POLICY "Admin can view analytics summary" ON visitor_analytics_summary 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM user_roles ur 
        JOIN auth.users u ON u.email = ur.user_id::text 
        WHERE u.id = auth.uid() AND ur.role = 'admin'
    )
);

-- 8. Allow Edge Functions to insert/update data (service role access)
CREATE POLICY "Service role can insert visitor sessions" ON visitor_sessions 
FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can update visitor sessions" ON visitor_sessions 
FOR UPDATE USING (true);

CREATE POLICY "Service role can insert post impressions" ON post_impressions 
FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can update post impressions" ON post_impressions 
FOR UPDATE USING (true);

CREATE POLICY "Service role can insert analytics summary" ON visitor_analytics_summary 
FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can update analytics summary" ON visitor_analytics_summary 
FOR UPDATE USING (true);

-- 9. Create function to update visitor analytics summary daily
CREATE OR REPLACE FUNCTION update_visitor_analytics_summary()
RETURNS void AS $$
DECLARE
    summary_date DATE := CURRENT_DATE;
BEGIN
    INSERT INTO visitor_analytics_summary (
        date,
        total_visitors,
        unique_visitors,
        page_views,
        bounce_rate,
        avg_session_duration,
        top_countries,
        top_posts
    )
    SELECT
        summary_date,
        COUNT(*) as total_visitors,
        COUNT(DISTINCT session_id) as unique_visitors,
        (SELECT COUNT(*) FROM post_impressions WHERE DATE(timestamp) = summary_date) as page_views,
        COALESCE(
            ROUND(
                (COUNT(*) FILTER (WHERE visit_count = 1))::DECIMAL / NULLIF(COUNT(*), 0) * 100, 
                2
            ), 
            0
        ) as bounce_rate,
        COALESCE(ROUND(AVG(EXTRACT(EPOCH FROM (last_visit - first_visit)))), 0) as avg_session_duration,
        COALESCE(
            (SELECT json_agg(json_build_object('country', country, 'count', country_count))
             FROM (
                 SELECT country, COUNT(*) as country_count
                 FROM visitor_sessions 
                 WHERE DATE(created_at) = summary_date AND country IS NOT NULL
                 GROUP BY country
                 ORDER BY country_count DESC
                 LIMIT 10
             ) top_countries_data),
            '[]'::json
        )::jsonb as top_countries,
        COALESCE(
            (SELECT json_agg(json_build_object('post_slug', post_slug, 'title', post_title, 'views', view_count))
             FROM (
                 SELECT post_slug, post_title, COUNT(*) as view_count
                 FROM post_impressions
                 WHERE DATE(timestamp) = summary_date AND post_slug IS NOT NULL
                 GROUP BY post_slug, post_title
                 ORDER BY view_count DESC
                 LIMIT 10
             ) top_posts_data),
            '[]'::json
        )::jsonb as top_posts
    FROM visitor_sessions
    WHERE DATE(created_at) = summary_date
    ON CONFLICT (date) DO UPDATE SET
        total_visitors = EXCLUDED.total_visitors,
        unique_visitors = EXCLUDED.unique_visitors,
        page_views = EXCLUDED.page_views,
        bounce_rate = EXCLUDED.bounce_rate,
        avg_session_duration = EXCLUDED.avg_session_duration,
        top_countries = EXCLUDED.top_countries,
        top_posts = EXCLUDED.top_posts,
        updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- 10. Add comments for documentation
COMMENT ON TABLE visitor_sessions IS 'Stores visitor session data including IP, location, and device info';
COMMENT ON TABLE post_impressions IS 'Tracks individual post views and engagement metrics (flexible post_id type)';
COMMENT ON TABLE visitor_analytics_summary IS 'Daily aggregated analytics data for quick reporting';

-- ✅ DEPLOYMENT COMPLETE!
-- This schema avoids foreign key type conflicts by using flexible post_id storage
-- and provides comprehensive visitor analytics tracking.
