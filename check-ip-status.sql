-- Check current visitor sessions and their IP addresses
-- Run this in Supabase SQL Editor to see what IPs are being stored

SELECT 
    session_id,
    ip_address,
    device_type,
    browser,
    os,
    country,
    city,
    created_at,
    CASE 
        WHEN ip_address = '0.0.0.0' THEN '❌ Zero IP'
        WHEN ip_address = 'unknown' THEN '⚠️ Unknown'
        WHEN ip_address = 'mobile-device' THEN '📱 Mobile Fallback'
        WHEN ip_address ~ '^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$' THEN '✅ Valid IP'
        ELSE '🔍 Other: ' || ip_address
    END as ip_status
FROM visitor_sessions 
ORDER BY created_at DESC 
LIMIT 20;

-- Summary statistics
SELECT 
    COUNT(*) as total_sessions,
    COUNT(CASE WHEN ip_address = '0.0.0.0' THEN 1 END) as zero_ip_count,
    COUNT(CASE WHEN ip_address != '0.0.0.0' AND ip_address != 'unknown' THEN 1 END) as valid_ip_count,
    ROUND(
        COUNT(CASE WHEN ip_address != '0.0.0.0' AND ip_address != 'unknown' THEN 1 END) * 100.0 / COUNT(*), 
        2
    ) as valid_ip_percentage
FROM visitor_sessions 
WHERE created_at > NOW() - INTERVAL '24 hours';

-- Device type breakdown
SELECT 
    device_type,
    COUNT(*) as sessions,
    COUNT(CASE WHEN ip_address = '0.0.0.0' THEN 1 END) as zero_ip_sessions,
    ROUND(
        COUNT(CASE WHEN ip_address = '0.0.0.0' THEN 1 END) * 100.0 / COUNT(*), 
        2
    ) as zero_ip_percentage
FROM visitor_sessions 
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY device_type
ORDER BY sessions DESC;
