-- Create email_checks table for storing email monitoring data
-- This table tracks email checking activities and results

CREATE TABLE IF NOT EXISTS email_checks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    target_email TEXT NOT NULL DEFAULT 'hello@wecandotoo.com',
    total_count INTEGER NOT NULL DEFAULT 0,
    unread_count INTEGER NOT NULL DEFAULT 0,
    last_checked TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    email_data JSONB,
    checked_via TEXT NOT NULL DEFAULT 'zoho_imap',
    success BOOLEAN NOT NULL DEFAULT true,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_checks_target_email ON email_checks(target_email);
CREATE INDEX IF NOT EXISTS idx_email_checks_last_checked ON email_checks(last_checked);
CREATE INDEX IF NOT EXISTS idx_email_checks_created_at ON email_checks(created_at);

-- Create RLS policies
ALTER TABLE email_checks ENABLE ROW LEVEL SECURITY;

-- Policy: Admin users can view all email checks
CREATE POLICY "Admin can view email checks" ON email_checks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Policy: Admin users can insert email checks
CREATE POLICY "Admin can insert email checks" ON email_checks
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Policy: Service role can do everything (for Edge Functions)
CREATE POLICY "Service role full access" ON email_checks
    FOR ALL USING (auth.role() = 'service_role');

-- Create a view for the latest email check per target email
CREATE OR REPLACE VIEW latest_email_checks AS
SELECT DISTINCT ON (target_email) 
    id,
    target_email,
    total_count,
    unread_count,
    last_checked,
    email_data,
    checked_via,
    success,
    error_message,
    created_at
FROM email_checks
ORDER BY target_email, last_checked DESC;

-- Create a function to get email statistics
CREATE OR REPLACE FUNCTION get_email_stats(target_email_param TEXT DEFAULT 'hello@wecandotoo.com')
RETURNS TABLE (
    total_emails BIGINT,
    unread_emails BIGINT,
    last_check TIMESTAMPTZ,
    checks_today INTEGER,
    average_emails_per_check NUMERIC
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(MAX(ec.total_count), 0)::BIGINT as total_emails,
        COALESCE(MAX(ec.unread_count), 0)::BIGINT as unread_emails,
        MAX(ec.last_checked) as last_check,
        COUNT(CASE WHEN ec.created_at::date = CURRENT_DATE THEN 1 END)::INTEGER as checks_today,
        COALESCE(AVG(ec.total_count), 0)::NUMERIC as average_emails_per_check
    FROM email_checks ec
    WHERE ec.target_email = target_email_param
    AND ec.success = true;
END;
$$;

-- Create a function to clean up old email check data (keep last 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_email_checks()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM email_checks 
    WHERE created_at < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$;

-- Insert some sample data for testing
INSERT INTO email_checks (
    target_email,
    total_count,
    unread_count,
    last_checked,
    email_data,
    checked_via,
    success
) VALUES (
    'hello@wecandotoo.com',
    3,
    2,
    NOW() - INTERVAL '1 hour',
    '[
        {
            "id": "sample_1",
            "subject": "Sample Email Check",
            "from": "test@example.com",
            "to": "hello@wecandotoo.com",
            "date": "2025-08-13T10:00:00Z",
            "snippet": "This is a sample email from the initial setup",
            "isUnread": true
        }
    ]'::jsonb,
    'setup_sample',
    true
) ON CONFLICT DO NOTHING;

-- Grant necessary permissions
GRANT ALL ON TABLE email_checks TO anon, authenticated, service_role;
GRANT ALL ON TABLE latest_email_checks TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_email_stats TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION cleanup_old_email_checks TO service_role;

-- Create a trigger to update updated_at on changes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_email_checks_updated_at 
    BEFORE UPDATE ON email_checks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE email_checks IS 'Stores email checking activity and results from various providers';
COMMENT ON COLUMN email_checks.target_email IS 'The email address being monitored (default: hello@wecandotoo.com)';
COMMENT ON COLUMN email_checks.email_data IS 'JSON array containing the actual email data retrieved';
COMMENT ON COLUMN email_checks.checked_via IS 'Method used to check emails (zoho_imap, gmail_api, webhook, etc.)';
COMMENT ON FUNCTION get_email_stats IS 'Returns email statistics for a given target email address';
COMMENT ON FUNCTION cleanup_old_email_checks IS 'Removes email check records older than 30 days';
