-- 🚀 QUICK DEPLOY: Visitor Analytics Tables
-- Copy and paste this entire SQL into your Supabase SQL Editor

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
    device_type VARCHAR(50),
    browser VARCHAR(100),
    os VARCHAR(100),
    referrer TEXT,
    first_visit TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_visit TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    visit_count INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create post_impressions table
CREATE TABLE IF NOT EXISTS post_impressions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) REFERENCES visitor_sessions(session_id) ON DELETE CASCADE,
    post_id INTEGER REFERENCES blog_posts(id) ON DELETE CASCADE,
    post_slug VARCHAR(255),
    view_duration INTEGER DEFAULT 0,
    scroll_depth INTEGER DEFAULT 0,
    is_bounce BOOLEAN DEFAULT false,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create visitor_analytics_summary table
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

-- 4. Create indexes
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_session_id ON visitor_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_created_at ON visitor_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_post_impressions_session_id ON post_impressions(session_id);
CREATE INDEX IF NOT EXISTS idx_post_impressions_post_id ON post_impressions(post_id);

-- 5. Enable RLS
ALTER TABLE visitor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_analytics_summary ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies (admin only)
DROP POLICY IF EXISTS "Admin can view all visitor sessions" ON visitor_sessions;
CREATE POLICY "Admin can view all visitor sessions" ON visitor_sessions 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM user_roles ur 
        JOIN auth.users u ON u.email = ur.user_id::text 
        WHERE u.id = auth.uid() AND ur.role = 'admin'
    )
);

DROP POLICY IF EXISTS "Admin can view all post impressions" ON post_impressions;
CREATE POLICY "Admin can view all post impressions" ON post_impressions 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM user_roles ur 
        JOIN auth.users u ON u.email = ur.user_id::text 
        WHERE u.id = auth.uid() AND ur.role = 'admin'
    )
);

DROP POLICY IF EXISTS "Admin can view analytics summary" ON visitor_analytics_summary;
CREATE POLICY "Admin can view analytics summary" ON visitor_analytics_summary 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM user_roles ur 
        JOIN auth.users u ON u.email = ur.user_id::text 
        WHERE u.id = auth.uid() AND ur.role = 'admin'
    )
);

-- 7. Allow Edge Functions to insert data (service role access)
DROP POLICY IF EXISTS "Service role can insert visitor sessions" ON visitor_sessions;
CREATE POLICY "Service role can insert visitor sessions" ON visitor_sessions 
FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can update visitor sessions" ON visitor_sessions;
CREATE POLICY "Service role can update visitor sessions" ON visitor_sessions 
FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Service role can insert post impressions" ON post_impressions;
CREATE POLICY "Service role can insert post impressions" ON post_impressions 
FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can update post impressions" ON post_impressions;
CREATE POLICY "Service role can update post impressions" ON post_impressions 
FOR UPDATE USING (true);

-- ✅ DONE! Your visitor analytics tables are now ready!
